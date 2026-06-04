---
title: "I Hacked Claude to Track My Usage Limit"
slug: "vibecoding-to-100k-claude-limit-monitor"
date: "2026-06-04"
description: "Episode 6 of VibeCoding Until I Make $100K. I reverse engineered Claude's website to find a hidden API endpoint, then built a free Chrome extension that shows your usage limit in real time."
tags: ["chrome-extensions", "claude", "indie-hacker", "building-in-public", "vibe-coding", "reverse-engineering"]
draft: false
youtubeId: "https://youtu.be/iyXIi6pNq-M"
keyTakeaways:
  - "You can find hidden API endpoints on any website just by watching the Network tab in DevTools — no special tools needed."
  - "When you can't find an endpoint yourself, ask Claude to write a script that surfaces all potential ones."
  - "Find a unique CSS selector (1 result only) before injecting any widget into a page, or you'll have a bad time."
  - "Don't resize logos manually. Drop it in the root folder and ask your AI agent to resize and replace it across the project."
  - "Before debugging a feature for hours, check if you just have the thing disabled on your own machine, lol."
---

# I Hacked Claude to Track My Usage Limit (Episode 6)

I'm on a journey of vibecoding until I make $100k, building Chrome extensions one at a time. this is my 6th one, and I'm always looking to fix painpoints I find in my own life, on the internet, wherever.

this one started with something that has always annoyed me: being suddenly interrupted mid-conversation with Claude. no warning, no progress bar, just a wall. so I decided to check if this was something I could detect, to have a bit more control over it.

---

## finding the idea

I must be honest: after searching around, I realized this was not my best idea. there were tons of other solutions already available. but I still thought it'd be a fun project, and coincidentally enough, the technical side turned out to be more interesting than expected. so, why not?

---

## reverse engineering Claude's website

just like I had to do in my Claude Deep Search episode, I needed to take a look at what Claude's website was doing behind the scenes. I searched for a while and couldn't find any endpoint that could tell me about usage. so, ironically enough, I asked Claude to come up with a script to surface all potential endpoints, and that's how I found it.

from there, things went pretty smoothly.

---

## building the widget

the first thing I needed was a unique CSS selector above the chat box to inject the widget; I searched for something that had only 1 result in the DOM, to make sure I wasn't attaching it to something that could break. I then brainstormed my requests with Claude so it could help me generate a prompt for Cursor.

as usual, the first build was not working. it was a simple mistake with how the JavaScript was being injected. fixed it, moved on.

I thought the stats bar sitting above the chat box was a bit distracting, so I added customization options in the popup (you can choose exactly what gets shown, or turn it off completely). I also added a skeleton loader and fading animations, fixed a bug where the widget was going offscreen, and decided to keep only the "current session" data visible by default for a more concise look.

I also added a small on/off toggle in the popup, wired up to the X button on the stats bar, so once you close it, it stays closed. a few more options made it in too: a link to watch the videos, and a warning when you try to open the popup outside of claude.ai.

final test, everything working. 3% of usage just to say hello. Claude, have some mercy.

---

## logo

everything was looking good, so it was time to design a logo. ChatGPT is always my go-to for this. I wanted something with a percentage symbol, and I made sure to ask it not to use borders (sometimes it makes the logo look too small at extension icon size). it didn't seem too interested in listening to me and went with its own creative direction anyway, but honestly it looked good. I asked Cursor to resize and replace it throughout the project.

---

## notifications

before shipping, I had one more idea: it'd be really useful to show a notification the moment your limit resets, so you'd know exactly when you're back without having to check.

I sent the prompt to Cursor and, well, it wasn't working. I started going through it (was it the setTimeout? was the logic off?), and turns out it was not. maybe I had notifications disabled by default? yep. I had notifications disabled on my own machine, lol. one setting change later and it worked perfectly. I'm glad I didn't spend hours debugging that one.

---

## shipping

I have a build-and-zip bat file I reuse across all my projects; I just paste it in the folder and it's done. drag and drop the zip into the Chrome Web Store, fill in the metadata, generate a screenshot with ChatGPT (I always give it something to work with: colors, where to place the text, etc.), resize it, and submit.

for the privacy policy section, I copied all the questions and asked Cursor to fill them in for me in a code block so I could copy and paste. then I created a simple privacy policy page on CodedCitadel and that was it.

---

if you want to see the full build process, I covered everything in the video: [I Hacked Claude to Track My Usage Limit](https://youtu.be/iyXIi6pNq-M).

and if you've got a small annoying problem you think could be a Chrome extension, drop it in the comments. I'm always looking for the next one.