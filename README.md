# Photo map

An app to put photos on a nice online map, and put them into stories.

## Why?

I really like the way that apps such as Google Photos or Immich give you a map with all your photos on it, and have spent quite a lot of time scrolling through my own photos there, looking through them. But these maps aren't publicly accessible, or shareable. This is one of the reasons for this app - so i can put trip photos online, publically.
Another cool feature that I want to add in this website is the ability to create _stories_. I've been reading a lot of blog posts to do with walking holidays and trips that i could do, and it would be really amazing to have a map on the right side of my screen as I scroll these posts, reflowing and adapting to where I'm up to in the article. That's one of the main features of this app - once you've uploaded things to a project, you can make articles out of them, and as you scroll, the map will move.

## Other potential features that could possibly be added:

- Mobile improvements for the main app view. Embedded stories already stack the map below the article on narrow screens.
- GPX traces. What if I could put a Strava activity on there as well? If i'm going to use this for a hiking holiday, it'd be great to have the activity that I use to track it visible

## Stack

For the website, I'm just using basic Sveltekit. It's a beautiful framework, nice to write, deploys well on Vercel/CF as well as my own infra potentially down the line
Database - Neon Postgres, with Drizzle as the client. I like postgres, and can switch of neon anytime if i want to, but it is very convenient.
Storage - Cloudflare R2 public bucket, using presigned urls for upload.
Map - Mapbox. It's a beautiful, easy to use, map. They do need a credit card for the free tier, though.

## Running

To run this project, set all the env urls in .env.example, run pnpm db:push to set up the database, run pnpm install and then pnpm dev. Remember to allow CORS requests for the presigned urls on your s3 provider.
This also works fine on Vercel, just with default sveltekit settings.

## Embedding a story

Use a story URL with `?embed=1` as the iframe source. The embedded view hides the PhotoMap project header and navigation, keeps the article and interactive map, and stacks the map below the article on narrow screens. Give the iframe a height so its article can scroll:

```html
<iframe
	title="Trip story"
	src="https://your-photomap.example/project/PROJECT_ID/STORY_SLUG?embed=1"
	style="width:100%;height:750px;border:0"
	loading="lazy"
	allowfullscreen
></iframe>
```

Optional query parameters apply only when `embed=1` is present:

| Parameter        | Purpose                                       | Default   |
| ---------------- | --------------------------------------------- | --------- |
| `background`     | Article and frame background, hex color       | `#ffffff` |
| `foreground`     | Article text, hex color                       | `#22212a` |
| `accent`         | Links and map markers, hex color              | `#177f62` |
| `muted`          | Photo captions and secondary text, hex color  | `#666672` |
| `border`         | Map divider and article rules, hex color      | `#e5e5e8` |
| `font`           | Google Fonts family for article text          | Inter     |
| `headingFont`    | Google Fonts family for headings              | Body font |
| `fontUrl`        | Direct HTTP(S) font file URL for article text | None      |
| `headingFontUrl` | Direct HTTP(S) font file URL for headings     | None      |

Colors accept `#RGB` or `#RRGGBB`. URL encode parameter values, including `#` as `%23`. A font file URL takes precedence over the corresponding Google Fonts family. The font server must allow cross-origin loading. Invalid or omitted values use the defaults. For example:

```html
<iframe
	title="Trip story"
	src="https://your-photomap.example/project/PROJECT_ID/STORY_SLUG?embed=1&amp;background=%23f8f3e9&amp;foreground=%232b241f&amp;accent=%23865737&amp;font=Roboto&amp;headingFont=Playfair+Display"
	style="width:100%;height:750px;border:0"
></iframe>
```
