# Photo map
An app to put photos on a nice online map, and put them into stories.

## Why?
I really like the way that apps such as Google Photos or Immich give you a map with all your photos on it, and have spent quite a lot of time scrolling through my own photos there, looking through them. But these maps aren't publicly accessible, or shareable. This is one of the reasons for this app - so i can put trip photos online, publically.
Another cool feature that I want to add in this website is the ability to create *stories*. I've been reading a lot of blog posts to do with walking holidays and trips that i could do, and it would be really amazing to have a map on the right side of my screen as I scroll these posts, reflowing and adapting to where I'm up to in the article. That's one of the main features of this app - once you've uploaded things to a project, you can make articles out of them, and as you scroll, the map will move.

## Other potential features that could possibly be added:
- Embedding into other websites. Give an embed code, which lets the owner of the map embed a story, or even just a basic map, into their own website. 
- Mobile. This rests heavily on the split screen to the left and right, which just doesn't work on mobile. I suppose a tabbed UI would work for the browser, but stories (in the way that I'm thinking of them) really need to be able to see both parts at once
- GPX traces. What if I could put a Strava activity on there as well? If i'm going to use this for a hiking holiday, it'd be great to have the activity that I use to track it visible


## Stack
For the website, I'm just using basic Sveltekit. It's a beautiful framework, nice to write, deploys well on Vercel/CF as well as my own infra potentially down the line
Database - Neon Postgres, with Drizzle as the client. I like postgres, and can switch of neon anytime if i want to, but it is very convenient.
Storage - Backblaze B2. S3 compatible, with a free tier that gives me 10gb of storage without me having to put in a credit card. I've got a fear of having to put in my credit card for a free tier, which is what stopped me from using Cloudflare R2. The one drawback is that they have no Australia/Asia Pacific region, so my files are in Germany. Not that fast.
Map - Mapbox. It's a beautiful, easy to use, map. They do need a credit card for the free tier, though. 