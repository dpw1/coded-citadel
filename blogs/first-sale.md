---
title: "I Made My First Sale in This Series! (Shopify Client Work, $1400)"
slug: "my-first-sale"
date: "2026-07-03"
description: "How I landed a $1400 Shopify project, used AI to analyze competitors, built a custom product page with metafields, and shipped a full ecom store - all while using a Chrome extension I built myself to sync the theme in real time."
tags: ["shopify", "freelance", "building-in-public", "client-work", "shopify-theme", "prestige-theme", "metafields"]
youtubeId: ""
draft: false
keyTakeaways:
  - "Before writing a single line of code, send the client a mockup. It aligns expectations early and saves you from endless revision cycles later."
  - "Always establish font family, colors and general visual direction before touching the codebase. If the client doesn't know what they're getting, you'll be stuck in a back-and-forth editing loop."
  - "Bullet points and long-form descriptions are not mutually exclusive on a product page. Scanners need bullets above the fold, readers need depth further down. Give them both."

---

# I Made My First Sale in This Series (Shopify Client Work, $1400)

This is part of VibeCoding Until I Make $100K, where I'm building in public from $0 until I hit six figures. If you're new here, the full series is at [codedcitadel.com](https://codedcitadel.com).

Most of this series has been Chrome extensions. But this episode is different: it's the first time I'm making real money from a client project inside this series, and I want to document it the same way I document everything else.

---

## The Project

Since the beginning of this challenge, I have seen Chrome extensions like seeds: they must be planted and cared for, but they will take time to give fruits - assuming that they ever will. Even if they don't, they may become nice trees and give some shading. Who knows? All I know is that there _may_ be some value in there, but it will take time.

Before starting Coded Citadel, I was working as a Shopify developer. This is a field I have a lot of expertise in, so I thought I'd follow the same route.

I started reaching out to a few businesses asking whether they were looking for a Shopify dev and presenting my ["hire me" page](https://codedcitadel.com/work).

I was lucky enough to be able to land a customer after 40~ emails sent. Coincidentally, this customer was looking for a developer for a brand new project, and after a conversation he decided I'd be a good fit for the project. 

I used to work exclusively with Shopify - themes from scratch, custom apps, the whole thing - so this was familiar territory. The total price for the project, a complete website on the coding side, is $1400 USD. I know that might sound like too little or too much depending on where you're from, but I am looking at this customer as a potential long-term client plus the first customer for the "Coded Citadel" brand, and the price reflects that relationship.

After agreeing on the price, he sent me two things: a OneDrive folder with all the product data and images, and a list of competitor websites to use as inspiration.

![](/blog-images/first-sale/SCREENSHOT_10-06-2026-20h31.jpg)
![](/blog-images/first-sale/SCREENSHOT_10-06-2026-20h34.jpg)

---

## Analyzing the Competitors Before Writing Any Code

My first instinct was to fetch the HTML of all the reference websites so I could analyze them locally with Cursor. I asked Claude to write a `.bat` script to do it.

![](/blog-images/first-sale/SCREENSHOT_10-06-2026-20h40.jpg)
![](/blog-images/first-sale/SCREENSHOT_10-06-2026-20h40_1.jpg)

It wasn't fetching everything correctly, so I iterated on the script to try to pull in the CSS and JS as well.

![](/blog-images/first-sale/SCREENSHOT_10-06-2026-20h41.jpg)
![](/blog-images/first-sale/SCREENSHOT_10-06-2026-20h44.jpg)

It still wasn't perfect, so I changed approach: high quality screenshots instead of source code. Good enough for what I needed.

While sorting that out, I also re-read the client's email and realized the reference websites were mostly about copy and messaging, not design. That made things a bit easier. I took screenshots of all the competitor sites, sent them to Claude, and asked it to find patterns - common sections, color palettes, font choices, structural decisions.

![](/blog-images/first-sale/SCREENSHOT_10-06-2026-21h30.jpg)

With the patterns identified, I also fed Claude a few emails from my conversation with the client so it could factor in what the owner actually wanted for the brand. Once I had a clear direction, I wrote the design prompt myself - accent color, general color palette, font family - and generated a first mockup in ChatGPT.

![](/blog-images/first-sale/SCREENSHOT_10-06-2026-21h36.jpg)

The first design was decent but needed to feel more unique, so I incorporated one of the client's actual products into it.

![](/blog-images/first-sale/SCREENSHOT_10-06-2026-21h41_1.jpg)
![](/blog-images/first-sale/SCREENSHOT_10-06-2026-21h41.jpg)

I find it critical to have a visual identity to work towards before touching any code. If you don't, you end up imagining one thing and the client imagining something completely different. A mockup early on kills that mismatch before it becomes a problem.

I wrote the client a thorough email covering everything I found in the competitor analysis - site structure, common sections, typical colors and font families - and included the ChatGPT mockup, making clear it was a reference for feel and colors rather than a pixel-perfect spec. We went back and forth a bit, agreed on the direction, and I waited for the first payment before starting.

---

## Getting Started (And Fixing My Own Chrome Extension First)

A few days later the payment came through. The client purchased the Prestige theme and it was time to get to work.

![](/blog-images/first-sale/SCREENSHOT_15-06-2026-08h55.jpg)

For this project I'm using Shopify Sync, a Chrome extension I built a while ago that syncs a local folder with Shopify theme files using the Shopify window object and GraphQL to handle all CRUD operations directly from the browser. I don't use the Shopify CLI because with theme-only access it's limited and adds an extra layer of complexity. With this extension I can work in Cursor like normal and have everything reflected in the theme in real time.

![](/blog-images/first-sale/SCREENSHOT_15-06-2026-08h59.jpg)

Before I could get started though, the extension itself had a CORS issue I needed to fix. It was trying to send files directly from the content script to the Node.js local server, which doesn't work. The fix was routing it through the background service worker instead: content script → background → Node. Once that was sorted, the bidirectional sync was working correctly - changes on the Shopify theme reflected locally, and changes made locally reflected in the theme.

![](/blog-images/first-sale/SCREENSHOT_15-06-2026-11h28.jpg)
![](/blog-images/first-sale/SCREENSHOT_15-06-2026-11h28_2.jpg)
![](/blog-images/first-sale/SCREENSHOT_15-06-2026-11h29.jpg)
![](/blog-images/first-sale/SCREENSHOT_15-06-2026-11h30.jpg)
![](/blog-images/first-sale/SCREENSHOT_15-06-2026-11h30_1.jpg)

Now we can actually start the work.

---

## Coming Soon Page

The first goal was getting the fonts and colors the client agreed on into the theme. I used Claude to handle the quick CSS changes, and with the Shopify Sync extension running in the background, Cursor's edits were reflected in the theme in real time without me having to manually upload anything.

![](/blog-images/first-sale/SCREENSHOT_15-06-2026-11h33.jpg)
![](/blog-images/first-sale/SCREENSHOT_15-06-2026-11h36.jpg)

The coming soon page came together quickly. Basic, but a solid starting point.

![](/blog-images/first-sale/SCREENSHOT_15-06-2026-12h36.jpg)

I tested the email signup and it was working fine. The client came back with a few specific requests for the page, so I gathered his points, added my own suggestions based on experience with barber ecom stores, and generated a new mockup in ChatGPT combining both.

![](/blog-images/first-sale/SCREENSHOT_15-06-2026-12h40.jpg)

I'm personally a fan of the dark background and gold color combination here. A few subtle animations or a gradient would push it further but we can add that later. After implementing all the requests and adding some load-in animations, the client was happy with the result.


![](/blog-images/first-sale/SCREENSHOT_18-06-2026-08h02.jpg)
![](/blog-images/first-sale/SCREENSHOT_18-06-2026-08h01.jpg)

---

## Homepage

The client sent a specific reference for the homepage layout.

One thing that immediately caught my eye was the scroll-triggered title animation on the competitor site. It looks like a small detail but it gives the whole site a premium feel that clients and their customers both notice.


Keeping consistent animations, colors and sizing throughout a website not only makes your life easier as a developer, it also stops the site from looking like a Frankenstein of different design decisions stitched together.

To analyze the reference site properly, I took a screenshot but it was too tall for Claude to read accurately, so I asked Claude to write a script to split it into multiple images by height. Instead of one 5000px screenshot, I now had a stack of 500px slices that Claude could actually work with.

![](/blog-images/first-sale/SCREENSHOT_18-06-2026-08h05.jpg)
![](/blog-images/first-sale/SCREENSHOT_18-06-2026-08h05_1.jpg)
![](/blog-images/first-sale/SCREENSHOT_18-06-2026-08h07.jpg)

I fed those to Claude alongside a list of available Prestige sections and asked it to write a Cursor prompt to get the homepage started, specifying that all titles needed the same scroll animation as the reference site. I also dug into the competitor's code directly to pull the exact animation CSS and fed that to Claude as well.

![](/blog-images/first-sale/SCREENSHOT_18-06-2026-08h10.jpg)
![](/blog-images/first-sale/SCREENSHOT_18-06-2026-08h10_1.jpg)

After a few rounds of fixes - font sizes, scroll animation triggering, hero images for both mobile and desktop - the homepage was taking shape.


For the hero image I used the Gmail to PDF extension (one I built in this series) to export the client's email thread directly to Claude and pull out the relevant brief without digging through the conversation manually. Then I generated placeholder AI images in ChatGPT for both mobile and desktop.

![](/blog-images/first-sale/SCREENSHOT_18-06-2026-09h35.jpg)
![](/blog-images/first-sale/SCREENSHOT_18-06-2026-09h43.jpg)
![](/blog-images/first-sale/SCREENSHOT_18-06-2026-09h46.jpg)

The client will replace these with real photography later, but the first impression of the website matters even at this stage. A good placeholder image is infinitely better than a blank space or a broken layout.

I also replaced the default bullet points in the features section with custom SVG icons and added subtle hover animations. Attention to detail like this costs very little time and clients always notice it.

![](/blog-images/first-sale/SCREENSHOT_18-06-2026-10h13.jpg)
![](/blog-images/first-sale/SCREENSHOT_18-06-2026-10h14.jpg)

The footer came together the same way: screenshot of the target, screenshot of what we currently had, send both to Claude, get a Cursor prompt back.


While working on the store I noticed an unwanted horizontal scroll on mobile. I tracked it down using a debugging technique I learned in my first junior dev job: delete elements one by one in DevTools until the scroll disappears. When it stops, you've found the culprit. Unwanted horizontal scroll is a hard no from a UX perspective and always worth fixing immediately.


This is the homepage at this stage - no final copy or real images yet, but the structure and design language are there.


---

## First Draft to the Client

After finishing the homepage I sent the first draft to the client and got feedback.

![](/blog-images/first-sale/SCREENSHOT_19-06-2026-07h55.jpg)

I created the collections manually since there were only a few, then fed the client's product XLSX to Claude, converted it to CSV, and imported the products directly into the store.


Product images were not part of the agreement - adding images to each product individually would have consumed hours of work that wasn't scoped into the project. I made sure the client understood that and waited for his reply.

---

## Product Page

After a few days the client came back with direction on how to move forward.

![](/blog-images/first-sale/SCREENSHOT_24-06-2026-14h10.jpg)
![](/blog-images/first-sale/SCREENSHOT_24-06-2026-14h11.jpg)
![](/blog-images/first-sale/SCREENSHOT_24-06-2026-14h11_1.jpg)

He had creative freedom questions about the product page, including whether a feature slider would work better than a written description. My take: both. I always assume visitors are going to be lazy, so redundancy on important information is never a bad idea. At the price point these products sit at, considered purchases justify longer descriptions that address objections and build confidence. But bullet points are essential for scannability, since most visitors scan before they decide to read.

So the plan for the product page was: short benefit-led bullets right below the Add to Cart button (lead with what they get, not how it works - "stays cool for 8 hours" beats "double-wall vacuum insulation"), a scrollable feature section further down with one feature per slide and a supporting image, and accordion tabs at the bottom for specs, box contents, delivery and FAQ.

Before coding any of that, I did a quick research pass on the top barber and clipper stores on Shopify. I pulled a list of popular brands, checked each one on SimilarWeb targeting a global rank of at least under 300k, and took mobile screenshots of their product pages to send to Claude for pattern analysis.


The result was a product page mockup I sent to the client for sign-off.

![](/blog-images/first-sale/mockup-product-page.PNG)

He confirmed, so it was time to build it.

The sticky Add to Cart button was the first thing I tackled. Prestige includes one by default but it's not great. This is the default, untouched Prestige sticky ATC on a $400 theme:


After rebuilding it properly:


For the rest of the product page, I used metafields for the key specs, the pros checklist, the in-the-box pills, and the video section - so the client can update all of it per product without touching any code.

![](/blog-images/first-sale/SCREENSHOT_29-06-2026-02h48.jpg)
![](/blog-images/first-sale/SCREENSHOT_29-06-2026-02h47.jpg)

I also had to do a quick pause to fix the Shopify Sync extension again - it was taking too long when force-pushing files from the browser to the local machine because it wasn't properly comparing files before overwriting. Fixed and back to work.

![](/blog-images/first-sale/SCREENSHOT_29-06-2026-03h04.jpg)

The finished product page:


With animations and final details:


All the metafield sections are fully editable per product directly from the Shopify admin.

![](/blog-images/first-sale/SCREENSHOT_29-06-2026-04h35.jpg)

---

## Final Revisions

The client came back with a few additional requests, all reasonable.

![](/blog-images/first-sale/SCREENSHOT_02-07-2026-03h14.jpg)

The trust widget got updated and is now editable via metafields. The key specs section was updated to accept a list of meta objects instead of plain text.

![](/blog-images/first-sale/SCREENSHOT_02-07-2026-03h15.jpg)
![](/blog-images/first-sale/SCREENSHOT_02-07-2026-03h15_1.jpg)

He also asked for a fast delivery notice, which I added.

![](/blog-images/first-sale/SCREENSHOT_03-07-2026-07h28.jpg)

I applied the same scroll-triggered animation to all the metafield elements for consistency, and implemented a rule that no metafield section renders unless the field has actually been filled in. Empty boxes on a live storefront are a UX problem and something I always account for by default.


The last thing the client sent over was the copy for all products to review. The main issue I flagged was that the FAQs weren't ending with a benefit. Every FAQ answer is an opportunity to reinforce why the product is worth buying, and closing on a positive note instead of just answering the question is a small but meaningful CRO detail.

---

## Wrapping Up

This is the first real money I've made inside this series and it came from the oldest source possible: a returning client. The project isn't fully done yet, but the homepage, coming soon page and product page are all live and signed off.

If you want to follow the rest of the build, everything is at [codedcitadel.com](https://codedcitadel.com).

What are you building?
