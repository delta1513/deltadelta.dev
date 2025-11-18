---
title: Incident stories - Lambda Memory Pressure
description: An alternative cure for depression
layout: blog-base.njk
---

One thing I love about my job are the opportunities I get to work with huge and complicated infrastructure in the cloud. What makes it fun for me is scaling this infrastructure to solve commercial-grade problems and the issues that show up as a result of that. You don't usually get that opportunity as a hobbyist, and you certainly won't have the cash flow to be able to invest in that sort of infra on your own, which is why I find it quite the delicacy to work on.

The main fun I find is in the issues that show up, and because a lot of this stuff is proprietary and so abstracted away, it is often a game of cat and mouse to try and find exactly what's going wrong and why. Along this journey, I usually end up digging down to much lower layers of computing and also taking detours through the history of computing. This is what I find thrilling about my work.

There was one incident that I was paged on recently, and I found it so satisfying to solve that I wanted to talk about it here.

---

So let's set the scene...

It's during the day on a Monday and I get pinged a few times from our #incidents channel and via our paging software. I hit ACK and then take a little peek at what's going on. During this time there are some lower-urgency alarms that seem related.

Here's the run-down:
- The high-urgency alarms were reporting errors in asynchronous AWS lambda functions
- The low urgency alarms were reporting that the average execution time of some lambda functions were about to breach the timeout threshold
- These alarms were for different lambdas, but all were in the same micro-service

So I go and take a look at the logs...

I see a bit of this:

```
REPORT RequestId: 069c8528-5926-43e2-a016-66ceeb943a46	Duration: 300000.00 ms	Billed Duration: 300000 ms Memory Size: 128 MB	Max Memory Used: 127 MB	Status: timeout
```

## Small detour - The effects of a lambda timeout

AWS lambda timeouts are, what I call, a "lambda-level" or "infra-level" error.

A more technical definition would be: If a lambda-level error were to occur, it would become an error metric in cloudwatch.

These infra-level errors can occur from the following:
- Timeouts of the lambda function
- OOM errors from lambda
- **Unhandled** exceptions in your code that runs on lambda
- An error with IAM permissions with the underlying AWS calls that interact with the lambda service

And an important distinction that I always like to make is that a **handled** exception in your code, even if it is a failure case for your application, will cause the lambda execution to succeed.

Now lambda functions can be called synchronously or asynchronously. This is a fairly simple concept on the surface, but when it comes to exception handling, it gets complicated, especially if you are using event sources. Put simply, this is how lambda would handle infra-level errors in its different execution modes:
- In synchronous mode: The handling of the exception is the responsibility of the caller
- In asynchronous mode: The lambda function will retry a few times (I think 2 times) before giving up and then calling its DLQ handler

Where I work, we use the self-managed Kafka event source for AWS lambda, and if you go and read the docs for it, you will find some docs that will probably explain this sort of behaviour to you:
- The self-managed Kafka event source executes lambda functions in synchronous mode
- If the lambda execution fails, then the Kafka topic offset for the consumer is not incremented and the execution is retried until it succeeds
- If the execution that failed contained a batch of messages, the whole message batch will be retried (even if some messages succeeded in execution during the original run)

And this is why you should strive to keep everything you build idempotent, especially in a micro-services architecture.

## Out of the detour and back to the incident...

So this incident was interesting because these errors were sporadic. Sometimes the function would execute just fine in a couple hundred milliseconds, and other times it would just straight up time-out.

Looking closer at the logs, I see a lot of messages from the Kafka client we use for connecting to the cluster to push messages to topics:

```
%5|1763355988.132|REQTMOUT|rdkafka#producer-1| [thrd:sasl_ssl://REDACTED:9092]: sasl_ssl://REDACTED:9092/0: Timed out MetadataRequest in flight (after 243540ms, timeout #0)
```

These all came just before the function timed-out, and if you carefully count the seconds that pass in each log line, you will find that these messages take up the majority of the function execution.

## Another small detour - How librdkafka works

Now for the record, I am no expert in this software, but I've worked on issues like this enough to think I have a decent grasp on the behaviours here.

librdkafka is the underlying process that manages the client interactions with the Kafka cluster. It's kind-of like a middle-man between your Kafka client in the code and the Kafka cluster itself.

So your code will use a client to talk to librdkafka that's running asynchronously in the background and librdkafka will then talk to your Kafka cluster. This lets you do some cool stuff like asynchronously push messages to a Kafka topic without having to implement concurrency in your code.

because librdkafka runs in the background, it has a lot of complicated behaviours associated with error handling and managing of messages which I'm not going to get into.

But probably the most important idea I want to discuss is the `.flush()` method in the producer client.

If you've ever worked with asynchronous code before, this might be familiar to you, and you could probably guess that `.flush()` is a blocking call which waits for some set of asynchronous tasks to complete. In the case of librdkafka, it will block until all messages are successfully produced in the Kafka topic.

## So what does that mean for us?

In our code, especially in our micro-services, we like to use `.flush()` a lot because every serverless runtime is ephemeral. We can't trust that the runtime environment will be alive after the execution completes so we need to do everything within that timeout or risk undefined behaviours.

So it makes a lot of sense if there are a lot of those request timeout messages from librdkafka that it could push a lambda function to time-out if message delivery fails.

So why did it time-out?

---

Not sure if you can relate, but I reckon the best type of problem to have in software engineering is when something doesn't work, and it isn't working for 100% of the time/cases. It's usually really clear and easy to find what is going wrong since the problem is typically something binary and easy to spot.

