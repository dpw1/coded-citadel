---
title: "How I Reverse Engineered Instagram to Export DMs - No API Key Needed"
slug: "instagram-dm-exporter-chrome-extension"
date: "2026-05-28"
description: "I built a free Chrome extension that exports any Instagram DM conversation in one click - by reverse engineering Instagram's own network requests. Here's the full process, from idea to publish."
tags: ["chrome-extensions", "instagram", "reverse-engineering", "indie-hacker", "building-in-public", "vibe-coding", "content-js"]
draft: false
youtubeId: "https://youtu.be/tBSZ1oD5OM8"
keyTakeaways:
  - "You don't need an Instagram API key to fetch DM data - the auth tokens you need are already in the page."
  - "Instagram uses random CSS classes to prevent scraping. Use CTRL+F in the Elements tab to find patterns that are truly unique."
  - "Always start with a working browser script before touching the Chrome extension. If it works in DevTools, wiring it up is the easy part."
  - "Redundancy in UX is a feature - adding the download button in both the popup and injected into the page removes friction."
  - "Use a setInterval to re-inject UI when the user navigates between conversations. Lightweight and reliable."
---

# How I Reverse Engineered Instagram to Export DMs - No API Key Needed

This Chrome extension exports any Instagram conversation in one click. No API key, no OAuth, no permissions to request. Just reverse engineering what Instagram's own page is already doing.

I'm going to walk you through how I found the idea, how the reverse engineering actually works, and how I built and published the extension. Let's get into it.

---

## How the Idea Came Up

I used to build Instagram automation tools back in 2022, so I know the ecosystem reasonably well. I started this one by looking at what other developers were building in that space - chrome extensions to check who unfollows you, download images and videos, audio rippers, and so on. All of it felt crowded.

I had one idea I thought was interesting: a tool to extract all the text from an Instagram page's videos in one click, so you could feed it to an AI as a knowledge base. Imagine following a tutorial account and being able to ask AI questions based on everything that person has ever posted. I didn't go deep on it though, because the first thing I searched was "transcription Chrome extension" and found something already very popular doing exactly that.

I kept looking. Then I remembered a friend asking me years ago how to export Instagram DMs. Back then the only option was requesting a full data export from Instagram, which takes days and gives you way more than you asked for. I searched the Chrome Web Store and found basically one paid extension doing this. That was enough validation.

---

## Reverse Engineering Instagram's DM Loading

Before building the extension I needed to understand how Instagram actually loads conversations.

I opened a DM thread, hit F12, went to the Network tab, and used CTRL+F to search for a word I knew was in the conversation. This is a simple but effective trick - if the word shows up inside a JSON response, you've found the API call responsible for loading that content.

It showed up. I found the URL and the payload structure, sent it all to Claude, and asked it to write a function that could replicate those requests on demand.

The way it works is in two parts. First, you need to extract a handful of auth parameters that Instagram already has in the page:

```
fb_dtsg      // auth token from Instagram's script tags
lsd          // lightweight session token, also from script tags
csrftoken    // pulled from document.cookie (not HttpOnly, accessible via JS)
convo_id     // parsed from the current URL - e.g. /direct/t/123456/
```

None of these require a separate API key or OAuth flow. They're already there.

Second, you make a POST request using those parameters to fetch the conversation content. Instagram's "infinite scroll" in DMs is basically pagination under the hood, so you just loop through pages until you've fetched everything.

Once this script was working in the browser console, the hard part was done. Wiring it into a Chrome extension is straightforward from there. This is why I always start with a browser script first - if it works in DevTools, the extension is mostly just plumbing.

---

## Building the Extension

### Extracting Instagram's CSS

Whenever I build a Chrome extension that injects UI into an existing website, I extract all the CSS variables from that site and add them to the project's samples folder. It helps the AI generate UI that looks like it belongs on the page rather than something foreign dropped in.

### Finding the Right Injection Point

I needed to find exactly where in Instagram's DOM to inject the download button. The tricky part: Instagram uses randomized class names specifically to make scraping harder. There's no `.dm-conversation-header` to target.

The way around this is to look for structural patterns instead of class names. I used CTRL+F in the Elements tab and searched for CSS patterns until I found one that returned exactly one result. That's your injection point. One match means it's unique to that element, which means you can rely on it.

### UX Decisions

I added the download button in two places - inside the popup and injected directly into the conversation page. Some people might call that redundant. I think redundancy in UX is a feature. The less the user has to figure out, the better.

One issue I ran into early: the popup had to stay open while the export was running, which is terrible UX. I fixed it by having the popup trigger content.js and letting the download run from there. Popup closes, download continues in the background.

I also added a setInterval that runs every second and checks whether the user has navigated to a different DM conversation. If they have, it re-injects the button for the new conversation. It's a lightweight check and it keeps the UI in sync without any complex event listeners.

The export format options (JSON, TXT, etc.) started out only in the popup, but I moved them into the injected toast as well. Keeping the user in context is always worth the extra few lines of code.

### Logo

ChatGPT for the logo, as always. Once I had one I liked, I cleaned it up in Photopea - removed the white margins, made the background transparent - then asked Cursor to resize it to the four sizes Chrome requires and replace it throughout the project.

---

## A Note on Separate Tutorial Videos

One thing I'm planning to do for each extension in this series: a short standalone tutorial video aimed at people who just want to use the tool, not watch the build. For this one it'll be something like "how to export Instagram DMs." I'll also link those videos from the Chrome Web Store listing, which I think helps with both visibility and downloads.

More on that as I test it.

---

The extension is live and free. Link in the video description. Next one's already in progress.