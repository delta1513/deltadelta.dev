---
title: The Journey to Zero-Maintenance
description: A blog article about a system that I ran for about 8 years
layout: markdown.njk
date: 2026-06-14
---

In my early life, I was eager to solve technical problems for people, and the people I was solving them for usually gave me the benefit of the doubt because of my age, and hence they let me solve it for them. The problems that soon followed was that my way of understanding and solving the problem was usually not the same mental model that they envisioned the problem. The young and free-spirited version of myself had always made certain assumptions when building websites, web apps, or setting up third-party solutions for people, and this always led to the dreaded 're-work'.

After enough times failing, I soon realised that I was spreading myself thin over so many things. I would make a solution for one person, thinking that it would solve it for them indefinitely, but soon realise that there's infrastructure that needs to be maintained over long-periods, uptime expectations, changing scope, and just regular iterations on the problem from client requests. All of this just to hold up my promises to the people I know.

As a result, and partially unknowingly, I had been sharpening a skill that would allow me to scale all of these projects - the art of zero-maintenance systems.

Now when I look at a problem that someone presents me, I don't involve myself at all. If the solution is to work, then it's to be a tool that the person is capable of exploring and using themselves to get the work done. It might not be the best tool, it might only get them 80% there, but that's usually good enough, and I get the benefit of knowing that I'm not involved in the slightest. Doing this allows me to scale one of my own virtues (and hopefully one of yours) - helping people!

# My first big project

