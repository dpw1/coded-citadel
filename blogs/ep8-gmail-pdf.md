---
title: "Bulk Export Gmail Emails to PDF in Seconds (How I Built This Chrome Extension From Scratch Under 15 hours)"
slug: "ep-8-gmail-to-pdf"
date: "2026-06-13"
description: "Save Gmail emails as PDF, HTML, TXT, or JSON without login or invasive permissions. A dev diary on reverse-engineering Gmail, fixing html2pdf, and shipping an MVP to the Chrome Web Store in less of a day of work."
tags: ["gmail-to-pdf", "chrome-extensions", "building-in-public"]
thumbnail: "/blog-images/ep8-gmail-pdf/ep8.png"
draft: false
keyTakeaways:
  - "Existing Gmail PDF extensions broke, asked for logins, and cluttered the UI - so I built my own with minimal permissions."
  - "Reverse-engineering Gmail's network calls in the browser console came first; the Chrome extension and html2pdf pipeline came after."
  - "PDF export was the hardest part - an offscreen HTML page was the fix for large emails that html2pdf silently failed on."
  - "If the user is going to spend more than 50% of the time interacting with the app looking at a UI, then do put good effort in it."
 
---

# Bulk Export Gmail Emails to PDF in Seconds (How I Built This Chrome Extension From Scratch Under 15 hours)"

**Gmail to PDF** export should be simple: select emails, click a button, done. Long story short, it wasn't. The Chrome extensions I relied on for years started failing, asking for logins I didn't want to give, and cluttering the Gmail UI with buttons I never asked for. So I coded my own.

This is the full story of building **Gmail to PDF: Save Emails as PDF, HTML, TXT** - from a browser console script at 02:30 in the morning to a published Chrome Web Store extension with minimal permissions and no account required.

---

## Chapter 1: Why I stopped trusting Gmail PDF extensions

I have been using a Chrome extension for a long time which exports GMAIL emails as PDF files, but recently it has not been working properly. It used to be my fav extension. 

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_14-06-2026-03h22.jpg)

So it was time to find a new one.

Even though there are many chrome extensions that export to pdf, the only one with good reviews that I found requires you to login, which I also find unnecessary for a simple extension like this.

And even then, the reviews have been very mixed lately as well, and the extensions have not been updated recently.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-00h50.jpg)

There are many different extensions achieving this, but all with low reviews. I also do not like giving permission to unknown extensions when it comes to accessing private data like this - I am extremely picky when it comes down to privacy, so I prefer to code something myself.


Another thing that I am not fond of is how the PDF button is explictly added to the gmail UI. I find that this is somehwat of a disruptive UX, and this is something I don't want in this extension that we are going to build.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-02h41.jpg)

I am also considering exporting emails as MD, PDF, TXT and HTML, but I'm not completely sure yet - let's see how it goes. It depends how complex this extension is going to be.

I am starting this project at roughly 02:30 in the morning. Let's see how long it takes to complete.

### What I wanted instead

A **Gmail to PDF** tool that:

- Exports selected emails without opening each one manually
- Does not require a login or account with a third-party service
- Uses as few Chrome permissions as possible
- Injects a subtle button only when you actually select emails (not a permanent UI clutter)
- Optionally exports to **PDF, HTML, TXT, and JSON**

---

## Chapter 2: Hello world in the browser console (before Cursor)

If you watched any of my previous videos, you know that most of the times I will start coding in the browser before I even open the code editor, Cursor in this case.

With the exception of chrome extensions that do need a 'background.js' or some sort of database, I prefer to have a simple 'bare bones' of what I plan to do before planning the architecture.

My first step here is to open the gmail and see if it triggers any network calls on the network tab.

I need to find a way to read the entire gmail email.

### Finding email data in Gmail's network traffic

So, I open an email and paste a piece of the email's content in the network search tab, and I'm able to find a JSON containing the email data.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-02h46.jpg)

Now something that I must do is to check whether this data can be accessed from the gmail page as well with a network call, or if I will always need to open the email to fetch it. I also need to understand if the entire content of the email is available in this JSON object (for long emails) or if we need to find a way to 'open' these emails.

To test that, I will open the gmail in a new tab, and search for that string again. This way I can check whether it's visible on the homepage.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-02h48.jpg)

So the data is actually there from the getgo. This means that if the user clicks on the checkbox, we would be able to fetch the conversations without having to open the email (in theory).

