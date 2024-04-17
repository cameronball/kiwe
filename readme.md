# Kiwe - Bird App Style Social Media Site

![Kiwe Logo](link_to_logo_image.png)

### <a href="https://kiwe.social">kiwe.social</a>

Welcome to Kiwe, a social media platform where you can chirp, like, rechirp, and connect with others in a fun and engaging way. This `readme.md` provides an overview of the features and updates in version 3, an installation guide, as well as a sneak peek at what's planned for version 4.

## Table of contents:
- <a href="https://github.com/cameronball/kiwe#installation">Installation</a>
- <a href="https://github.com/cameronball/kiwe#updates-in-v3">Updates in v3</a>
  - <a href="https://github.com/cameronball/kiwe#main-features">Main features</a>
  - <a href="https://github.com/cameronball/kiwe#smaller-fixes-improvements">Smaller fixes and improvements</a>
- <a href="https://github.com/cameronball/kiwe#roadmap">Roadmap</a>
  - <a href="https://github.com/cameronball/kiwe?tab=readme-ov-file#features-definitely-planned-for-v4">Features confirmed for v4</a>
  - <a href="https://github.com/cameronball/kiwe?tab=readme-ov-file#features-which-are-planned-but-which-may-or-may-not-be-in-v4-depending-on-the-size-and-timeline-for-v4-release">Planned features which may or may not be included in v4</a>
- <a href="https://github.com/cameronball/kiwe?tab=readme-ov-file#key-features">Key features of the site</a>

<hr>

## Installation
### Prerequisites:
- A domain to host on with an SSL certificate; the code relies on SSL to allow notifications and real-time chat on iOS.
- A machine that can run NodeJS; I am using a cloud VM with 1 vCPU and 2GB ram and it is more enough for my testing and development purposes.
- I will use ubuntu for commands but most will also work on other platforms, if not then find the equivalent for your OS/ distro.

### Install requirements:
```npm install```

### Install your certificate:
You will need 4 files, ```domain.cert.pem```, ```intermediate.cert.pem```, ```public.key.pem``` and ```private.key.pem```. Place these at the root of the project. If you are hosting this as a fork on GitHub or anywhere else where project files will be publically accessible, don't upload the private key file to the version control and instead upload it directly to your server to prevent leaking your private key. The private key is already added to the .gitignore so don't worry about it accidentally syncing from your server.

### Setup your MongoDB instance:
Setup a MongoDB instance, you can host it yourself or use their cloud hosting. Once you have that ready, copy your connection string. It should look something like this: ```mongodb+srv://username:password@clustername.abcd123.mongodb.net/?retryWrites=true&w=majority```. On your server, copy the ```.env.example``` file and rename it to ```.env``` and then paste your connection string in.

### Setup auto-pull
If you wish, you can create a github webhook that will instruct the server to automatically pull any committed changes and restart the server. Edit ```deployment.sh``` and change the line ```REPO_URL="https://github.com/cameronball/kiwe.git"``` to whatever the url to your repo is, remebering to add the .git at the end.

### Start the server
If you don't already have pm2 then install it for your system.

Once it is installed:

If you want auto-pull run:

```pm2 start webhookListener.js```

Then run:

```pm2 start app.js```

The server should now be running, you can check using

```pm2 status```

# Updates in v3:
## Main Features:
- Admin panel finished - user verification, ban user, add debug likes, get site stats
- Allow app to be installed as a PWA.
- Added hashtags, hashtags get automatically highlighted, and link to a page where you can browse all posts containing the hashtag.
- Trending sidebar
- Popular homepage tab (Will likely improve algorithm for this tab in v4 when it may switch to being a "For you" tab)
- Image chirps
- Image messages
- Code chirps (Still need to implement reposting code chirps)
- Added two factor authentication
- Inline advert chirps
- Redirect http traffic to https by creating a http redirect server (fixes a safari issue where sometimes a user putting in the page url will get put onto an error page due to no page being served on port 80)
- Highlight the icon of the page that you are currently on in the side panel.
- Add site favicon
- Add legal page links to signup page, allow access to them when not signed in.
- Add alt text to lots more buttons to improve accessibility.

## Smaller fixes, improvements
- Increased modal size for quite a few modals where content previously felt squished (Such as legal modals)
- Fix the border radius on the post interaction buttons, previously the code used %, now we define a px value so that the rounding isn't weird.
- Fix issues with CSS caching by adding a ?v=**_X_** to the end.
- Allow more characters in user bios - previously only a-Z were allowed.
- Change default icons to FA regular rather than solid and change some icons to fontawesome duotone ones which look nicer in some places.
- When the user is on the page for an individual post, clicking on the post won't refresh the page, this allows the user to highlight and copy text.

# Roadmap:
## Features definitely planned for v4:
- Implement code chirp reposts
- Improve popular/for you page algorithm
- Add websockets code so that when an image message is sent it is displayed immediately rather than having to refresh for it to be displayed.
- Bookmarks
- Polls
- Muting and blocking
- Mentions

## Features which are planned but which may or may not be in v4 depending on the size and timeline for v4 release
- Dark mode / themes in general (Considering just implementing dark mode in v4 and then adding more themes later on)
- Video, Audio calls
- Audio spaces
- Communities
- Chirp analytics - impression count, more maybe?
- Emoji picker
- More advanced search tools - date, media contained, like count etc
- Community Notes
- Advert creation & buying center
- Private accounts
- Circles/ close friends
- Reshares with comment (quote repost)
- Website embeds
- Read receipts

# Key Features of the site
Kiwe offers a wide range of features, including:
- Chirping (Tweeting)
- Liking chirps
- Rechirping
- Replies
- Pinning chirps
- Profile photos
- Profile banners
- Following and followers
- Home page showcasing followers
- Deleting posts
- Moderators can delete posts
- Messaging with typing indicators
- Real-time message sending and receiving
- Direct Messaging (DM) and group chat creation
- Search for posts and users
- User bios
- Notifications page for various interactions
- Admin panel finished - user verification, ban user, add debug likes, get site stats
- Allow app to be installed as a PWA.
- Added hashtags, hashtags get automatically highlighted, and link to a page where you can browse all posts containing the hashtag.
- Trending sidebar
- Popular homepage tab (Will likely improve algorithm for this tab in v4 when it may switch to being a "For you" tab)
- Image chirps & messages
- Code chirps (Still need to implement reposting code chirps)
- Added two factor authentication
- Inline advert chirps
- Redirect http traffic to https by creating a http redirect server (fixes a safari issue where sometimes a user putting in the page url will get put onto an error page due to no page being served on port 80)
- Highlight the icon of the page that you are currently on in the side panel.
- Add site favicon
- Add legal page links to signup page, allow access to them when not signed in.
- Add alt text to lots more buttons to improve accessibility.

We hope you enjoy using Kiwe! If you have any feedback or suggestions, please feel free to share them with us. Stay connected and chirp away!

![Kiwe Screenshot](link_to_screenshot_image.png)
