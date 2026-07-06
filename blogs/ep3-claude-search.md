---
title: "Claude Has No Way to Search Your Conversations. So I Built One (Free)"
slug: "claude-conversation-search-chrome-extension"
date: "2026-05-23"
description: "Claude's native search only finds conversation titles, not content. I built a free Chrome extension to fix that in 3 hours - full text search, word highlighting, and scrollbar markers. Here's how."
download: "https://chromewebstore.google.com/detail/dfkkbbcdbjaecgnaocgfonoodmfmkmmm"
stats: "/apps/claude-deep-search"
tags: ["chrome-extensions", "claude-ai", "indie-hacker", "building-in-public", "content-js", "vibe-coding", "productivity"]
draft: false
youtubeId: "https://youtu.be/BGhB0gFwv1M"
keyTakeaways:
  - "Claude's 'Enable Deeper Search' button does not actually search conversation content - only titles."
  - "Claude stores conversations in a local API you can fetch directly from the browser."
  - "Copying the target site's HTML and CSS into a samples folder gives AI a much more accurate reference for matching UI."
  - "Scrollbar position markers are a visual trick - a fixed div positioned to match scroll percentage, not a real scrollbar element."
  - "Ship a working MVP before perfecting edge cases. Long conversations breaking CTRL+F is a known limitation even in Claude's own UI."
---

# Claude Has No Way to Search Your Conversations. So I Built One (Free)

Claude does have a search function. It just only searches conversation titles, not what's actually inside them. I found this out the hard way, coded a fix in 3 hours, published it for free, and it got accepted to the Chrome Web Store in 12 hours. This is how it happened.

This is episode 3 of Coding Until I Make $100k.

---

## The Idea Came From My Own Frustration

I started this episode the same way I usually do - scraping Reddit's r/chrome_extensions to find ideas worth building. I sent everything to Claude, asked it to summarize and spot patterns. Productivity and AI tools dominated the results, which made sense, but nothing in there grabbed me. Everything either felt overcrowded or too niche.

After hitting a wall, I went back to a Claude conversation I'd had a few days earlier and couldn't find it. I tried typing in the search bar - only titles came back. I clicked the "Enable Deeper Search" button. Nothing happened. It just... didn't work.

I Googled around to see if this was just me. It wasn't. Other people were running into the same thing. The only solutions I found were paid extensions. So I figured I'd build a free one, use it myself, and add it to the series.

---

## Step 1: Figure Out How Claude Stores Conversations

Before touching any extension code, I always write a standalone script I can run directly in the browser. I just want to confirm the thing is doable before going any further.

The first question was: where do the conversations actually live? Are they stored locally? Is there an API?

I opened DevTools, started a new conversation to trigger some network requests, and found an API that returns all conversation IDs. From there I wrote a quick fetch script to pull each conversation individually and confirmed I could get the full text content out of them.

That was all I needed to know. The data was accessible, the extension was buildable, and I moved on.

---

## Step 2: Building the Extension

The extension is essentially just a search bar that pulls from Claude's local conversation data and highlights matches. Since there's nothing complex going on - no shared state, no rendering logic - I skipped the full toolchain. No Vite, no React. Plain JS, HTML, and CSS.

I wanted the search UI to sit right below Claude's existing search button, and I wanted it to actually look like it belonged there. To pull that off, I copied Claude's actual HTML and CSS into a samples folder in the project. This is a habit I've developed: giving the AI real reference material from the target site produces much more faithful output than describing what you want in words.

I copied two things specifically - the HTML for the search button area, and all of Claude's CSS variables extracted from the page. Then I explained the idea to Claude, had it generate a prompt, and handed that to Cursor. One prompt, a few minutes, and it was almost working. The only bug was that conversations weren't being stored properly after fetch. Fixed that, and the core search was done.

---

## Step 3: The Bells and Whistles

The core was done faster than I expected, so I figured I'd add a couple of things.

The first addition was word highlighting - marking every instance of the search term in the conversation text. Not too complex.

Then I had another idea: scrollbar markers. Little indicators on the right side of the screen showing at a glance where all the results are, similar to how some code editors show search hits in the minimap. I wasn't even sure this was possible to build.

Turns out it's a visual trick. There's no way to inject actual elements into the browser scrollbar. What I did instead was create a `position: fixed` div that tracks the scroll percentage and positions colored markers to match where each result sits in the document. It looks like scrollbar markers. It's not. But it works.

The catch: long conversations. When there's a lot of HTML on the page, things get messy. Even Claude's own CTRL+F has issues in very long conversations. This is one of the harder parts of coding content.js stuff - Cursor can't see the full rendered page or debug it properly the way you can with a standalone app. So there are limitations.

I fixed it enough to be useful and moved on. Having something out there that works for most cases is better than chasing perfection on an edge case before anyone's even using it.

---

## Publishing

Logo via ChatGPT - I wanted a search icon, Claude's brand color, and the letter C. Cleaned up the background in Photopea, done.

For screenshots, I sent ChatGPT a screenshot of the extension's search bar plus a reference screenshot from another extension I liked, and asked it to generate store screenshots. They came out good.

For the store listing copy, I do the same thing I always do now: ask Cursor to fill in the Chrome Web Store fields based on the project it already has full access to. The extension, the code, the README - it knows everything. This used to take a while. Now it takes a few minutes.

The extension was accepted within 12 hours of submission.

---

## A Few Things Worth Taking Away From This One

The idea came from a personal frustration, not from a research session. The research session failed. Keep that in mind next time you're stuck trying to "find" an idea - sometimes you're already living it.

The samples folder trick is underrated. Copying the actual HTML and CSS from the site you're building for and dropping it into a reference folder gives the AI something concrete to work with. The output quality goes up noticeably.

And on the scrollbar markers - it's worth knowing that a lot of UI effects that look complex are just positioning tricks. The constraint (can't touch the real scrollbar) forced a simpler solution that worked fine anyway.

---

If you want to try the extension, it's free on the Chrome Web Store. Link in the video description. More extensions coming - including what might eventually become a multi-AI search that covers ChatGPT, Claude, and others in one place.