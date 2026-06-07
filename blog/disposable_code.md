---
title: The age of disposable code
description: A small rant about my thoughts on a particular aspect of how software engineering has changed with AI
layout: markdown.njk
date: 2025-12-29
---

On the last week of the work week this year, I revealed two very exciting things that I created at my work. Let me tell you a bit about them.

At our workplace, we like to do what are called "Lunch-and-Learns" where one presenter will set up a slide show or presentation and then around lunchtime, everyone will gather around in a meeting room and Meets call to view their presentation. My lunch and learn in this last week was regarding ISO/SOC certification and what will need to change culturally and technically in order to maintain our certification.

Usually how I'd approach this is I'd brainstorm and note down important sections, and ideas I should include which would be beneficial to the team. I typically undertake this ad-hoc, and as the ideas manifest in my head during random daydreams, I'll grab them and jot them down. Then a week or so before the presentation, I'll set aside 2-3 hours to set it up in Google Slides.

As AI has drastically improved, I've started generating images to put into my presentations in an attempt to keep people engaged and tell a story, and I've also experimented with AI-driven slideshow software.

My personal feelings towards this AI-driven slide software is quite apathetic. I personally think that too much creative control is taken away from you in the process of generating the slides. Since the LLM has to interact with (what I'm assuming to be) an MCP server of some sort, there are clearly defined limits to what it can do.

I was deeply unhappy with these limitations, so I decided to vibe-code a presentation.

I wanted to let my creativity pour out and have full control over the look and feel of everything, and I know that with code, I can significantly elevate the experience viewers would have with my presentation. But in a time before AI, this would be a frivolous rabbit-hole, and I'd probably be met with some suspicious looks from my boss and colleagues given it would have likely taken a few days to develop less than an hour worth of presentation. But now with AI, this timeframe has shrunk significantly!

So the other week, I decided to vibe-code this presentation. Here's the first slide if you are curious to see what it looks like:

![](/media/iso-soc-prezzo.gif)

Yes, it moves!

The whole presentation was modeled around a retro-arcade, RPG-themed story where the protagonist was venturing up "Compliance peak" to obtain the "Amulet of Certification". Cheesy, I know, but I enjoy the act of story-writing. It wasn't a full story, but I find that having this model presented to you as a viewer helps you to stay engaged. After all, it's a lot easier to listen to a story instead of a mouth full of facts and numbers.

A lot goes into making a presentation like this from a code perspective. You have to think about how to architect it, manage differences in components to keep things DRY and easy to move-forward with, all while ensuring you still have the creative liberty you want. This is very mentally exhausting, and I'd much rather be spending my energy figuring out what to write next, how to make the flow better, and how to make the slides as visually appealing as possible.

So I used [Google AI studio](https://aistudio.google.com) (which comes for free with my Company's Google workspace) to get this project going. It was the perfect tool. If you've ever used a full-stack vibe-coding tool like [Bolt](https://bolt.new/) or [Lovable](https://lovable.dev/), you'll know that things can get prickly whenever you have to deal with a full-stack application. However, if you have a purely front-end app in-mind, then this is where these tools excel. It was a perfect recipe for what I had in mind.

To get this coded as quickly as possible, I needed to give the AI context on a lot of things. Namely:
- The fact that this is a one-time presentation that is front-end only
- The idea of the style, colours, etc.
- The fact that I want it to be a linear slide-show 
- Frontend-only, no backend
- Some starting content

Getting the exact details here for the starting prompt actually wasn't that important, because I know that tweaking it would be easy, however, I didn't want to have to explain all the code and architecture stuff to the LLM. So to start off this project, I started a chat with Gemini to help me progressively create a prompt that I can give to AI-studio's agent. Not only did this meta-prompt work, it actually enhanced what I already had in my head!

How long did it take in the end?

This was the first time I've ever experimented with doing something like this, so I knew it was going to take a while. I'd say all-up, it took about 5 hours, with the longest time spent on content, ideas, small tweaks, testing the web page, and generating/editing the images.

This might seem like an arduous process, but in fact, it felt exceptionally liberating. It almost felt like I was on crack getting this thing developed, it was actually exhilarating. (I'll talk more on this feeling later in this post!)

This feeling also extended to the presentation itself. Usually I feel quite nervous doing presentations, and I believe that feeling stems from the fact that I am quite detached from the content. Like if I could have spent longer on it, flexed more of my creative muscle, and actually make sure I was talking about something I *wanted* to talk about, then I would have felt more connected and confident. With this vibe-coded presentation, I felt almost none of these stage-fright feelings, and instead, I felt like I could engage playfully with my presentation instead of drearily presenting some dry software engineering content that probably no one will remember a week later.

This project was just the beginning tho. My next trick was even more insane...

Riding-off the high of being able to bend the code with only a few words, I decided to reach for the stars - actually!

I had a grand idea to take everything that we've done in Linear for this year and turn it into a Star Wars text crawl (the opening blurb before every episode or whatever. Idk I haven't watched Star Wars that much.).

The idea is that I wanted a "Linear Recap", just like how Spotify does the "Spotify Wrapped" at the end of the year to summarise all of your music consumption, and what perfect way to do that - to tell a fake Star Wars themed story!

Can't give you a recording of this one for obvious reasons, but imagine yourself as a Senior IC, after completing probably 3 or so major projects in the year, seeing your works turn into some whacky and very forced AI generated story intro to a Star Wars episode (With the music btw!)

People love being visible, being recognised, so I wanted to give that back to everyone in my team.

When I presented it, I saw everyone's face light-up and I got a good set of chuckles out of the team. So I'd say job well-done here!

The architecture of this one was a bit different. I found that AI studio didn't like the Linear SDK for linting reasons, so instead I did the following:
1. Like before, set up a prompt with the help of Gemini
2. `npx create-next-app@latest`
3. Give Cursor the prompt and the NextJS template
4. Go make a cup of tea

This had a server-side element to it (the Linear API) so the react app that AI studio would have generated may not have worked anyway. NextJS is perfect for this because it is a glorious mix of back-end and front-end all in one language.

I actually had to touch some code on this second project since one of my ideas caused an exhaustion of the API limits at Linear, and required a slight re-architecture of the way we were pulling data. But all-in-all, this one took about the same time, if not less, and this 'time' didn't really matter to me because I was genuinely having fun.

---

# On 'disposable code'

I wanted to spend some time here talking about these generated projects from a philosophical level. The fact that these projects were built for a single use. I haven't archived these into a git repo yet, nor do I have the need to, and I feel like this is a brand new opportunity for us as software engineers.

Not only can we perform experimentation at scale, but now people who aren't engineers (like designers) can come up with prototypes. It's the act of being able to speak in natural language that increases the accessibility in this field. I feel that it genuinely removes a lot of the shackles to being genuinely creative and pushing computers to their absolute limits.

No longer do we need to create presentations that are dry and linear, we can make a mind map, or a text adventure, or an animated story! And all of them will be made without the slightest pride in the code that runs behind it.

This is what pure creativity looks like when unabated by constraint of the human condition.

## A stinking hot pile of garbage behind the curtains

The code is actually garbage. When making some very small styling tweaks and incorporating images into my ISO/SOC presentation, it smells... Bad!

I've heard stories of people completely vibe-coding huge systems without touching or looking at the code. Not even providing a guided architecture. What this eventually turns into is a bandaid over a bandaid over a bandaid.

Eventually you will end up with something like I did, every slide is its own component... but not really! I think it's acceptable that each slide was its own component, that's generally what the LLM decided to do. However, it found that some slides were quite similarly structured, so I presume it wanted to remain DRY.

Naturally you'd think "okay, so to make a DRY component, we would separate the slide style from the slide content by adding parameters to the component", right?

That's what the LLM did, but instead of separating the content, it separated different if-else toggles for the content using a single parameter 🤦. Nice try. Now we have a huge component that encodes 3 different slides with all of their content.

Now because of the sycophantic and naturally human behaviour of the AI agents, they will build on-top of this rather than considering a re-architecture.

This is exactly one of the things I picked-up on very quickly when building an internal admin panel from scratch with AI.

I could go on about how it should be done, but that's not the point of this blog post.

The point is that all of this didn't matter.

- No one else other than myself and my AI will look at the code.
- This will be presented once and then never be shown again.
- So long as the scope is no wider than what we started with, lack of a long-term architecture is more than reasonable.

Extrapolating this to an everyday bug-fix, the only thing we can knock off that list is the fact that other people (or AI) will look at the code eventually. Does this mean we should not care about the code other than if it's readable, obeys the linter and is a working fix to the problem?

Surely we are becoming more disconnected from what makes us engineers!

In my eyes, code is like a language. No matter how you express what you are trying to say, whether it be in english, french, japanese, or whatever, chances are, you're going to get your point across one way or another. Sure there might be slight cultural differences and implications, but whatever problem you are trying to communicate can still be encoded and comprehended. In essence, we as engineers are the translators, and this job role is now being slowly adopted by AI.

So if we are no longer the translators, what will we be? For me personally, I much like the space in my head now to think higher than the code area I'm working on. I can think architecturally, solving the problem of scale and durability, rather than whether or not some button should be disabled or not.

## The feeling of vibe-coding these disposable projects

Something just hits different when you feel like you've got something great and you see that it is feasible to get this done in a couple hours. Being able to express my lighter and less serious side in these ways was like coming up to the surface to catch your breath after quite a deep dive. I've always had trouble with this, especially in an environment that I'd describe as quite utilitarian (if you work full-time in software engineering. I'm not talking about hobbies here).

A lot of your time in this industry is spent on the tools, and if you aren't coding, then you're probably moving onto the next ticket, looking for high-value, low-effort improvements, or investing in education to get you some new skills. Some may claim that this is just what the nature of this line of work. Sure, but I don't like that. I think there is genuine room in every organisation to be creative and let people be human.

I wouldn't call myself meticulous, but I feel like others would describe me that way if they saw how I went about building these things. I don't think I would have been this meticulous if it weren't for the fact that building and modifying these projects is made so much easier with an AI agent. All I'd have to do is give it a few lines of words to fix whatever displacement, colour, text or whatever there was that needed fixing. So without the need to worry about coding, my mind was 100% focused on "How can I make this presentation even better?".

I'm sure you've come across some things online or in-person that you would not only appreciate, but genuinely understand the time and effort put-into it. A lot of stuff is mass-manufactured nowadays (including code!), so when you see a presentation like this, your immediate thought is "Okay, so he's used AI to build this, that means all of his efforts have gone into the content of this presentation and into the experience that us as viewers will have. Wow! This actually looks really cool. I feel like he's really thought about us as the viewers and wanted to make this experience more lively and engaging for us! Where can I pay a monthly subscription to his YouTube channel?!"

I put in genuine effort here because I loved what I was doing and I could turn my imagination into reality. No longer was I constrained by a tool or a product requirement. I could be my whole self and show that off to the world without a care in the world for what others think.

I feel like we need more of this visibility in not only software engineering, but everywhere.

---

Dec. 2025