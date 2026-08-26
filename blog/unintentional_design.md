---
title: Unintentional Design
description: A scourge that is more evident than ever in everything we interact with
layout: markdown.njk
date: 2026-08-26
---

My dad runs his own business, and a part of this business is a fleet of brand new vehicles - just for people to get from place to place, nothing fancy!

As such, he settled for something that's cheap and will just do the bare essentials (get from one place to another). There are these new Chinese cars on the market - the Chery Tiggo. He got a few of them on lease. From a personal perspective, these cars suck, but from a business perspective, they are the cheapest form of luxury you'll get, and I think this is a great choice for him and his staff.

There are so many things that I hate about this car, but the most infuriating is the gear-stick.

![](/media/unintentional_design/gearstick.png)

> Yes, I know you can see that Gemini watermark. This is based on an original image but it was dark and dirty and I wanted to give you a nice experience, okay?!

If you are seeing this type of gear-stick for the first time, boy are you in for some fun!

I want you to think for a moment about which way you would push the gear-stick in order to go from park (on top) to reverse.

You'd probably say "down", right?

The knob will let you push it forward or backward, and press the park button at the top, but it will always retreat to its initial location (ie, it's not like a traditional lever that will shift to a different location)

If you answered "down", then you would be wrong. The answer is to push the knob forward, twice...

...Who in any right mind would think to do this? (except for Mercedes)

Sure I might be used to the traditional shifter, and getting along with this innovation is going to be a jarring experience, but think about the people that might never have driven a car before - I don't see any clear way to understand this without fiddling with it first.

If I've never driven a car before, I'd think of a few possible ways to use this thing:

1. "I want to go forward, so I'll push this thing forward" - Nope, you're in reverse now buddy!
2. "I want to get to the reverse gear in the interface it shows me so I'll push it down" - Almost there, you'll actually put yourself in neutral, and honestly, I couldn't even tell you if you would need to push it up or down to get to reverse now.

None of these make sense, and to adapt Conway's law, I believe that whoever designed this just simply had their brain disconnected from their work or did not care in the slightest - and I don't blame them, this car doesn't need much thought put into it for its price.

Want to know what I would have done other than use a regular gear-stick? Buttons!

Just put buttons there that you can press! Different colours mean whether it's engaged, locked, or transitioning to that gear, it's easy, and so obvious for both existing and new drivers - but offering design advice to car companies is not the goal of this blog post.

What you see here is something that I think is a plague that is manifesting in many things we interact with in the modern world, and it's getting worse with AI.

Let me illustrate with another example.

I've been making an app for myself to help scrub-up on my advanced vocabulary (I'm doing an exam soon) and I noticed this in the very first iteration while I was vibe-coding:

![](/media/unintentional_design/software.png)

So in this app, I am simply making it easy for myself to filter-out some words in a massive list that I found. The idea is that I either think that the word is sufficiently advanced and beyond my level (so I keep it by pressing Q), or the word is too trivial for me, so I discard it (by pressing W). Notice how the W action is to the left and the Q action is to the right? For those QWERTY users out there, I'm sure you can see the discrepancy here.

For the first 10 or so words, I noticed this confusion straight away and asked Claude to switch it up immediately, but imagine if this were some sort of commercial software - it would drive me insane!

There's a distinct cognitive load that gets placed on you every time one of these things occur. Although it's very small, if there are a lot, it all adds up, and eventually you just end up with an understanding of a system that's a lot more like an attempted critique on some abstract art.

This type of design is representative in all software, it's just that nowadays, it's a lot more prevalent since we have AI writing a lot of commercial code now. My hypothesis is that these sorts of designs happen from human oversight and lack of intentional thought. I even caused a few of these cases myself in one of my old roles (before the days we had commercially available coding agents or autocomplete). Now my memory is very rusty, so I don't know the exact details, but it goes something like this:

It's a Friday, so our product manager is showing us the new goal for next week - we are going to run some experiments to see if we can improve the time it takes for a customer to update an order. I'm in charge of launching this brand new interface that will change the "edit order" screen. The idea is that we do away with the save button, and instead, we will automatically apply the changes to the fields when changed. However, there is a sub-field of the order that requires a foreign-key model to be updated too. To compensate, the designer added a special save button just for that model. Brainlessly, I went ahead and implemented that because that was the design - completely counter-intuitive to what we were trying to achieve. If I had let the designer know that we can save everything all at once, then I could have prevented this issue and let them alter their design.

I hope that you can see here that the lesson learned from blindly following instructions is that you end up with a system designed by one person, and built by many others. No one is putting in any conscious thought into the fact that there will be thousands of people who have to experience this horrible design and cognitive load. By idly building this, we are causing a silent scourge that will erode yet another small piece of someone's mind out there in the real world - and they are often powerless to protect themselves from it.

With coding agents and LLMs, the same effect occurs, but due to an additional cause. Not only is the agent not consciously thinking, it is also sycophantic. If the task is well defined, then it will be executed from the design of one mind (yours). If there are gaps where the agent must reasonably assume things, then you will not get conscious thought being put into the decisions and assumptions that formulate the design. This is just the same shit as above, except it is machinated and on steroids. Consequently, I find that the efficacy of coding agents is far higher when dealing with commercial software - personal projects are just too niche, novel, creative and intentional for these automata. They are much more used to the cushy corporate environment where the path is clearly set-out for you!

## What can you do to fix this?

I'm not going to tell you to stop using LLMs or coding agents, in fact, I think that you should still use them. I think that if you are reading this far into the blog post, you are smart enough to know when, and when not to use them, and that the way you use them is what matters more.

Whenever generating code or content, I always know that what I make is going to be a shadow of what I actually want. Every new prompt or change in design I do will bring me closer to developing more intention in the thing I've created, and soon, instead of a shadow, it will be more like a sculpture - something that I am proud to show off as a totem representing my thoughts.

Another important thing to do is to buy things, do things, and surround yourself with things that are deliberately intentional. That is, for example: 
- If you only buy things because they are novel, you'll be known as the child that plays with their toy for merely a few days and moves on to the next. 
- If you only buy and wear clothes that are currently in-trend, then you will be known as the person who cannot create their own fashion style.
- If you don't clean certain spaces in your home, then it shows that you don't value your whole space, and it's not something you fully utilise.
- If you use an LLM for writing and sending emails or responding to work messages, it shows that you do not value the interactions that you have with other people.

Developing a connection with the things you own and use, and also the people you interact with is quite possibly the most rewarding feeling that exists in the world. Knowing your boss like a friend surely feels much better than getting that massive report done on-schedule. I could also continue by rambling about my car, but I'll leave that to another blog post to go into details, instead there's one particular thing I wanted to cover with it.

I read somewhere that a source of despair that emerges from capitalism is the progression toward separating yourself from the 'object' with some sort of interface. With cars, for example, the manual transmission, complete with clutch, gears, and so forth was abstracted away into a single gear on an automatic car ("D"). This abstraction made it so much more accessible for anyone to drive a car, but subsequently made it so that its driver would no longer need to respond to certain changes in the vehicle or environment (like knowing when to go up a gear for example). This connection between the environment, the vehicle, and yourself is magical, and I think it's also another thing you should strive for in your quest to live an intentional life.