---
title: "I Built a Chrome Extension That Saves Any File to Google Drive in One Click - In Under 8 Hours"
slug: "chrome-extension-save-to-google-drive-under-8-hours"
date: "2026-05-31"
description: "How I built and shipped a save-to-Google-Drive Chrome extension in under 8 hours - OAuth setup, context menu bugs, MV3 limitations, and the full AI-assisted design workflow. Episode 5 of VibeCoding Until I Make $100K."
tags: ["chrome-extensions", "google-drive", "indie-hacker", "building-in-public", "manifest-v3", "oauth", "vibe-coding"]
draft: false
youtubeId: "https://youtu.be/D4-1VtvkdIw"
keyTakeaways:
  - "Don't handle Google OAuth in the popup - delegate to the background service worker from day one."
  - "Manifest V3 does not support custom icons for context menu items. Not a bug, just a limitation."
  - "After 3 to 5 prompts with no progress, switch to a stronger model. Don't grind."
  - "Always audit your manifest.json permissions before submitting - AI tools add more than you need."
  - "Generate a fixed extension ID during development to avoid OAuth mismatches on publish."
---

# I Built a Chrome Extension That Saves Any File to Google Drive in One Click - In Under 8 Hours

https://youtu.be/D4-1VtvkdIw

Most Chrome extensions take days to go from idea to deploy. This one took less than 8 hours. I'm going to walk you through exactly how I built a save-to-Google-Drive extension - the research, the auth headaches, the bugs, the design process, all of it - so you can build yours faster.

This is episode 5 of VibeCoding Until I Make $100k.

---

## The Idea Came From Reddit (As It Often Does)

I wasn't sitting around trying to invent a problem to solve. I stumbled onto a Reddit thread in r/chrome_extensions where someone literally posted: "someone could build this." They were asking for an extension that saves any file, image, or link directly to Google Drive with a right-click.

That's the kind of validation you want before building anything.

My first instinct was to check whether this would violate Google's policies. This is not a trivial concern - LinkedIn has a similar gray area with a popular extension that touches privacy policy in ways that create real competition barriers. I researched it (okay, I asked Claude, which counts as research), and the short answer was: you're fine as long as you don't use "Google" in your extension's name and don't make the UI look like Google Drive.

I then searched for competitors. There were some, but the demand was clearly there and being explicitly requested, which told me there was a niche worth entering.

One review in the Chrome Web Store stood out. A user on an existing save-to-drive extension was complaining that the extension downloaded files locally first, instead of putting them directly into Google Drive. They wanted a bypass - send CSV, PDF, DOC files straight to a Google Drive folder without touching the local machine.

That seemed doable. I checked whether Google's API supported requesting only write access to Drive. It did. Perfect.

Spoiler: it turned out not to be possible in practice. But more on that shortly.

---

## Setting Up OAuth (And the Mistakes I Made)

The first real technical challenge with any extension that touches Google services is OAuth. You need to create an OAuth client via Google Cloud Console before your extension can write anything to a user's Drive.

The flow I wanted was simple: user clicks the extension popup, logs in once, then right-clicks any file or image on any webpage and saves it directly to their Google Drive.

Here's something I've learned from past projects: popups can not reliably handle Google OAuth. If you've ever tried to do a Supabase Google OAuth flow from a popup, you know exactly what I mean - it breaks in frustrating ways. So from the start, I planned to delegate the authentication from the popup to the background service worker. The popup triggers the auth, the background script handles it.

I still ran into a bug early on. My first assumption was that I'd selected the wrong OAuth client type - "web browser" instead of "Chrome extension." So I deleted it and started over with the correct type.

One thing that caught me here: when setting up the OAuth client for a Chrome extension, you need an "item ID" - basically your extension's unique Chrome ID. Don't just copy it from `chrome://extensions`. I highly recommend generating a fixed one manually instead, because when you publish to the store it tends to generate a new ID, and suddenly your OAuth config is pointing at the wrong thing.

Worth knowing: this only matters during development. You'll need to update the ID anyway once it's live on the store.

---

## The File Permission Problem

Once login was working, I hit the issue I'd been hoping to avoid: Google's API does not let you display scope permissions as narrowly as I wanted. Even though I only needed "create new files" access, the OAuth consent screen was showing users "add, edit, and delete files" - the full Drive scope.

I researched this for a while. Turns out Google has fixed wording for their permission scopes. There's no way around it.

So I added a note in the popup being upfront about it: the extension only creates files and has no ability to read, edit, or delete anything already in your Drive. Not ideal, but the alternative was pretending the limitation didn't exist.