Still, I'm not confident this would work with very long emails, so when we open an email, let's see whether there is a network call being made and then we can create a function to 'fetch on demand' an email's content.

There are many things coming through, so I need to filter by fetch calls.

I see one specific object but it doesn't seem to have any valuable data.

Let's keep searching.

There is a lot of this data coming from the '_GM_setData', but I'm pretty confident this is being fetched exclusively the homepage data.

### The surprise: Gmail loads entire threads upfront

I am going to test with some personal emails to filter longer conversations.

To be able to see how much of the emails content this 'initial data' object is fetching that I mentioned earlier, open a long email (92 conversations) and open a message in the middle and copy a specific, unique phrase. Let's see if it's able to fetch this unique phrase without me having to open the message.

Ok, I'm actually surprised: it does seem to be loading the entire conversation in this object! So now we have to find a way to fetch this in demand.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-02h58.jpg)

**Gmail to PDF takeaway:** Gmail preloads thread data in its initial page payload. You do not always need to open an email to read its full content - but you still need to figure out how to fetch it on demand via the same POST endpoints Gmail uses internally.

---

## Chapter 3: Reverse-engineering Gmail's fetch API

Let's see how to fetch this on demand.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-03h01.jpg)

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-03h01_1.jpg)

It is doing a post call to this specific URL and probably passing some tokens/data to it. Let's see if claude can help us here.

I copy all of the headers data, modify the cookies and sensitive data and send to claude asking it to create a script that I can run in the browser where I can export selected emails, based on an email id or on the curently open email. I also pass along some css selectors. I found out that the emails unique IDs can be found in the 'id' element.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-03h22.jpg)

I do not expect the 'based on email id' to work just yet but I appreciate claude's creative approach here, let's see what happens.

Initially it simply opens the email on a new tab and tries to fetch it, not really what I want.

Let's try something simpler: simply console AND export to html specific selected emails.

Ok, that works! it does not seem to be fetching attachments though. Let's see what we can do about that.

Once I have the basics nailed down (explored network tab, understand the URLs of POST/GET, etc), it's a simpler process of just chatting with Claude. This is where AI really shines. you do need to understand where to start and how to get things going, once you do, things get easier. AI can make technical part simple if you give it good instructions.

---

## Chapter 4: Attachments, regex, and why background.js matters

Based on that, I asked claude to improve that script to include attachments downloads.

Well... I think that fetching the attachments won't be a simple thing.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-03h27.jpg)

Some interesting things: the attachments are not being read properly when fetching them from the 'checkbox'. Maybe it would be possible to fetch them correctly when opening the email. It keeps returning the 'illegal' url.

So, I did a small test: open an email with an attachment, get its SRC and see if I can open it in a new tab.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-03h37.jpg)

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-03h37_1.jpg)

And yeah, it does work! it may appear small but this is because of the query string that we have 'w180-120' etc. I believe this is something fixable.

Excellent! it's actually fetching the attachments correctly and in the right size.

### The base64 image replacement loop

Now let's send this working script to claude and ask it to implement the download html including the attachments in a separate folder perhaps.

These URLs can only be accessed by the authenticated current user (different than for example google photos urls), so I am unsure whether we can directly download them with code without triggering CORS. let's see.

Almost perfect! the only issue is that in the generated HTML, the string of 'filename' must be replaced with the base64 image.

Now it's working perfectly! the only issue is that the images are way too large. let's create a class for the images so the user can control the width of the images, we make it 350px default.

No changes, it seems like the `<style>` is not being injected in the HTML.

There were a couple of complexities here; the class was being added twice, and the latest one (with the class to change the attachments width) was being overwritten. So I decided to add a data-attribute and the `<style>` in the head, not before `</body>`.

I ended up finding another bug where the attached images detected in the email were being added at the bottom, so I addressed that as well.

Claude was using some excessive regex. My suggested approach:

```
basically what we need to do is:

get the data from this console log:

[CCgmail] Attachments (3): (3) [{…}, {…}, {…}]

for each of them, we need to:

find the exact 'filename' in the html
convert the image to base64
replace the file name with <img class="CCG-image" src="base64" />
download .html
```

Almost perfect! now the image is small, but the previous image is still there.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-04h19.jpg)

Let's include this in our script. after replacing the image, we also need to remove all `a>img[class]:not([class*='CCG'])`.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-04h21.jpg)