When things go wrong for **<100%** of the time, then it becomes an ultimate quest across the sea of potential issues, and often could lead you down some pretty annoying rabbit holes.

Whenever I get a problem like this I don't start with assumptions, and instead, I look for understanding. One of my strategies is to look for patterns, and in this case, we know the following:
- It happens only in production
- It happens only for one micro-service
- It happens for some lambda functions and not others
- There are no unhandled exceptions during execution

So this can rule out a few things:
- It rules-out potential outages or service degradations at third-parties (we have other micro-services that do the same thing)
- It rules-out an infra-level problem since the issue is isolated to a single service (and we use Terraform to manage state)
- It rules-out an application-level errors since there are none, and the majority of the time taken is from librdkafka. So it probably isn't an issue with the actual code we have written.

Next most obvious thing to look at are recent production deployments. 

And guess what, there was one around the time where all this started!

Taking a look through the changes and everything seems pretty normal. Other than actual code changes, we have some extra things like:
- Changing a configuration file
- Adding some new dependencies
- Updating some packages
- Adding some new infra

What caught my eye earlier was this part of the lambda REPORT log: `Memory Size: 128 MB	Max Memory Used: 127 MB`

This is a little concerning, but we've had lambdas run like this for a while just fine.

I don't know if you've watched your memory usage closely during times you are using your computer and stuff starts running REALLY slowly. I've had my fair share of Firefox memory leaks that caused this behaviour, and there's a few terms for it: I like to use the term "thrashing", but this usually refers to the interactions between virtual memory and system swap, so for this article, I'm going to call it "memory pressure"

## How many detours now? - About memory pressure

So on your computer, you probably have some RAM chips and also some swap space on your hard drive/SSD. This is the physical memory you have on your computer.

If your computer were to only use physical memory, then there would be an upper limit to the things you can have open at one time. Eventually Chrome will refuse to open a new tab, applications wouldn't open unless you close an existing one, and apps that are REALLY REALLY big, like some video games, just probably wouldn't even be able to run.

But we are humans, and humans are not really that good at multi-tasking. So why do you need everything open and running anyway?

This is the art of virtual memory management!

Virtual memory is the method that most modern computers use to manage tasks that don't need to be running right now. Imagine you had the entire addressable memory space at your fingertips, or for the case for your CPU, on its system bus. For 64-bits, I'm sure you know already that this is A LOT of memory.

Now while you are watching youtube, you won't need to check your calendar app, right? So we don't need the calendar app in memory (even though it's actively running). So instead, we keep it in virtual memory by reserving some space for it.

So when you finish watching your youtube video and remember that you have something important this afternoon but can't remember what it is, you will open your calendar app.

What will happen in the background is your OS will find the pages in virtual memory that belong to the calendar app, and then slowly bring all of its binary back into RAM so that it can be executed.

All is well and good so far.

But then you get a message from your friend reminding you about something you're doing tomorrow, and it's not on your calendar yet! So you start making a new event for tomorrow by clicking the + button in the UI. But you notice it takes a little while to do this.

It seems that your RAM is almost full! Chrome is taking up a lot of your RAM, but now that you aren't watching youtube anymore and Chrome is minimised, your OS thinks it can safely remove those pages from memory since the process is not actively using them.

So bit-by-bit, your OS will take those memory pages out of physical memory and either completely remove them, or if you have swap space, store them in swap. But this is almost entirely up to the running process to tell the OS which pages it needs and which it doesn't.

So there's a bit of chugging, and your laptop fans sound like an F1 car, but eventually the UI opens and you can make the event.

This is what memory pressure is like at the OS level.

## So how does lambda handle memory pressure?

Lambda has as much memory as you want to give it (within the limits of the infra), and in our case, it's not a lot (128MB).

Now I'm not sure whether the lambda runtime actually uses virtual memory at all, but the principle remains the same. If there are too many things actively needed in memory, then the runtime will find it hard to make more space, and it can take the underlying OS some time to resolve that for your program.

So much time in fact, that it might cause a HTTP timeout... ;)

Making a new connection over the internet requires memory. You need to store a buffer that contains the stuff you are receiving and also the stuff you are sending. This needs to be dynamic because you have no idea how much data you are actually going to receive from the server.

If you can't allocate the memory for this socket, or if you need to receive some more data and you can't allocate anymore memory in your buffer, then your program will halt until it receives a response from the syscall to the OS to allocate that memory. Sometimes that syscall can take an undefined amount of time, and sometimes it will straight-up tell you that it can't.

## Putting the pieces together

This explanation was almost perfect for this particular incident.

Only one problem: There was nothing backing it up except **"It came to me in a dream"**

I needed evidence, and thankfully, it was pretty easy to get.

So I know for a fact that for some lambda functions, we give them more memory than others. So I simply had to look at the logs for those and see if there was any major increase in those librdkafka messages in the last day or so. Then obviously compare that with the problematic ones.

Turns out, there was a significant difference!

It also turns out that the new package that was added to the codebase in that production deployment included a 1.5MB binary, which doesn't sound like a lot, but considering the 128MB limit, it was more than enough to push it over the edge!

So the solution was simple: Double the RAM for all lambdas in the service!

...and subsequently double the costs!

---

Wow that was a lot! I didn't even realise I was writing that much.

I hope you enjoyed this journey as much as I did and maybe this helps you with either something you are working on or gives you something interesting to look deeper into.