I very recently had to let go of a very long-running project of mine, the [Gridcoin Wallet Bot](https://gitlab.com/delta1512/grc-wallet-bot), and this project is going to be the focus of this post. This project is a Discord chat-bot (not AI) that let's you store, stake and transfer GRC. I started it many years ago - the commit history dates back to 2018. This was just before I started attending university. It's a bit sad to be letting this go, it means that no longer will I have that little tickle in the back of my head knowing that there is something autonomous that I've made which is running in the background.

The reason I had to let it go was because of a number of reasons:
1. Discord gave me a notice stating that I need to perform a verification step now that I service >10k users
2. The code has not been significantly maintained for many years now
3. Every now and then I need to perform a tiny bit of maintenance, and sometimes I catch some scalability issues along the way that keep me up at night

Back in 2018, crypto was getting bigger, and I wanted to immerse myself in it because I thought that there was a genuine opportunity to engage in something technologically transformative. Back then, Discord was also starting to take-off, and one thing that was popular were chat-bots, especially ones that let you store and transfer crypto - these were very simple gateways for people to start dipping their toes in without having to get into the technical depths of hosting their own wallets/nodes. So given I was learning CS, and had a knack for crypto, I decided to dip my toes in too, and I created the Gridcoin Wallet Bot.

## The initial architecture

Back in the day, the libraries that were used to interact with discord were in its infancy, and generally, it was more comfortable for me to keep everything all in one synchronous app. The app consisted simply of a discord bot app that would listen for messages in a channel, filter the ones with a prefix, then, respond to any valid command from that prefix (lots of regex and string ops here).

Often there were instances where I needed to interact with the GRC wallet directly, and this was also done synchronously as the computer that was hosting the bot was also hosting the wallet.

At the time, I had barely stared uni, and had no commercial software engineering practice, so I had no idea how much of an anti-pattern this was, and I was left to feel the invisible pain from my users as I watched people wait tremendously long times for the bot to respond because the message was queued synchronously. It was at this point that I started understanding the term we now call "Scalability". It was also problematic that around this time I had started attending classes, so most of my time was slurped up.

I started to feel Murphy's cloud looming over my head. A worry that something will go wrong with this system at any moment, and I'd have to be accountable for it. The system felt fragile, like it couldn't withstand the brutish demands of my end users. So to save my sanity, and also (eventually) my time, I decided to re-factor the whole thing.

## The first rebuild

It was around this time that the original library I had been using for discord was about to be deprecated in replacement of a library that took full advantage of Python's async capabilities. Now I could respond to multiple messages concurrenty using co-routines!

I spent however long I needed to rebuilding the system, and pulling my hair out trying to wrap my head around how async works (I haven't done the uni course on it yet). But eventually I hobbled together some horrific contraption that was compatible with the new libs and had all the features as before. Back in the day, I had QAed this myself with the help of some friends.

The basic architecture hadn't changed in this version. I still had the Discord bot still attached directly to the GRC wallet. As I'm sure you might be able to guess, *this led to some strange behaviour...*

One day I decided to check-in on the balance sheet of the app (to make sure I have enough GRC to pay out everyone if they all withdrew their coins), and I noticed that the balances were off by a small amount. I had owed more money than I had!

In the GRC Wallet Bot, there is a feature called a 'faucet'. This is commonplace in the crypto world, as it is a simple means for people to get their hands on a small amount of crypto and try sending it around to see how it works without any financial commitment. I had noticed that the amount that I was out by was roughly equivalent to a recent faucet claim, so I took a look at the logs to try and find the culprit. If I remember correctly, the logs would show the before and after of the faucet balance, and I noticed that two logs had the same 'before' value - our first race condition! (Again, I hadn't actually learned about this at uni just yet)

At the time, I don't think I had considered DB locking, instead I thought about the issue from a totally different perspective, one that would get me closer to zero-maintenance.

## The final re-build

Now this rebuild I was quite proud of, and probably the one I'm going to talk about the most here.

The GRC Wallet Bot was becoming bigger. More users, more GRC, more Discord servers. Not only did this reveal more race conditions it also gave me a lot more anxiety. Mainly thoughts like this were going on in my head:
- What if the bot gets hacked? The wallet is coupled to the Discord app, if they manage to access that, they can take everything!
- What if there's a race condition with withdrawals? That can deal with a much larger amount.
- What if someone spams the bot? That would cause compunding race conditions, and who knows what else!

I needed an architecture that can not only let me sleep at night, but be so durable that I wouldn't have to even keep the thought of it in my brain.

It was during this time that I had unknowingly engaged in distributed system design.

The year that this re-design occured was the year that OpenAPI/Swagger was being popularised, and I really liked how you could just write the spec, then it would just generate most of the stub code for you. As dumb as it sounds, I had depended on the online Swagger editor for not only development of the spec, but also the generation of the stub code (also for subsequent updates!) - I know, cringy, but I didn't know any better at this time.

So what this system looked like now was:
1. A Discord bot that would talk to a HTTP REST API
2. A HTTP REST API that would perform any function on the Wallet Bot that queried the database in some way
3. A job runner that would perform all write operations and anything that dealt with transacting. This was a hand-rolled system that I called the [RYU Sequential Orchestrator](https://gitlab.com/delta1512/ryu-sequential-orchestrator)
4. A piece of OpenAPI client software that would run on a separate host, and interact with the HTTP REST API in order to perform all GRC Wallet operations

This was an abolute behemoth, and I am very proud of how I evolved this architecture. Let me take you on a little tour...

### The GWB server (REST API)

I'm skipping the description of the Discord bot since it is trivial. This OpenAPI-compliant REST API was for any operation that required a DB read or write (everything else was performed by the Wallet Bot directly). The rest API was the primary obelisk that stood between the DB and the rest of the system. Naturally, it was multi-threaded, so it can handle a large number of requests - enough for noisy discord servers.

It also hosted important internal endpoints that the client would use to receive instructions on what wallet operations to use, and also to deliver information about deposits.

This API is publicly exposed, but secured using static-key authorisation.

### The RYU Sequential Orchestrator

This was a funny piece of software. It's basically an artifact of me re-inventing the wheel because I didn't know that [Celery](https://pypi.org/project/celery/) or [RQ](https://python-rq.org/) existed at the time. This was a very fun experience tho!

The Sequential Orchestrator (SO) is a spec-driven, sequential job runner. Other than the sequential nature and spec-driven architecture, it was essentially just like Celery or RQ. It did however have one opinionated flaire that set it apart from the existing job management systems - it supported disaster recovery through reversals of a job. I can't remember the exact structure, but it went something like this:
- Each job has steps.
- Each step has a sibling reversal step which will 'undo' the state in any data store that may have been altered if anything goes wrong with this step.

The SO's role was to durably process all transactions in a synchronous manner. The job queue was literally the queue of socket connections to the orchestrator (risky, I know!), and all of this was running on one thread. At a point, I was using this for another project of mine, and I had measured it to be able to support 150 transactions per second for the GRC Wallet Bot spec! This was more than enough for the volume of the Discord bot.

### The GWB Client

I needed a way to get piece of mind that the GRC Wallet that was holding many thousands of dollars worth of crypto would not get hacked, but also to be able to interact with it in a way that could make it autonomous and also durable.

Back in the day, supply-chain attacks weren't that prevalent, so generally the easiest way to get into a remote system was through an open port with something listening to it. In my head, I thought: "Well, you can't get into my system if there's no port open, right?". This was the day that I unknowingly discovered the [Reverse Connection Architecture](https://en.wikipedia.org/wiki/Reverse_connection).

By having the GRC wallet running on my home server (where nothing is exposed to the web except maybe a minecraft server every now and then), I was able to isolate the GRC Wallet so that no one could access it. Then, I would have some client software that would occasionally poll my remote API for instructions on withdrawals that people want to make, and also submit information to the API regarding deposits that are made in people's wallets.

At the time, I thought this was an ingenious design, and it gets better!

Having a polling client makes durability very easy to implement. I considered these failure scenarios in mind:
- The power would go out in my house, or the home server would somehow go offline - This would be no problem at all, it just means that withdrawals wouldn't be processed regularly. As for deposits, they are on-chain, so when the server comes back up, it would read from the last known block height and process the transactions from there.
- The wallet server would not be able to connect to the API - For some reason or another, my home server might get disconnected from the internet, or rather more likely, the remote API would have to go down for an update. A simple fix for this is wrapping the cron-jobs in a ping and handling a HTTP 502/503 in the code.
- The API might run into an exception - This was handled by making (the important parts of) the code idempotent. Any subsequent attempt would result in a no-op.


### Maintenance

So in effect, all that needed maintaining was:
- Every now and then, I'd find an inefficient SQL query in my code, and I'd have to add an index or change it up somehow
- Every time there was an update to the GRC Wallet, I'd have to update the wallet on the client
- Every now and then I'd have to come in and clean up the [dust](https://www.coingecko.com/learn/dusting-attack) in the wallet (because it would cause the wallet to chug and the transaction fee to explode). This was easy to implement with cron, but I quite enjoyed doing this myself and looking at the huge size of the transactions.
- Sometimes the amount of users that were registering with the bot depleted the reservoir of available crypto addresses I could serve. So every now and then, I'd get pinged, an up the amount of addresses that get generated on the cron-job that replenishes them.
- Every now and then, there would be a wallet update, most of them are mandatory, so I'd have to go in and re-compile the daemon binary on my home computer and then restart the wallet.

These things happened fairly rarely, which was good enough for my busy lifestyle, and I was also content enough with the durability of my architecture that I felt I could just forget about the whole thing and it would be fine. In effect, I was checking this system roughly once per month.

So in effect, this is not exactly zero-maintenance, although that's what I was striving for, and in some cases, it actually felt like I really didn't need to do anything - the system could hum along in the background. You could point out that libraries, docker containers, the VPS itself, and many other things needed regular updates, however, the system was so low-stakes that this really wasn't necessary, so I let it age.

# Final thoughts

This particular goal is something that I consider as an important philosophy (among many others) that you should have when writing commercial, scalable software. You should want to be able to build something, then move on and not have to keep it in your mind. There are more important things that I think you should be filling your mind with instead of the dread of having to maintain some ugly monolith.

Looking back on this project in general, I would consider it as probably my most epic feat of trial by fire that I've ever embarked on. I was literally walking through this whole project with a blindfold, but still managed to find my way. Looking back on some of the code now, I want to puke - it's really bad! But there's also a part of me that admires the journey it took to get there. There's a glint in my eye when I look back at it and thought about how I felt when I was doing it. I thought I was building something remarkable. Something that no one else had thought of. It was the bliss of ignorance!