Editing existing websites is always tricky because: 1. things can change and break at any time and then you need to update the code - 2. debugging always takes a long time. It's still my favorite type of code!

There is still a bug finding all the attachments and their respective names, so instead of directly downloading the html, I'm gonna console log it for now. Even though I am able to fetch the attachments, I'm unable to get its correct name. Regex is the wrong tool for HTML parsing.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-04h29.jpg)

Also, one main issue is that we are only fetching attachments, not only images that were copied and pasted.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-04h37.jpg)

So we need to find all images in the HTML and fetch their src. Their src in the document contains only the query string. we need to add the gmail path to it.

There is an improvement now. the base64 images being inlined were not in the best quality, so I made sure to remove the query strings that would cap down its quality before converting the image to base64.

The images are being embedded, but attachment images are still in low quality, even though copy pasted images are in the best quality possible.

Now the images are being loaded correctly with the correct size in the html. And I also added a class to the images.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-05h01.jpg)

It's not being able to successfully find all attachments either, and this is because gmail website won't accept 'DOMparser' so we can't really search for that data in our script that runs in the browser. CORS issues. So background.js will be important to move forward with this project.

---

## Chapter 5: Building the Chrome extension (minimal permissions)

So, the first step here is to brain storm my ideas with claude, so it can help me write a proper prompt to cursor.

I am always adamant about using as few permissions as possible. This is the number one thing that will slow down your approval process in chrome web store, and if you have permissions that you do not need and you're not using, you'll get denied.

Something I am realizing is that perhaps injecting buttons in the UI is in fact the best move here, but I am thinking about: user select emails > click on popup > popup loads toast + progress bar in content js.

I decided to inject a very subtle button in the toolsbar that gmail has.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-08h15.jpg)

To make sure the design is as close as possible to gmail's, I'll use a function that I have stored in my [AI Bookmark Manager](/apps/ai-bookmark) chrome extension to export all css of the website.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-08h16.jpg)

Now I have a massive css file with all the css from gmail, and I'll use it with ChatGPT to design my chrome extension once the prompt is ready.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-08h16_1.jpg)

Claude suggested me a 'history' tab which I didn't really think about but shouldn't be complex to add, so why not?

Writing the prompt with Claude and finally running it in cursor.

### First build reality check

The first thing I notice is how the design of the popup is not the best. Totally fine for now (settings a bit buggy, etc), we will design something from scratch later on with chatgpt. The initial focus is functionality.

UX wise, not the best either; it should show the emails selected etc. we will also fix this later on.

I proceed to write a few bugs to fix for the time being.

### Second build

Still a few bugs, yay! let's get rid of those.

---

## Chapter 6: The Gmail to PDF nightmare (and the fix that finally worked)

Now it's time to work on the 'pdf' export. Basically we will just download the html and convert it to pdf.

I confess I was not too sure how it worked: do I need to download the html in bg.js and then convert it using html2pdf? or do I just send the html string? it turns out it was the latter (after searching), so I give that instruction to cursor.

The pdf is being rendered completely wrong - lovely.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-08h55.jpg)

Let's debug and see what is going on. Let's do a simple 'hello world' and try to export the html file as pdf.

It's cutting off a few things.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-08h59.jpg)

I spent a few minutes debugging why some things were not working and ended up landing on a 'good enough' html to pdf export.

The thing is, if I include additional permissions, I can use the native pdf print which is excellent, but I really want to keep it with as little permissions as possible. So I'm gonna stick with the 'html2pdf' for now and aim for the best degree of excellency I can.

I have also found another bug: the emails are all being exported in one single html file. Let's fix that.

### Images conversion to base64 when exporting to PDF

First, let's add all sample JS files we used in the browser for cursor to use as reference.

And let's also quickly fix the bug of multiple exports being all in the same html file.

HTML exports work fine with external images, but pdf exports need images to be converted to base64.

The PDF export is working pretty great now!

Let's add an option in the settings to control the white space on the left/right of the pdf in pixels.

In the meantime, let's create the repo on github.

The white space on the left/right for the pdf is being ignored. the thing is, it should be applied to the html first and then to the pdf.

This seems like it's going to be more complex than what I foresaw, so I'm going to let this go for now and focus on other important things!

Small bug fix: when the user opens a new email, it was still showing the emails from the other page that were selected in the checkboxes.

