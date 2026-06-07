---
title: Linux 001 - A firmware crash?
description: A strange issue I debugged today
layout: markdown.njk
date: 2026-04-04
---

So if you hadn't guessed already, I use linux as my main OS for my dektop PC (other than Windows 10 for games - however this may change soon. I've been informed of some promising developments in proton and wine), specifically, pure Arch Linux. I've been running this OS for as long as I remember (probably all the way back to highschool), and I've been through hell and back multiple times, but I've never bothered to write down any of my woes with this beast of a system. I'm worried that the problems that people experience like this are no longer going to be documented anymore with the advent of AI since you can just ask it to help fix it for you. Heck, I even used AI to fix the issue I'm about to tell you about! And not a thought entered my head that I wanted to write this down. I needed this fixed now. I can't wait for someone who prowls the forums to help me with this, I have a video to edit! But once I found the issue, I thought it was so profound that I just had to tell someone, so here it is...

---

My Arch linux machine rarely gets much heavy use nowadays. Currently I've just been using it for normal PC stuff like talking to friends and browsing the web, or doing some technical stuff. Today I wanted to patch some videos together in KDEnlive like I usually do.

So I go ahead and get all my videos off my file server, then I try to download a video using `yt-dlp` so that I can put the music in my video. As usual, HTTP 4XX. Time to update `ytdl`!

Into `pacman` I go to update just `yt-dlp`. Find myself stuck with an error of files already existing in the fs - so I do what I usually do and move them away to a backup folder and then let `pacman` replace them. So off I go and move the gcc .so files out to a temp dir, completely forgetting that basically everything depends on them! *Nervous laughter ensues*~~

This was actually kinda weird. So first thing that happened is that `sudo` stopped working, and it was at this point that I knew that I fucked up - I couldn't replace the .so files because `/usr/lib` is owned by root!

Oh well, I guess I'll just save my current progress on my video. As soon as I hit save, my whole screen went black in what I assumed to be a kernel panic. Amazing! I think we all learned something here!

I knew exactly what I did, and I'm glad that I saved the .so files somewhere with persistent storage. This will be an easy fix. I just had to load up my Arch Linux USB and get into a chroot on my NVME drive and replace the files. So I did just that.

Now that I'm back into my PC again, I decide to upgrade `yt-dlp` the right way with `pacman -Syu`. So I anxiously watch in anticipation for the eventual black screen I'm going to get for whatever nvidia decides to fuck up this time.

After that goes through, I decide to reboot and make sure everything is working.

And our good friends from Silicon Valley brought us the gift I was just expecting - As soon as the linux kernel and initramfs were loaded into memory, I get a blinking cursor forever!

Okay, time for the chroot again! USB in, and away we go.

First culprit is always Xorg. So I open the logs and I get this:

```
[    96.036] (EE) NVIDIA: Failed to initialize the NVIDIA kernel module. Please see the
[    96.036] (EE) NVIDIA:     system's kernel log for additional error messages and
[    96.036] (EE) NVIDIA:     consult the NVIDIA README for details.
[    96.038] (EE) NVIDIA: Failed to initialize the NVIDIA kernel module. Please see the
[    96.038] (EE) NVIDIA:     system's kernel log for additional error messages and
[    96.038] (EE) NVIDIA:     consult the NVIDIA README for details.
[    96.038] (EE) No devices detected.
[    96.038] (EE) 
Fatal server error:
[    96.038] (EE) no screens found(EE)
```

Brilliant! But also useless - there's no stack trace or error message. But at least we know it has something to do with graphics.

I was guessing that a recent Nvidia driver update caused this, so I looked for the last version I had in my pacman cache. I found it, and before I load it back into my system via `pacman -U`, I thought I'd check to see if I was connected to the internet just in case pacman needs some connectivity.

It was then after I wrote `ip a`, a chill went down my spine - there was no ethernet interface!

There should be one, unless some cosmic ray had hit my RAM chip again (I swear this did happen to me one time before!). Dazed and confused, I just decide to reboot. Perhaps I was just dreaming.

After the reboot, I load into my Arch USB again, only to find that the ethernet had not returned. Puzzling indeed! I had never seen anything like this before - it just... doesn't exist. I see my WiFi interface, but not the ethernet. I see the lights on the back of my PC flashing so I know there's traffic, yet on the computer, it just doesn't show up. `lspci` shows that the adapter (the hardware) does exist, and after some sleuthing I stumbled upon an error in `dmesg`. Something similar to `igc failed with error code -13`. The message appeared around the same line that the adapter was detected. Intriguing...

I had no idea what this meant, so I enlisted the help of Gemini to help me figure out what I should check. Its immediate recommendation upon giving it the errors was almost amusing. It was such a wild idea that I thought it had to be hallucinating. It had said something along the lines of "The intel XXX network chips are notorious for having their firmware crash for unknown reasons. You should cold-boot your computer...". This was preposterous to me, but it was easy enough to try. This had given me an itch of curiosity that I had to scratch!

So here's what a cold boot is:
1. Shut down your computer like normal.
2. Unplug it from the power or flip the switch to the off position on the power supply.
3. Hold down the power button for 10-15 seconds.

The idea here, as it had said, was that holding down the power button while the PC is fully disconnected from the power supply will short the circuits necessary to drain all power from the capacitors on the board. It makes sense to me, and if there's anything running on the motherboard (like firmware) it will kill it. I don't know how many of you notice that the ethernet ports on the back of your PC will twinkle even when your PC is off - stuff like PXE depends on this interface being up even if the PC is off.

So once I had everything back in, it was time to hop back into the live USB.

I had leapt out of my chair when I had seen that the ethernet interface was back and up when the Arch live USB had finished its boot process! Was it a cosmic ray? Did it hit my network card and the network card only? This was truly bizzare.

After donning a tin-foil hat, I had returned to finish my job.

Let's quickfire this:
1. Let's chroot and check `dmesg` to see if there are any kernel messages from the `nvidia` module - Zilch - which was kinda concerning.
2. Try rebooting by adding `nomodeset` to the kernel parameters - No luck.
3. Try a deeper examination of `dmesg` - here I noticed a few lines mentioning `nouveau`, my sworn enemy.
4. Now that I know that my kernel is actually falling back to the `nouveau` drivers, I know that there is an issue loading the nvidia module.
5. I ask Gemini for some suggestions for things to try, and one of them is to check `dkms` to see if the module exists and is loading correctly - this had reminded me that the initramfs needs to be rebuilt every time a kernel or kernel module gets updated/installed. I know specifically that this fails silently in `pacman`, so to eliminate that possibility, I simply re-installed my current nvidia drivers.

After a reboot, I'm back where I need to be. Finally...