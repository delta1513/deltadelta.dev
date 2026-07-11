---
title: The Art Of Deployment
description: A journey through everything that I know about deploying software
layout: markdown.njk
date: 2026-06-19
---

# A Short Preface

The idea for this blog article came to me when I was using an AI agent [gas town]() at work one day. Part of me stopped to wonder about something that made tangent with my thoughts.

A lot of what I enjoy working on is something that runs without much intervention. Something that completes a repeatable task without any manual input from a human. Take for example, the time where I often had to manually deploy a system at work by shelling-into an EC2 instance, and later I had worked out a way to deploy it automatically when someone merged a PR. This is generally the scope of what software engineers do on a daily basis - they find solutions to repeatable problems.

But some of these problems are far more rare than others. Consider parts of your codebase that go untouched for eons until something breaks enough layers deep. Think about that Nginx instance that sits between the LB and your app on a unix socket. Think about the authentication backend in your Django app. These are rare problems that seem to often be solved once, and for good, and very rarely we work on them or improve them because they are already good enough. These sorts of problems are what I enjoy. They provide a necessary difficulty, and challenge, like where an answer is hidden deep within one particular interpretation of the AWS documentation and there are no Medium posts that you can find about it. As-if you are the only one with this problem in the entire world.

Problems like these are ones that I worry are going unspoken or documented, yet they are so valuable in what they can teach. So I'd like to share an accumulation of some of this knowledge from the time I've been spending building software systems for scale.

# Stage 1 - The VPS (or home linux box)

I've made plenty of systems that I've wanted to share with others. Whether it be a minecraft server, a website, a prototype, chat, tunnels, sockets, or anything, they've all required a machine with access to the public internet, and also the ability to open ports. This is what I think is the simplest form of deployment - you've literally just run it on the host machine in a cloud environment or behind a NAT on a home network. 

It doesn't have to be pretty. Some of my first apps were systemd units that spun-up a Flask app. Others were frameworks that exposed a unix socket that was proxied through nginx to the public internet via a virtual host. The point of this section is to reminisce in the beauty of such simplicity, in the days of a handful of users.

Also, don't forget the deployment process for this. When you made a change, you need to actually shell-into this sytem, pull the latest code, then refresh nginx or systemd. Or perhaps maybe you have cron running to periodically update some static files. Whatever it was, the fact that it was on a single VPS or home computer meant that coupling it to a CI was generally cumbersome (or maybe I just couldn't figure it out when I was 15-16. Although I think the fact that it escapes my mind now is some sort of indication that letting CI alter something within an always on, private VPS is just not a desirable process to follow).

Ignoring all the glaring issues with scalability and availability, you can see that this is a really nifty way to host any project big or small for a small number of people. Actually, as-of writing this, this website is hosted on a VPS, and I don't really plan to change that fact anytime soon, it just brings back way too much nostalgia.