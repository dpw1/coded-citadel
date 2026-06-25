---
title: "Track When ANY Video is Uploaded to Youtube W/ This Chrome Extension"
slug: "ep-10-youtube-keyword-alert"
date: "2026-06-21"
description: "How I built YouTube Keyword Alert, a Chrome extension that runs background searches on YouTube and notifies you when new videos matching your filters go live. No tab required. Full build diary with CORS workarounds, background search architecture, and UX decisions."
tags: ["youtube-creator", "chrome-extensions", "building-in-public", "youtube-automation", "vite-chrome-extension"]
youtubeId: "https://youtu.be/CdIXEKUTewE"
draft: false
keyTakeaways:
  - "Mock the design first in ChatGPT, then hand it to Claude to implement. The extra detail in the prompt makes a real difference in the output quality."
  - "CORS will block you from YouTube's InnerTube API in a background service worker. The workaround is a plain GET to youtube.com/results and parsing ytInitialData from the HTML response."
  - "Chrome extension alarms + background fetch work even when the YouTube tab is closed. Once the user visits YouTube once, searches can run indefinitely without any tab open."
---

Imagine if you could be notified every time a video with certain keywords is uploaded to YouTube.

Let's say you're waiting for GTA 6 leaks. You already know the channels that post fake content, so you can exclude them. And you know that a decent leak video would have at least 2 minutes of content, so you add that to the filter as well. Now, every time a video with these settings is uploaded to YouTube, you get notified.

This is what you can achieve with YouTube Keyword Alert.

You add keywords to include and exclude, and every time you go on YouTube it will silently search for you, without impacting performance or slowing anything down. You can just leave it working quietly in the background. And whenever something is found, it will notify you.