---

## Building the Context Menu

What I wanted was simple: right-click anything on any page, see "Save to Google Drive," click it, done.

Adding the context menu entry itself was fine. The bug came when I tried adding a custom icon to it - nothing was working no matter what I tried. After a few prompts going nowhere with Cursor's auto mode, I switched to Claude Sonnet 4.6 directly. That's my general rule - if 3 to 5 prompts haven't moved the needle, stop grinding and switch to a stronger model.

Turned out the issue wasn't the code at all. Manifest V3 just doesn't support custom icons for context menu items. Not fixable. I moved on.

Then during testing: clicking the option did absolutely nothing. No save, no error, just silence. Took me a minute to realize I'd never actually connected the click handler to the save function - it existed, it just wasn't wired up. Once that was sorted, saves started going through.

New problem: the extension kept creating a duplicate "Downloads" folder in Drive instead of saving to the existing one. The fix was looking up the folder by its ID and always writing to that same ID, rather than searching by folder name each time and accidentally spawning a new one.

Debugged that one for a bit, but after it clicked it was solid.

---

## One More Bug Worth Mentioning

When right-clicking images, the extension was grabbing the wrong URL - the surrounding link's `href` instead of the image's `src`. So it was technically saving something, just not the image.

The fix was to check for a `src` attribute first whenever the context menu fires on an element. If there's a `src`, use it. If not, fall back to `href`. Simple stuff, but easy to miss when you're moving fast.

---

## Design: ChatGPT for UI, Claude for Code

With the functionality stable, I moved to design.

My process here is a bit split. I asked Cursor to describe the current UI and functionality in plain language, then sent that description to ChatGPT to generate a UI design. I didn't want to use any Google Drive colors or design patterns - that's an easy way to get your extension rejected on submission - so I went with Coded Citadel's color palette instead (black and gold, Montserrat).

Once I had the design direction, I asked Claude to write the HTML, CSS, and JS for it, then had Cursor implement it into the extension. Claude handles the artifact creation cleanly; Cursor handles the integration into the existing project.

While Claude was coding the UI, I used ChatGPT to generate logo options in parallel. Once I had a logo I liked, I asked Cursor to replace the old one across the entire project. No manual file hunting.

The design update broke the login flow - which is something to expect whenever you touch the popup HTML significantly. I fixed that and spent another chunk of time on small UX improvements: better login error handling, the ability to rename files before saving, an X button on save confirmation toasts, a cleaner folder name.

---

## Google OAuth Review: A False Alarm

I thought I'd need to go through Google's OAuth verification process, which can take weeks. After digging deeper into the Google Cloud Console, I realized I had unnecessary scopes enabled - ones I'd never actually needed but that had been added during development without me noticing. This is extremely common when using AI-assisted development. AI tools will sometimes request broader permissions than necessary just to make something work.

I removed all the unused scopes, which dropped my app out of the extended review requirement. Worth double-checking before you submit anything.

---

## Cleaning Up Before Submission

The last step before submitting to the Chrome Web Store was a cleanup pass.

This is something I always do on AI-assisted projects: go through the permissions in `manifest.json` and remove everything that isn't actively used. AI coding tools tend to add permissions defensively - "just in case." Unnecessary permissions make your extension look suspicious to reviewers and to users.

I also generated store screenshots via ChatGPT, wrote the store listing copy, and had Cursor fill in all the Chrome Web Store submission fields based on the project context.

Total time from idea to submitted: under 8 hours.

---

## Key Takeaways for Building Chrome Extensions Faster

A few things from this build that are worth internalizing:

**Do your policy research early.** A 30-minute check on OAuth scopes and naming restrictions at the start can save you from rebuilding things later.

**Don't handle Google OAuth in the popup.** Delegate to the background service worker from day one. You'll thank yourself later.

**Generate a fixed extension ID during development.** Avoids ID mismatch issues when you publish.

**If the AI is stuck after 3 to 5 prompts, switch models.** Don't grind. A stronger model will usually resolve it in one or two prompts.

**Clean up permissions before submitting.** AI tools add more than you need. Audit your `manifest.json` before it goes anywhere near the Chrome Web Store.

**Design in parallel.** While Claude is generating UI code, use another tool for the logo. The hours you save by running things in parallel add up fast.

---

If you're building Chrome extensions or following along with the VibeCoding series, the full video walkthrough is up on the Coded Citadel YouTube channel. More extensions coming.