I fixed another small bug, like adding the doubled title from the document.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-10h04.jpg)

Something that I'd like to see is in the progress bar show total words, how many attachments and images were found as well. for now, I'll focus on showing the attachments/images.

Images are now being saved successfully but the pdf is still empty.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-10h19.jpg)

And the attachments in the .zip are all corrupted. The files seem to be the correct size though, so I will need to check what is going on.. Also some of the attachments have no file type, which is something I will need to address. we will probably need to download html > send it to background.js > use querySelectorAll to find attachments. we are probably still using regex which is not a good approach.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-10h20.jpg)

I have now implemented the 'pdf export' to background.js so we can use query selector instead of regex. 

But I remembered DOMParser does not work in background.js. Cons of coding while tired...

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-22h44.jpg)

I also find that the progress bar is not descriptive enough, it does not offer much value to the user. I'm going to make a more descriptive progress bar.

The most complex part of this project has been by far exporting to pdf. Which is ironic since it's the main premise! It works with some emails but not with others. If we were to use the standard pdf of the browser to handle that, things would be better.

It's still getting stuck here:

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-22h50.jpg)

One of the main issues of using the cursor free is that I have limited access to the top ai models. Also, I don't think it's valid to spend too much money using AI, so I am relying on AUTO most of the times.

The pdf in the background.js processing is clearly not working. So I asked cursor to explain what it's trying to do and I'm gonna send all of that to claude to figure out whether it's appropriate. I asked it to generate a better prompt.

I am still a bit confused. I can use DOMparser in background.js, right? and, yeah apparently yes.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-22h57.jpg)

So let's try again.

Still getting stuck in the 'opening pdf layout', so I need to figure out what is going on. let's add some console logs.

The issue is that background.js was trying to access the content.js images which are authenticated.

It's working as it was before, but for some reason some PDF emails are still completely empty. I need to figure out why.

I figured out why! it's triggering an 'overflow-x' scroll for some emails, probably because of the attachments in it. Let's fix it.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-23h09.jpg)

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-23h09_1.jpg)

I sent the html with redacted info to Claude and then asked for a css to fix it. Looks good. Now let's add it to our project.

A new issue is that we are trying to download all attachments in the background.js, which is not authenticated and is triggering a cors issue.

We should find the list in background.js using queryselector, send to content js, and download there.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-23h24.jpg)

The first problem here is that the zip is not downloading, and now I see that the html in the background.js is not empty. That was my first suspicion.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-23h32.jpg)

We have 8mb of html that is rendering 10kb of pdf. What could be going on?

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-23h32_1.jpg)

And the attachments also are not being downloaded for some reason:

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-23h33.jpg)

Maybe it's CORS. we will need to investigate further. Basically the files are still trying to be downloaded in the background js, which is something that should not be happening.

This is another moment where not knowing how to code would either get you stuck or make you spend a lot of money with pricy ais: claude suggests to do all fetching in the content js, but that can't happen because we need background js to use queryselector in the html.

We would be going back and forth forever. so the solution is: fetch html in content js > send html to background js to find the attachments > send json with attachments to content js and download it IN content js, then everything .zip.

Since I already have an object, while cursor fixes the background js download, I will code something to download these from the browser.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-23h43.jpg)

As I expected, the attachments download and zip-ing works perfectly fine.

So it's just a matter of implementing it correctly in the chrome extension.

Downloading to zip is working almost perfectly, but it's downloading two separate zips.

Fixed! now it downloads everything one zip.

Now it's time to fix the pdf being empty. Claude said that html2pdf is probably running on an empty frame, and not waiting for it to load completely when emails are large. that is an excellent call. I'll aim to fix that now.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_12-06-2026-23h55.jpg)

Yup no luck so far.

### The unsolvable html to PDF bug (that wasn't)

The main issue here is regarding large emails: emails with over 8mb apparently are not properly converted to html.

After some debugging, I have a fix: do the pdf conversion in a html offset page. basically create a .html page that will be injected with the chrome extension, we inject the html page there, convert to pdf and we are all set. and we also compare the size of the html to the one being rendered in pdf.

One thing I noticed as well is that there are many permissions being added to the manifest json. we will need to review these after.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-01h14.jpg)

It finally works! now the pdf is being exported correctly, including all images.

Some part of the PDF are cut off, but this is not something I will worry about for the time being.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-01h17.jpg)

