---
title: The Art Of Deployment
description: A journey through everything that I know about deploying software
layout: markdown.njk
date: 2026-08-13
---

# A Short Preface

The idea for this blog article came to me when I was using an AI agent [gas town](https://yegge.ai/gastown) at work one day. Part of me stopped to wonder about something that made tangent with my thoughts.

A lot of what I enjoy working on is something that runs without much intervention. Something that completes a repeatable task without any manual input from a human. Take for example, the time where I often had to manually deploy a system at work by shelling-into an EC2 instance, and later I had worked out a way to deploy it automatically after a PR merge. This I saw as my goal as a software engineer - find solutions to repeatable problems.

But some of these problems are far more rare than others. Consider parts of your codebase that go untouched for eons until something breaks on a layer deep enough. Think about that Nginx instance that sits between the LB and your app on a unix socket. Think about the authentication backend in your Django app. These are rare problems that seem to often be solved once, and for good, and very rarely we work on them or improve them because they are already good enough. These sorts of problems are what I enjoy. They provide a necessary, difficult challenge. Like where an answer is hidden deep within one particular interpretation of the AWS documentation, and there are no Medium posts that you can find about it. As if you are the only one with this problem in the entire world.

Problems like these are ones that I worry are going unspoken or documented in public discourse, yet they are so valuable in what they can teach. So I'd like to share an accumulation of some of this knowledge from the time I've been spending building software systems.

In this article, I will be taking you through some various types of deployment strategies that I've used in my career and personal projects simply because I enjoy talking about it.

# The VPS (or home linux box)

I've made plenty of systems that I've wanted to share with others. Whether it be a minecraft server, a website, a prototype, chat, tunnels, sockets, or anything, they've all required a machine with access to the public internet, and also the ability to open ports. This is what I think is the simplest form of deployment - you literally just run it on the host machine in a cloud environment or behind a NAT on a home network. 

It doesn't have to be pretty. Some of my first apps were systemd units that spun-up a Flask app. Others were frameworks that exposed a unix socket that was proxied through nginx to the public internet via a virtual host. The point of this section is to go into deep details about the 'bare app' and how it interacts with a multi-tenant host system - and also to reminisce in the beauty of such in the days of a handful of users, and often in situations where we could not isolate apps onto individual hosts!

Before I learned docker (this is probably around my time in, and a little after, university), I had already learned that user isolation was the biggest advantage that I had for operating software that could get breached. Whenever I started hosting a new project, I would set up a new user account on my linux host, and remove its sudo privileges. Then I would drop all the build files into the user home directory, and then run `screen` so that I can launch the server process without it terminating when I detatch my tty. If the project demanded a degree of seriousness, then I'd launch it with a systemd unit instead. Once I picked up docker, I then simply switched over to running `dockerd` to run my application images.

On my machine, I'd have a single nginx instance running on the bare metal. Then whenever I would want a new project, I would set it up with a static docker networking configuration and tell nginx, via a config file, to route all HTTP traffic to that docker container. Another important thing to note is the `Host` header handling for nginx. In order to manage multiple applications running on a single host, you would typically distinguish them as a "virtual host" by using the `server_name` directive. Here's a snippet of the config from one of my old projects:

```
    ...
    server_name lastfmwall.deltadelta.dev;

    location / {
        proxy_pass http://localhost:8784;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    ...
```

So basically, when nginx sees the `Host` header from the browser is set to `lastfmwall.deltadelta.dev`, and the request path is literally anything, it will pull up this configuration and then follow the directives in this file. After changing anything, you would need to make a softlink from this config in `/etc/nginx/sites-available/` to `/etc/nginx/sites-enabled/`. Then to check if everything is okay, run `nginx -t`, and then restart the nginx service (yes, this would mean a very slight blip in downtime. But I didn't have any serious users to make angry!). After this I would then set up an SSL configuration using `certbot` which would set up a free SSL certificate for me.

An advantage of this approach is that the firewall rules for this host machine are simple: Just open ports 80 and 443!

As you can see, this setup is tedious already, but it gets worse - we haven't even talked about deploying new versions of the project!

If you have some changes you need to push, often you would have to shell-into the instance, then log into the user account, then pull the new changes, kill the server, and then bring it back up. Docker makes this much easier - especially with `compose` - but it is functionally the same outcome. This, of course, means more downtime!

I'm sure that I could have automated this with something like Ansible or cron, but the stakes just weren't high enough, and also I didn't really update my apps that often. Additionally, letting CI somehow make changes to a persistent VPS instance seemed quite... quixotic...

I hope you can see a lot of problems with this approach. Namely:
- Downtime on every deploy
- Single-instance (zero scalability)
- Difficult to continuously deploy
- Mental load of remembering all the different software and how to deploy it

But none of this really matters. I'm able to host things for my friends, and set up self-hosted services for myself on my own hardware sitting in my room. Apart from electricity, this is free, and it also gets you to understand the plumbing of any software you are using, or might build later on in your career.

# AWS ECS + Fargate

One thing that gets me going is operating heavy machinery (although not the type of machinery you'd typically think of). I've often drooled at pictures of Cyclotrons, Quantum computers, Nuclear reactor cores, etc and said "wow, imagine working on one of those things!". These are truly remarkable machines of our time simply because of their rarity, and the precision necessary to operate and maintain these things. A similar story goes for AWS services, except you can't really see them (unless you consider the countless server racks in datacenters). Hopefully these upcoming sections will help you see some of the beauty I see in my mind.

AWS Elastic Container Service (ECS) is the service that is responsible for running and orchestrating "tasks". These tasks can be considered as an isolated, and infinitely reproducible instance of your application. The 'task definition' is sorta like a `docker compose` configuration. It is the document which defines a lot of different parameters, but most importantly:
- The docker images to run
- The computer resources that each container needs to run
- The environment variables that each container requires
- The networking between containers
- Which containers are critical (mark the task as unhealthy, and terminate it if exited) and what dependencies they have between them

In ECS, a full application is considered a "cluster". The cluster contains services that make up the application (for example, a front-end service and a back-end service), and each service contains a set of tasks. It looks a bit like this:

![](/media/art_of_deployment/ecs_cluster.png)

Now we haven't even talked about where this code is even running yet. Is it on a server? What kind? What OS is it running? Can you shell into it? - For the purposes of commercial software, most of the time, these questions are irrelevant - you simply need the code to run and be reachable. So that's kinda what fargate does.

Fargate is what I would describe as a VPS where you only have access to the containers that are running on it. It's kinda like a glorified "Docker compose as a service". Instead of asking what type of instance you want, you can just say "I need 12 instances, each with 2 CPU cores and 4GB RAM", and you'll get exactly that! Then what happens is the containers in your task definition will get loaded onto the fargate instances and start running. Magic!!!

We'll talk about auto-scaling soon, but for now, let's just imagine that we specifically 'desire' (AWS term) two tasks for BE and one for FE. When we do this, we will have a fargate instance assigned to each task with the specs defined in the task definition. AWS will manage the OS, OS updates, security patches, the docker runtime, networking, and anything else involved in providing this "docker compose as a service". So naturally, you can't shell into the OS, but you can shell-into one of the containers in your running task (like running `docker exec -it`).

So now we have a running application split into the FE service (that serves statefully generated pages for the users), and a BE service (which executes long-running asynchronous jobs). So now, how do we let users access it?

As you might find with these cloud providers, making things public is not exactly the easiest thing to do. Since we are going to talk about a better way to do this a bit later, I'll keep this brief. This is how you would make this FE service public given only a single instance running at any time:
1. In your VPC settings, set up a public subnet.
2. Configure any NAT or other settings to get an IP address.
3. Configure the ENI of the FE task to use a public IP address in that subnet.
4. Then to enable SSL, you would need to configure nginx as a sidecar to the FE application with the right SSL configuration.

Quite messy! It still doesn't solve the scalability issue, but that's not the worst bit, deployments will still cause an outage! - And additionally, regular fargate instances will need to be periodically replaced in order to deliver the newest updates to the platform they run on. So your application might just go down every now and then for an automatic update.

The way that ECS performs deployments by default is a hard 'kill and replace', I believe the term for this is a "rolling update". When you trigger a new deployment, usually after updating the task definition with the new docker images, it will start culling the existing tasks and replacing them with new ones based on the new task definition. This is not ideal for an application service that requires 100% availability. It would not be nice for your users to get met with a HTTP 504 on their browsers every now and then!

But at least the deployment process is straight-forward, all you need to do is publish a new task definition, then instruct ECS to update the service with the new task definition, and it will trigger a new deployment. To be a bit more specific, ideally all that you should be changing in the task definition is just the docker image SHAs or version numbers, and on rare occasion, the environment variables for each container. One way you can automate this is by setting up OIDC in IAM so that the CI pipeline you have can assume a role that has access to ECS/ECR and then perform the necessary actions.

Better, but very rudimentary. Here's what it looks like now:

![](/media/art_of_deployment/ecs_cluster_public.png)

# AWS ECS + Fargate + ALB

Now we are going to talk about some scalability!

The next problem we are going to try and solve is: **How can we make it so that the application will work under the load of 1 user, and also 1 million users?**

Let's start with load. What happens when we get 1 million users trying to access our application? This would mean 1 million web browsers, and **at least** 1 million ([mostly](https://en.wikipedia.org/wiki/QUIC)) TCP connections. This would probably make our server really slow, especially if we are using a fairly conservative amount of resources (eg, 2 CPU cores and 4GB of RAM), since we would somehow need to process more than 1 million operations in a reasonable time.

> There are also some OS-level considerations that help illustrate the need for a bit more sophistication. Here's a hypothetical for you: 
> 
> Let's say that we can do this, and we get 1 million users every minute, but you can only process 2 connections at a time. On most linux kernels, there is a [default limit of 4096 connections in the socket queue](https://docs.kernel.org/networking/ip-sysctl.html#tcp-variables). Even if we can tweak this limit to be its theoretical maximum, we would need some way to store all of the file descriptors for the sockets, and data buffers for all of those queued connections. This could exhaust CPU and RAM by simply having to hang on to all of those connections, and also managing the overhead of organising them all.

So why don't we just add more FE tasks? Sure that would give us more instances to distribute the load over, but how do we actually get the load over to them if the DNS record we have for my-app.com points to only a single, public IP address? This is where the Application Load-Balancer (ALB) becomes useful!

Do you remember our Nginx proxy from earlier? Instead of having this proxy on one machine, we can stick it on a different one, and so long as the application is reachable from the target system, Nginx will serve the application like normal. Now imagine if Nginx can pick from multiple possible IP addresses and round-robin proxy them for each connection. This now becomes a load balancer.

AWS have their own solution (in the EC2 console) which allows you to create your own application load balancer for this very purpose. Just like our example above, the load balancer is kinda like Nginx. It will first establish the connection with the client computer, then select an instance in a 'target group' to assign the connection to. It will then establish a connection with the instance, and forward the socket data from the client into the new connection with the target instance. Then the instance will handle all of the processing from there as if it were being contacted directly by the client (*not exactly, but close enough without going into too many details).

So now our architecture looks a bit like this:

![](/media/art_of_deployment/ecs_alb.png)

So theoretically, if each FE task can handle 1000 requests per second, then two of them would serve 2000 requests per second. The ALB lets us take advantage of this, and it's called 'horizontal scaling'.

However, there's a bit of a problem with this: What about during the night when we get literally 0 traffic? This is a bit of a waste, right? - Very true, and we'll solve this one a little later.

I would also like to point out that we have not yet resolved the deployment downtime issues either!

So it seems we still have some work to do...

# AWS ECS + Fargate + ALB + Blue/Green Deployments

So next up, let's solve the problem of downtime during deployments. Forgetting about any infrastructure for a moment, let's think about how we'd do this for our app on the linux VPS we talked about earlier. Let's accept that this VPS you have contains some mission-critical software. That means you can't have any downtime when pushing updates. So how could we roll-out our next software update?

Our VPS is the only instance that exists, and we point everyone to it using a DNS record for `my-app.com`. So, naturally, we have the option to alter the A-record with a different IPv4 address. What we can do is set up a new machine with the updated copy of the software, but with a different, public IPv4. We then do whatever Nginx and networking setup we need, and it's ready to go. Then all we need to do is update the A-record at the DNS, and slowly, you will find that *most* of your traffic will hop over to the new server. Once you are confident that there are no more clients connecting to your old server, you can bin it.

Although this is a very crude way of doing things, it helps to illustrate what I'm about to explain.

You can imagine the ALB in this scenario as playing a similar role as the DNS server in our above example. Given the wonders and advancements of [SDN](https://en.wikipedia.org/wiki/Software-defined_networking), we can instruct our ALB to re-route traffic without bringing the service down. This means that the ALB can still accept and forward connections, but all new connections will follow a different set of rules.

On our ECS side, all we need to do is bring up a new set of tasks that contain the updated docker images we pushed, then somehow connect them to the ALB. These new tasks are assigned to a separate target group and given a little bit of time to start-up before production traffic is re-routed to them.

So now our architecture looks a little bit like this:

![](/media/art_of_deployment/ecs_blue_green.png)

In the diagram, I represent the priority ALB rule to the blue group as a solid line, and the ALB rule that is lower priority to the green group as a dotted line since there is no traffic yet. The reason why the green group doesn't get any traffic is because the rules are identical in their conditional statement. Ie, "Route all HTTP traffic where the `Host` header is `my-app.com` to target group X". Hence as a lower priority rule, the green one will never get fired.

This is great! Now all we have to do is increase the priority of the green rule and then we have successfully deployed the new app version!

Although this is pretty much complete, there are a few nuances that I think are important to understand:

### What happens to all of the old connections to the old target group?

In short, these connections remain open until they either complete, or are forced to close.

AWS documents their [ECS task lifecycle](https://aws.amazon.com/blogs/containers/graceful-shutdowns-with-ecs/) which shows you how this process happens. But in a nutshell:
1. A task is stopped in AWS (ie, when our blue group has been terminated)
2. ECS will send a SIGTERM to the container(s) on your task
3. If the application process has not ended before the time-out, ECS will send a SIGKILL to your container to end it forcefully.

So theoretically, there are a few levers you can pull if you need to ensure that connections to your application are closed gracefully:
1. Handle SIGTERM in your application so that you stop accepting connections, and also do not terminate the app until all of the current connections have been closed.
2. Tweak the task timeout to suit your needs for waiting for long-running connections.

### How can we automate this?

The above only mentioned the process without actually any infrastructure backing it. AWS does provide a service called CodeDeploy which will handle everything for you. I'm not going to go into detail on this in particular, but here's the [documentation that AWS provides](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html). For context, here we are using the "All at once" deployment strategy.

# AWS ECS + Fargate + ALB + Blue/Green Deployments + Auto-scaling Policy

So we've solved containerization, we no longer need to worry about downtime during deployments, and we have a way to scale to serve as many users as we need to. Our last problem is to figure out how we can scale-down our services when people aren't really using them.

Let me take you away from computer engineering for a moment.

As of writing this, I live in Sydney Australia. My closest train station is apart of the [Sydney Metro](https://en.wikipedia.org/wiki/Sydney_Metro) (no, not Sydney Trains!). During peak-hour, there is a train every 4 minutes - and rightly so, as usually it is packed like a sardine tin! If you read the Wikipedia page, you will find that off-peak, it usually runs every 5-10 minutes. But why? These are autonomous trains, so we don't need a person manning each one, but they still need electricity, and each drive causes them to wear out certain components. To help reduce costs, they sacrifice a bit of service provision for some cost savings. It's a reasonable trade-off to keep the service alive for everyone to use.

Same goes for our little app, we shouldn't be running 100 instances during the night where we get a trickle of internet traffic. We'd send ourselves broke in less than a month! This is where auto-scaling becomes useful.

The basic principle is:
- There is some metric which will tell you when you need more instances.
- There is some metric which will tell you when you need less instances.
- Given enough time breaching either metric, we should scale-up or scale-down our instances.

Figuring out the rules for scaling up and down are unique to each application. Each product has its own behaviours, quirks, intended use-cases, and load patterns, so it's important to consider some things before you choose the scaling rules to enforce:
- Is your load very spiky? Do vast amounts of people visit your app at regular intervals? - If so, you may want to consider an aggressive scaling policy that scales-up at the slightest sniff of increased traffic, and scales down just as quickly?.
- Do people use your app for long periods of time? - If so, you may want to consider a gentle scale-down policy in case clients still need to fetch small things throughout the day.
- Does your app take a very long time to start up? - If so, you may want to implement some sort of predictive scaling.
- Does your app work across a single time-zone? - If so, you might want to set a schedule for scaling.
- Is latency and availability important even during periods of low usage? - If so, you may want to set the minimum instances to a higher amount.

For the case of our app, we are just going to keep things simple and scale based on overall CPU usage from all of our instances. What you will need is something like this:
- In Cloudwatch, two metric alarms per service - one for "CPU usage is too high" and another for "CPU usage is too low".
- In ECS, set up a scaling policy for our two services based on these alarms. This includes a minimum and maximum scaling value among other settings as well.

So in reality, it will go something like this:
- When the CPU usage of our service goes above 50% for longer than 30s, we will scale up to maximum.
- When the CPU usage drops below 25% for longer than 15min, then we will start scaling-down one instance at a time.

But what does the auto-scaling policy actually do to alter the amount of instances in service? - It's quite simple, it just alters the number of desired tasks, just like we did before when we wanted to increase our capacity manually!

Whenever you alter the desired amount of tasks, ECS responds by adding or culling new tasks. All of the processes of adding new instances or removing them is managed by ECS behind the scenes. Same with adding and removing things from the right target group so that the ALB can actually connect to these new tasks.

# Wrapping up

So that's everything sorted. Our whole pipeline looks like this now:
1. Code changes are made and merged into main
2. Our CI/CD pipeline will assume a special IAM role that allows it to push to ECR, update the ECS service for the BE, and launch a CodeDeploy run for the FE service
3. Once our new docker image hits ECR, we will generate a new task definition for the FE and BE services and push them to ECS
4. The BE service will deploy automatically with a rolling update via ECS
5. We then trigger a CodeDeploy deployment for the FE service that performs an "All at once" deployment using our green and blue target groups
6. Once complete, CodeDeploy will switch over the rules in the ALB and all users will be running the new app
7. During the night, our FE tasks will scale down to 3 tasks at a minimum, and during the day, up to 16

Not a single person needs to touch any of the processes involved here. All we had to do was spend some time setting the machinery up, and now we have our very own fully autonomous deployment pipeline!

# But what if I can't use Fargate?

All of the above explanation is done with AWS fargate. If you haven't used it already, and your workload can support it, I highly recommend you ditch EC2 instances in favour of ARM-based fargate instances (they are the cheapest for I/O heavy workloads like an API). But if your workload must work with a real instance, there's still a solution for you, and managing an EC2 instance fleet is one of the most interesting things I've had to do in my career.

There is this really great [deep-dive into EC2 auto-scaling](https://aws.amazon.com/blogs/containers/deep-dive-on-amazon-ecs-cluster-auto-scaling/). I do recall reading it multiple times, and never understanding fully what it meant until I actually got to play with it in an AWS environment. So what I want to do here is try to give you a conceptual understanding that will prime you to read that article.

Everything we currently know about ECS auto-scaling is all relevant here, we aren't ditching our current auto-scaling policy. After all, that's what helps us figure out how much capacity we *actually need*. The problem is, if we are using EC2 for compute, then there is nowhere for these tasks to go unless we have some EC2 instances. Fargate gave us the convenience and luxury of being able to place a task on an instance whenever we want, but for EC2, we need to start managing a fleet of computers that we can deploy things onto.

I like to think of an EC2 fleet like a cargo train. Let's say this train is headed all the way from Calgary to Quebec City. Along the way, we might drop off, or add new cargo to the train. Before we take-off, we need to look at our current cargo. Currently, it seems we have 10 carriages (our EC2 instances), 8 of which are filled with containers (our apps).

![](/media/art_of_deployment/choo_choo_AB.png)

> A small side, note, it's possible for each carriage to contain multiple containers. Although, you might not be able to fit multiple containers onto the same carriage. Some containers might be unevenly sized (each ECS service uses different amounts of CPU/RAM) and might not fit seemlessly together into the instance in a process known as [bin-packing](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-placement-strategies.html). Changing the EC2 instance type is akin to changing the size of each carriage - more CPU/RAM means a bigger carriage, so you might be able to binpack better.

This means that we have two carriages that are totally empty. This is fine for us as we anticipate that we might collect a few things along the way.

Let's say we've reached Regina, Saskatchewan. Here we pick up some more containers (ECS has requested more tasks start running). Now there are no more empty carriages, and the last carriage is only half-full. What happens if we have to pick up some more things when we enter Manitoba?

![](/media/art_of_deployment/choo_choo_SK_1.png)

The company demands that we pick up all containers when we get to each station, so we need to prepare for the worst, so we add a pit-stop to the journey and add a few extra carriages to the train (scaling-up our fleet) so that we have 12 total carriages (two of which are empty). Each pit-stop will take us some more time, so we don't want to have to do it as often, and there's only so many carriages we can add to our train before we need to change the engine (increase the upper limit on scaling).

![](/media/art_of_deployment/choo_choo_SK_2.png)

So we get to Winnipeg just on-time! We drop off some containers and end up with 4 empty carriages! 

![](/media/art_of_deployment/choo_choo_MB_1.png)

We don't need 4 empty carriages, so let's dump 2 of them (terminate the instances) and save some fuel!

![](/media/art_of_deployment/choo_choo_MB_2.png)

We just entered Toronto, Ontario, and we find that the station wants us to carry 8 additional containers from various services when we can only fit 2-5! Unfortunately, there's no time to add new carriages (we have to do this before we reach the station), and we have to abandon some of these containers at the station (we have under-provisioned our EC2 fleet. ECS wants more tasks to be placed, but can't place them because the fleet hasn't scaled-up yet).

![](/media/art_of_deployment/choo_choo_ON.png)

Hopefully that kinda gives you a rough concept of what we will be talking about next. Let's move onto some more concrete explanations...

So firstly, we need some new infrastructure. In EC2, we will need to set up what's called an Auto-Scaling Group (ASG) which basically represents the specs of the train (ie, how many instances do we want? What's the maximum and minimum size of the fleet? What launch template will you use? What type of instance will you use? Etc.). To form this fleet with auto-scaling policies, you will need some extra things:
- A way to figure out how many tasks you want to place (handled by ECS).
- A percentage representing roughly the amount of capacity you want to sit idle so that ECS can quickly scale your application (because EC2 instances can take a long while to provision).

This, I believe, is set up with a couple alarms, just like the ECS auto-scaling we talked about before, and AWS can automatically calculate the `CapacityProviderReservation` for you based on your configuration.

The final thing to do is to link up your new ASG with ECS so that your service knows that it can use your ASG as a capacity provider for the tasks (interesting fact: Fargate is linked to your ECS services as a capacity provider by default!). Then, so long as your task definition specifies EC2 as the platform, ECS should pick up your ASG as the capacity provider, and then start provisioning tasks to your EC2 fleet.