You can watch the full build here: [https://youtu.be/CdIXEKUTewE]

---

## The initial idea

[INCLUDE IN VIDEO]

My starting point was personal frustration. I was curious whether other people were doing "coding until I make X" challenges on YouTube, similar to what I'm doing on this channel. Searching for it manually every day was not practical.

So the premise was: what if a bot could search YouTube every few hours and flag new videos that match specific keywords?

I had worked with YouTube's DOM and API before in previous episodes (the YouTube Comments Exporter and YouTube Filter Pro), so I already had reference code to pull from. That gave me a head start.

The first version was a simple browser script. No extension, no UI. Just enough to confirm the idea worked.

The two requirements I set for myself:

Search for videos matching a keyword in the background
Console log everything it finds

Once that was running, I could move on to the real thing.

---

## The first problem: channel data enrichment is slow

[INCLUDE IN VIDEO]

The first version of the script fetched videos fine, but enriching the channel data (pulling subscriber counts, etc) was taking a long time. Some subscribers weren't being fetched at all.

The bug turned out to be a path issue. The script was looking for a top-level `subscriberCountText` field in the JSON response, but the actual value was nested deeper in the object. Once I fixed the path, everything came back correctly.

But there was a bigger problem underneath this one: the enrichment process was slow enough that I couldn't run it in the background service worker. It would trigger CORS issues. I needed a different architecture.

---

## Planning the Chrome extension

[INCLUDE IN VIDEO]

Before writing any code, I mapped out what I actually wanted to build:

Vite-based architecture (same as my previous extensions)
An install redirect and an uninstall redirect URL (something I hadn't been adding but should have from the start, since it helps build the broader ecosystem around the tool)
A content script only for search, with all the management happening in a separate HTML tab
Multiple filters, each one with its own set of include/exclude keywords

The "multiple filters" part was important. I wanted something like:

GTA 6 news => "gta 6", "leak"
Anthropic news => "claude", "updated", "new"

Each filter independent, each one with its own result set.

I brainstormed the architecture with Claude, got a detailed prompt, dropped it into Cursor Composer 2.5 and within 4 minutes had a working "thank you" page and the skeleton of the extension.

---

## The CORS wall (and how I got around it)

[INCLUDE IN VIDEO]

The original plan was to use YouTube's InnerTube API from the background service worker. That failed immediately because of CORS, which I expected.

My second approach: build the search query from the filter keywords and make a plain GET request to `youtube.com/results`. YouTube returns an HTML page with `ytInitialData` embedded in it as a JSON object. I've worked with that object in previous episodes. The downside is you only get the first page of results, but for keyword alerting that's fine.

The problem was that even plain GET requests to YouTube were getting blocked in the background worker.

I came across a blog post at [https://www.codestudy.net/blog/access-to-fetch-has-been-blocked-by-cors-policy-chrome-extension-error/] that explained exactly how to bypass CORS from a background script in a Chrome extension. I sent it to Cursor and asked it to implement it in the project.

It worked. First try.

[INCLUDE IN VIDEO]

This was a meaningful architectural win. The user visits YouTube once, the extension picks up the session context, and from that point on the background service can run searches indefinitely without any tab open. Much better UX than anything tab-based.

I also added local caching for channel data so we don't re-fetch it constantly.

---

## Building the filter system

[INCLUDE IN VIDEO]

With the core search working, I added the full filter management UI. Each filter has:

Keywords to include
Keywords to exclude
Minimum video duration
A checks tab showing recent search history
An "unsaved changes" warning so you don't accidentally close and lose your work

One thing that bothered me early on was how unreadable the filters looked. A filter called "basic" tells you nothing. I took the same approach I used in YouTube Filter Pro and added a human-readable summary line below each filter name. Instead of "basic", you'd see something like "Videos matching 'gta 6' or 'leak', at least 2 minutes long, excluding 'reaction'." Much better.

I also set up a strict z-index system for the layered UI elements (modal at 2, confirmation dialog at 3, toasts at 4). When you have multiple overlapping elements, this stuff matters.

---

## Fixing the design

[INCLUDE IN VIDEO]

The functional version worked but looked rough. I described what I wanted to ChatGPT first, but the level of detail I gave it made the output crowded and hard to implement. I switched to Claude with a cleaner, less prescriptive brief and got HTML/CSS/JS that was much closer to what I had in mind.

I dropped the Claude output into a "samples" folder for Cursor to reference and asked it to replace the existing UI. The result:

[INCLUDE IN VIDEO - SCREENSHOT_20-06-2026-22h05.jpg]

I also created two custom icons (I sent Claude a PNG reference and asked it to convert to SVG) for the results tab. Pagination was added in the format I always use:

`< 1 2 3 ... 99 >`

Export and import for filters was added using Chrome storage. I didn't want to set up Supabase before validating the extension with real users first.

---

## Does the background search actually work?

[INCLUDE IN VIDEO]

This was the real test. I added a "search in 1 minute" button, pressed it, closed the YouTube tab, opened a different website and waited.

First attempt, nothing happened. I spent a while debugging.

Then I realized the filter I was testing with was too strict and nothing matched. The background search had been working the whole time.

[INCLUDE IN VIDEO]

---

## Live stats

[INCLUDE IN VIDEO]

All stats below were manually pulled from the Chrome Web Store developer console. Nothing is automated. I'm sharing them publicly as part of building in public.

[INCLUDE LIVE STATS HERE]

---

## Submitting to the Chrome Web Store

[INCLUDE IN VIDEO]

Something I always do before submitting is ask Cursor to write the Chrome Web Store description in my own voice. A while back I fed a big sample of my writing (Reddit posts, comments, blog copy) to Claude and asked it to create a writing style guide. I now drop that guide into the prompt whenever I need Cursor to write copy that actually sounds like me instead of generic extension marketing.

[INCLUDE IN VIDEO]

The extension was submitted and approved. This is number 10.

[INCLUDE IN VIDEO - chrome_BCofr6v8lb.mp4]

---

## What I'd do differently

The tab-based search approach I started with would have been a dead end. The CORS workaround via background fetch was the right call and I wish I'd researched it earlier before spending time on the content script approach.

The human-readable filter summaries were a late addition but probably the most important UX decision in the whole project. If a user can't immediately understand what a filter does, they'll delete it.

Export/import using Chrome storage is good enough for validation. Once there's user demand, Supabase is the obvious next step.

---

If you're building something similar or have run into the same CORS wall, feel free to drop a comment on the video. And if you find the extension useful, a review goes a long way.

[https://youtu.be/CdIXEKUTewE]