**Key lesson for anyone building a Gmail to PDF tool:** html2pdf can fail silently on large emails. An offscreen document (Chrome's `offscreen` permission) lets you render the full HTML in a real DOM before conversion - and that was the difference between a 10kb empty PDF and a proper export.

---

## Chapter 7: Injecting into Gmail without ruining the UX

Now, let's find a unique CSS selector to inject the download button in the UI.

First step is to monitor all the checkboxes - we can find their css selector with this:

```javascript
td[data-tooltip] > [aria-checked]
```

And ask claude to code a function to monitor whenever they are checked/unchecked.

Perfect: now we have a function that can detect check/uncheck of the checkboxes.

Now, whenever there is at least one checked, we must inject the button in this css selector of the toolbar.

I keep searching for a unique selector avoiding classes and ids, since gmail always randomize those. And when it shows '1 of 1', I know this is a good one.

```css
div[role="navigation"] + * div:not([class]) > div[id] > * > * > *:first-of-type > *:first-of-type
```

If there are 1 or more checked checkboxes, inject button, if not, hide.

I ask claude to generate the icon for me and then time to code it.

So, there is a bug of duplicating the arrows (I forgot to explain to use insertAdjacentHTML, which is the best for these cases), but something cool that I found: gmail already has a 'data-tooltip' data attribute that shows tooltips automatically, so we wouldn't need to worry about that.

Whenever you're creating solutions that are going to be implemented in websites like that, it's nice to explore the code and see if what you're trying to code already exists. it is going to save you time and performance, you won't need to inject more code in the website.

Much better! now it has a proper tooltip & dropdown. We just need to fix the position, let's improve the css selector.

Let's add some 'hover' animation to the download, just like the other elements. we could nitpick here and make the svg icon a bit thicker etc, but let's focus on functionality.

It took me a few minutes to debug the bubble animation and replicate it. basically it's being triggered by js, when it's hovered its detected by js and added a class. I added a debugger on the 'set timeout debugger' to be able to have some time to hover over the animation and then enable the debugger in time.

Long story short, I was able to recreate the bubble animation in a few minutes, and now we are going to implement it.

The 'content.js' download is working great now.

Looks nice. and it's honestly pretty much a 'markdown' considering there are links. I will add an option to include/exclude links.

Excellent, now TXT can be exported without links too.

---

## Chapter 8: JSON export, history, and tight permissions

Time to work on the JSON exporter. I followed the same process, generated a prompt with claude to figure out the best way to structure the JSON and sent it to cursor.

It's working ok, but the images are being converted to base64, which is something that should be optional. Let's work out on these settings.

The images have stopped being converted to base64, but now I can't switch it via the settings.

Now it works properly!

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-03h22.jpg)

Now I'm gonna add some pagination to the history.

Also gonna send all settings to claude and see if it suggests me adding anything more useful.

We also need to remove all non-critical permissions. I managed to keep it as tight as possible:

```json
"permissions": ["downloads", "storage", "offscreen"],
"host_permissions": ["https://mail.google.com/*"]
```

And the pdf export still works fine.

---

## Chapter 9: MVP over pretty (logo included)

We have pretty much everything working fine, now let's move on to the logo.

I thought about doing a proper design via chatgpt for the Popup, but the reality is that the user will spend very little time using the popup and looking at the UI, so a beautiful ui here is not really a necessity.

My rule of thumb is that if the user is going to spend more than 50% of the time interacting with the app looking at a UI, then we do need to put good effort in it.

We already spend a good amount of time improving the UX and integrating it nicely with the gmail ui, we didn't even need to use the gmail css, so let's focus on leaving it as it is for the mvp.

There are still some things I need to fix in the popup, some small bugs annoying me, but for now, it's good enough.

### ChatGPT vs my patience (logo edition)

I'm going to use a palette color inspired by gmail.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h21.jpg)

I write chatgpt a prompt giving it some instructions about how I want the logo to look like.

This icon is way too close to gmail's real icon, which I don't want. So I'm gonna give it some sources.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h24.jpg)

I am also not fond of the colors. I tried something different and this was the result:

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h29.jpg)

Still not fond of it at all and it looks too much like gmail's. So I just asked chatgpt to stick with the icons I sent and be creative about the colors. let your inner da vinci shine, gpt

Now this is better - we just may need to enlarge it a little.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h30.jpg)

Now that is ugly.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h32.jpg)

