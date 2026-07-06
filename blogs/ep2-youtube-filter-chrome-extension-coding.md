---
title: "I Built a YouTube Filter Chrome Extension Using 96 AI Prompts - Here's Exactly How"
slug: "youtube-filter-chrome-extension-coding"
date: "2026-05-17"
description: "Episode 2 of Coding Until I Make $100k: how I built YouTube Filter Pro - a Chrome extension that filters videos by view count and duration - using 96 AI prompts, and the ytInitialData bug that cost me hours."
download: "https://chromewebstore.google.com/detail/youtube-filter-pro-filter/dbkkcbfafkckhmefkpgnelikibobcabb"
stats: "/apps/youtube-filter-pro"
tags: ["chrome-extensions", "coding", "building-in-public", "youtube", "javascript"]
youtubeId: "https://www.youtube.com/watch?v=-saFrB1W9ug"
draft: false
keyTakeaways:
  - "YouTube has no native view count or precise duration filter - that gap is the product."
  - "YouTube loads videos in two phases: ytInitialData on page load, then continuation tokens on scroll. Miss the first phase and your filter silently breaks."
  - "Fetching CSS variables from the host site is a fast, underrated way to make injected extension UIs look native."
  - "96 prompts across research, UI design, code generation, and debugging - prompt count scales with how much you have to debug."
---

# I Built a YouTube Filter Chrome Extension Using 96 AI Prompts - Here's Exactly How

**Published on the Coded Citadel | Coding Until I Make $100k - Episode 2**

---

I spent hours debugging a bug that should have taken minutes to find. The fix was one line. This is that story.

In episode 2 of *Coding Until I Make $100k*, I built **YouTube Filter Pro** - a Chrome extension that lets you filter YouTube search results by view count, video length, and more. YouTube does not have this natively. I used **96 AI prompts** across the entire build. Here's the full breakdown.

---

## What Is YouTube Filter Pro?

YouTube Filter Pro is a Chrome extension that adds advanced filtering to YouTube search results. It lets you filter videos by view count range, duration, and other criteria that YouTube's native UI does not expose. It injects directly into the YouTube page, uses YouTube's own CSS variables for a native look, and stores your filter preferences in `chrome.storage`.

---

## Why I Built It: The Idea Came From a Dead End

Before landing on this idea, I scraped roughly 500 to 600 Reddit comments across the Etsy and EtsySellers subreddits looking for pain points. I chose ecom because people there are already paying for tools - lower friction to monetize.

The Etsy analysis surfaced real problems. But I am not familiar enough with Etsy to build credible solutions for it. So I moved on.

I went to YouTube and started searching for Shopify and ecommerce-related content. I wanted to filter videos by view count - specifically find videos with under 10,000 views for niche research. That is when it hit me: **YouTube does not have a filter for that**. No view count range. No proper date range. No duration filter beyond the basic short/long toggle.

There was my idea.

---

## How to Build a Chrome Extension That Filters YouTube Videos

### Step 1: Reverse-engineer the data source before writing any extension code

My first step for every Chrome extension is a console script - what I call the "hello world." Before structuring a single file, I need a script that proves the core functionality works in DevTools.

For this extension, the core question was: how does YouTube deliver video data to the page?

I opened the Network tab, searched for a channel name inside the response payloads, and found the answer: YouTube returns a JSON object containing view counts, durations, titles, and more. It is not a clean REST endpoint, but it is findable.

Once I confirmed the data shape, I used an LLM to write a browser script that fetched this JSON on demand. It worked. I could pull view counts for videos on the page.

### Step 2: Understand YouTube's two-phase video loading (the bug that cost hours)

This is the critical thing I got wrong and it is worth documenting clearly.

**YouTube's video loading works in two phases:**

1. On page load, YouTube sets a global object called `ytInitialData`. This contains the videos currently visible on the page plus a continuation token.
2. When you scroll to the bottom, YouTube uses that token to fetch the next batch of videos.

I was only intercepting the token-based fetch. That meant I was getting data for videos that were not yet visible - and filtering against that set. Some videos matched by coincidence, which made the extension look like it was working during early tests.

It was not working.

After debugging, the fix was to read `ytInitialData` for the initial set and then monitor scroll-triggered requests for subsequent batches.

**Self-contained answer:** To properly filter YouTube videos in a Chrome extension, you must read `window.ytInitialData` on page load for the initial video set, then intercept the continuation token requests triggered by scrolling to capture subsequent batches. Filtering only against continuation responses means you are filtering videos that are not yet rendered.

### Step 3: Build the UI to match YouTube's design system

I did not design this from scratch. YouTube exposes its full CSS variable set in the DOM. I fetched all of those variables - colors, font sizes, font families, paddings, border radii - and sent them to an image generation model with a screenshot of the target area and a brief UI description.

The result was a filter button placed next to YouTube's search bar that opens a modal. The modal looks native because it uses YouTube's own design tokens.

I then used Claude to generate the HTML and CSS from that mockup, and passed that output into a `sample/` folder inside my project for the AI to reference when building the actual extension.

### Step 4: Keep the architecture simple for an MVP

The extension has no React, no build pipeline, no popup or sidebar. It is a `content.js` injected into the page. Filters are stored in `chrome.storage.sync`. Videos get a data attribute when their metadata is confirmed fetched, and the filtering logic reads those attributes.

Simple is the right call here. The only job of this extension is to filter videos. Complexity would slow everything down.

---

## Results

After fixing the `ytInitialData` bug, all filters worked correctly: view count range, video duration, and combinations of both. The extension filters the visible result set in real time.

One known limitation: "People also watched" and "Explore more" sections are not filtered. They appear to pull from a separate API. For the MVP, this is acceptable. If downloads and user requests justify it, that is a future version.

---

## What I Used and How Many Prompts It Took

- **Qwen** - Fetching and parsing YouTube's network request format
- **ChatGPT Image generation** - UI mockup using YouTube CSS variables; logo generation
- **Claude** - HTML/CSS from the UI mockup; Chrome extension architecture and implementation
- **Total prompts used across the full build: 96**

---

## What I Learned

**Test filtering logic thoroughly before moving to UI.** I assumed the data fetch was correct because some videos were showing correct data attributes. That assumption cost hours. A proper test would have caught the `ytInitialData` gap immediately.

**The hello-world console script is non-negotiable.** If the core logic does not work in DevTools, nothing else matters. Do not skip this step to save time. You will lose more time later.

**Fetching CSS variables from the target site is a legitimate design strategy.** The result looks more native than anything I could have designed from scratch. For extensions injected into an existing product, this approach is underrated.

---

## Pertinent Questions

### Does YouTube have a built-in view count filter?

No. YouTube's native filter options include upload date, type, duration (short/long only), and features like HD or subtitles. There is no native view count range or precise duration filter.

### How does a Chrome extension filter YouTube videos?

A Chrome extension can filter YouTube videos by reading the `ytInitialData` object loaded with the page and intercepting continuation requests triggered by scrolling. Each video's metadata - views, duration, channel name - is available in these payloads and can be used to show or hide DOM elements.

### How many prompts does it take to build a Chrome extension?

This extension required 96 prompts across research, UI design, code generation, and debugging. Prompt count varies heavily based on how much debugging is required and how well the initial architecture is defined.

### What is `ytInitialData` in YouTube?

`ytInitialData` is a JavaScript object YouTube sets on page load containing the initial video results, channel data, and a continuation token for loading more videos on scroll. It is accessible at `window.ytInitialData` in the browser console.

---

*Next episode: the extension goes into the Chrome Web Store. Subscribe to Coded Citadel on YouTube to follow the series.*