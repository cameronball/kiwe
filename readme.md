# Kiwe - Bird App Style Social Media Site

![Kiwe Logo](link_to_logo_image.png)

### <a href="https://kiwe.social">kiwe.social</a>

Welcome to Kiwe, a social media platform where you can chirp, like, rechirp, and connect with others in a fun and engaging way. This `readme.md` provides an overview of the features and updates in version 2, as well as a sneak peek at what's planned for version 3.

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

## Updates in v2
- **Notifications Page:** Keep track of likes, follows, retweets, and other activities with a dedicated notifications page.

- **Receive Message Notifications:** Receive notifications when you get a message while you are on the site but not on that specific message thread.

- **Settings Page:** Customize your profile with ease. You can change your username, email, password, manage legal settings, delete your account, update your bio, photo, and cover photo.

- **Moderator/Admin Page:** Manage user interactions and the platform's health through a user-friendly graphical interface. You can delete users, verify users, and perform other administrative actions.

- **Auto-Follow Feature:** Users will now automatically follow the Kiwe and Kiwe creators' accounts upon signup.

- **Enhanced Notifications:** Notifications now embed the relevant post for actions like rechirping, liking, or replying. If the notification is related to a message, it will display the message details.

- **SSL Integration:** We've added SSL support to ensure that real-time Socket.IO features work seamlessly on Safari.

## v3 Features already implemented
### These are features currently in the main branch that will be officially production ready in the upcoming v3 update
- Ban users, admin ban panel
- Redirect http traffic to https by creating a http redirect server (fixes a safari issue where sometimes a user putting in the page url will get put onto an error page due to no page being served on port 80)
- Update to FontAwesome regular icons rather than solid so it is cleaner and to facilitate the feature below.
- Highlight the icon of the page that you are currently on in the side panel.
- Add site favicon
- Add button alt text for accessibility
- Add stats in admin panel
- Advert Chips
- Image Chirps
- Implementation of sending images in DM's is about 50% done.

## Key Features
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
- Database access for user verification, brand and government verification, and moderator assignment
- Moderators can delete posts
- Messaging with typing indicators
- Real-time message sending and receiving
- Direct Messaging (DM) and group chat creation
- Search for posts and users
- User bios
- Notifications page for various interactions

## Planned for Version 3 (Coming Soon TM)
- **Admin Panel Completion:** Finish off the admin panel, including features like banning users for better moderation.

- **Trending Page:** Explore trending topics and posts on Kiwe.

- **Image Chirps:** Share images alongside your chirps for a richer multimedia experience.

- **Advert Chirps:** Promote products and services with advert chirps.

- **And More:** We have exciting plans for version 3, depending on ongoing developments.

We hope you enjoy using Kiwe! If you have any feedback or suggestions, please feel free to share them with us. Stay connected and chirp away!

![Kiwe Screenshot](link_to_screenshot_image.png)