Gpt sometimes completely ignore requests, but that is ok. let's try one last time, if it doesn't work, we keep the small(er) logo.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h32_1.jpg)

Yeah... no luck! AGI here and it's stubborn. Let's use the logo we got either way.

Some basic editing in [Photopea](https://www.photopea.com/) and it's looking good enough to be used in the chrome extension.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h34.jpg)

Well.. the edges were looking saw-y so I ended up sending it to chatgpt one last time and it turned out nice.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h37_1.jpg)

Now I place it in my folder and I ask gpt to replace it throughout the chrome extension.

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-07h39.jpg)

Great! our extension is pretty much complete at this point.

---

## Chapter 10: Publishing to the Chrome Web Store

I tested it for a little longer, and everything seems to work fine.

I left the small popup bugs alone and will focus on polishing things once it goes live - I want to have an "ugly" functional live mvp asap.

Let's use our classic build-and-zip.bat function and zip this project to send it to the chrome web store.

One thing that I am still not very fond of is its name. So let's chat with claude to find a better name.

I ended up sticking with **'Gmail to PDF: Save Emails as PDF, HTML, TXT'**. I think it's good enough for seo and very descriptive. I like to make the extension's titles as descriptive as possible.

Also, I noticed Cursor crept extra permissions back into the manifest. That is why I always review manifest.json changes manually. I addressed that quickly though.

Finally, I send all the questions to cursor and ask it to answer in one single code block.

Upload complete!

---

## By the numbers

This extension took roughly:

- **120~ prompts** (90~ with Cursor, the rest distributed across Claude, GPT, etc.)
- **15~ hours** - two days of work

![](/blog-images/ep8-gmail-pdf/SCREENSHOT_13-06-2026-08h25.jpg)

It was a very fun project and I am glad I didn't extend it with useless things (like design, more settings, etc). It's important that it's functional, this is the main goal.

There are a few things that I would still need to fix (for example, when you open an individual email the download button in the UI content js is not displayed), however, I am still happy with it.

**One more brick to the Citadel. Let's keep moving!**

---

## FAQ: Gmail to PDF export

### What is the best way to save Gmail emails as PDF?

The most reliable approach for a self-built tool is: fetch email HTML from Gmail's internal API in **content.js** (where your session cookies live), inline images as base64, then convert HTML to PDF in an **offscreen document** so large emails render fully before html2pdf runs. Browser extensions that skip the offscreen step often produce empty or truncated PDFs on threads over ~8MB.

### Why do Gmail PDF Chrome extensions stop working?

Gmail changes its DOM, class names, and internal API payloads regularly. Extensions that scrape the UI with brittle selectors or outdated fetch patterns break without updates. Mixed reviews and stale release dates on the Chrome Web Store are usually a sign the maintainer has not kept up.

### Do you need to log in to export Gmail to PDF?

No - if the extension runs inside your already-authenticated Gmail tab, it inherits your session. A separate login to a third-party service is unnecessary for basic **save emails as PDF** functionality and is a privacy red flag for email data.

### What permissions should a Gmail export extension need?

For this project, the final minimal set was:

```json
"permissions": ["downloads", "storage", "offscreen"],
"host_permissions": ["https://mail.google.com/*"]
```

Extra permissions slow Chrome Web Store review and increase the risk of denial if they are not used.

### Can you export Gmail emails to formats other than PDF?

Yes. This extension supports **PDF, HTML, TXT, and JSON**. HTML preserves layout and links; TXT strips formatting (optionally without links); JSON is useful for archiving structured data with optional base64 images.

### Why is html2pdf so hard with Gmail emails?

Gmail emails often include authenticated image URLs, inline pasted images, large thread HTML, and layout that triggers `overflow-x` scroll. html2pdf runs on a snapshot of the DOM - if images are not base64-inlined, if the frame is empty, or if the renderer cuts off overflow content, you get blank or tiny PDFs. Fixing this requires a deliberate pipeline: content script fetch → background parse → content script download → offscreen render → convert.

---

## What's next?

If you are building something similar, start in the browser console before you open your editor. Explore the Network tab, find Gmail's POST endpoints, and prove you can export one email to HTML. Everything else (attachments, PDF, Chrome extension packaging) builds on that foundation.

Have you tried exporting Gmail to PDF lately? Did the extensions you used still work, or did you end up coding your own too? I'd be happy to hear what broke on your side.

Thanks for reading!

