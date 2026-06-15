---
title: "I'm VibeCoding My Way to $100K — This Is How It Starts"
slug: "vibecoding-to-100k-youtube-comments-scraper"
date: "2026-05-12"
description: "Episode 1 of VibeCoding Until I Make $100K. I built a free YouTube comments scraper Chrome extension from scratch — design, API, logo, review prompt, and publish. Here's the full process."
download: "https://chromewebstore.google.com/detail/epokpidfnienjjfncmhnallghfhaijbj"
stats: "/apps/youtube-comments-exporter"
tags: ["chrome-extensions", "youtube-api", "indie-hacker", "building-in-public", "vibe-coding", "supabase"]
draft: false
youtubeId: "https://youtu.be/m4iuYN7vsRo"
keyTakeaways:
  - "Chrome extensions have almost no overhead — no hosting, no domain, and the store does a lot of the distribution for you."
  - "Start with a samples folder. Any HTML/CSS reference you give the AI produces much more accurate output."
  - "Use BEM for your HTML and CSS. It makes AI-generated code dramatically easier to read and modify."
  - "Don't resize logos manually. Drop it in the root folder and ask your AI agent to resize and replace it across the project."
  - "A post-install review prompt that splits negative feedback into a private form (not a public review) is worth adding early."
---

# I'm VibeCoding My Way to $100K — This Is How It Starts

I want to build $100k in revenue by shipping software with AI. I know that sounds like every other "zero to X" challenge you've seen. The difference is I'm not trying to sell you anything, and I'm not going to pretend it's going faster than it is.

I've been a dev for 10+ years. I've shipped apps that made real money. But the things that worked before don't work the same way anymore, and I'm starting fresh with a different approach. This is episode 1.

---

## Why Chrome Extensions

I'm starting exclusively with Chrome extensions, and I want to explain why because it's not an obvious choice.

There's very little overhead. No hosting to pay for, no domain to manage, no deployment pipeline to maintain. You zip a folder and submit it. The Chrome Web Store also does a decent amount of passive discovery on its own - it keeps recommending extensions to users, which means you get eyeballs without having to earn every single one.

There's also less competition than you'd expect. Most developers aren't building Chrome extensions seriously. The ones that exist are often abandoned, poorly designed, or paywalled for features that should be free. That's the gap I'm going after, at least for now.

The plan for the beginning is simple: build things that are genuinely useful, make them free, and let word of mouth do the early marketing. Useful free tools get shared. That's the distribution strategy until I have enough of an audience to think about monetization.

---

## The First Extension: YouTube Comments Scraper

The first thing I needed was a tool to scrape YouTube comments so I could feed them to an AI and find pain points and ideas worth building around. I found an existing app that does this but it's paywalled. So I built my own and made it free.

Before writing a single line of extension code, I had a few back-and-forth conversations with Claude to nail down what the MVP actually needed to be. A few decisions came out of that:

- Zustand for state management
- A tabbed UI instead of a standard popup
- A sidebar layout rather than the typical extension popup
- YouTube Data API for fetching comments (there's no shortcut here)

Once I knew what I was building, I moved to design.

---

## Design Process: ChatGPT Generates, Claude Codes

I use ChatGPT for the initial visual design. I tell it what kind of extension it is, what UI patterns I want (tabs, fonts, color ideas), and let it generate mockup images. It's been consistently good at this.

Once I have designs I'm happy with, I send them to Claude and ask it to code the HTML and CSS based on the images. One thing I always do: I use BEM (Block Element Modifier) for all HTML and CSS. It's a naming methodology that makes the code much easier for both AI and humans to read and navigate. If you're not using it, I'd recommend it - the AI output quality improves noticeably.

I also keep a `samples` folder in every Chrome extension project. Anything I want the AI to use as a reference - existing HTML snippets, CSS patterns, design examples - goes in there. For this project I added the sidebar example Claude generated from the ChatGPT designs. When you give the AI real reference material instead of just describing what you want, the output is much closer to what you're after on the first try.

---

## Wiring It Up

For the backend, I used Supabase Edge Functions to keep my YouTube API key out of the extension code. You never want API keys sitting in client-side JavaScript.

The core comment fetching worked on the first real attempt, which was a nice surprise. From there I built out the bulk functionality: you can add individual video URLs one by one or drop in a playlist URL and fetch all comments at once. I also added buttons to open the results directly in Claude or ChatGPT, which felt like the natural next step given what the tool is for.

---

## Logo and Icons

Logo via ChatGPT. I described the extension, said I wanted something minimalist, and it came back with something I actually liked.

One thing worth knowing: when you submit a Chrome extension, it needs the logo in four different sizes. I don't resize these manually. I drop the full-size logo in the root folder and ask Cursor to resize it and replace it throughout the project. Takes about 30 seconds.

---

## The Review Prompt

Before publishing I added one more thing: a post-install review prompt. After the user has had the extension for 10 minutes, a modal appears asking for a star rating.

If they give 3 stars or fewer, it opens a private feedback form. If they give 4 or 5, it redirects them to the Chrome Web Store to leave a public review. The feedback form is wired to Supabase, and I'm also capturing a browser fingerprint so I can tell when the same user sends multiple responses.

This is worth implementing early. You want negative feedback going somewhere you can act on it, not onto your public store listing.

---

## Publishing

I have a `.bat` script that zips the extension folder and drops a production-ready file into a `zipped` folder. One click, ready to submit. After that it's just writing the store description, uploading screenshots, and waiting. In my experience it takes anywhere from 12 hours to 3 days to go live.

This one's live now. Free to install, no trial, no paywall.

---

Episode 2 is already up. More extensions coming.