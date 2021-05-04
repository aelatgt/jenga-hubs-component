# Jena Component

The Jenga component contains a button that creates an interactive Jenga tower. Pushing the button will create and reset the Jenga blocks to their initial position.

You can demo the project here: [http://aelatgt.link/JKHJVgF](http://aelatgt.link/JKHJVgF).

(Put a picture here)

## How to use this repo

1. Create a new project on [Glitch](https://glitch.com/). You may need to enable cross-origin resource sharing, so Hubs can access the scripts on Glitch.
2. Import this repo into the Glitch project. Do this by going to Tools > Import and Export > Import from GitHub and entering `aelatgt/jenga-hubs-component`
3. Add the following custom script URL to hubs: [https://incandescent-psychedelic-spark.glitch.me/rooms/8-interaction-jenga.js](https://incandescent-psychedelic-spark.glitch.me/rooms/8-interaction-jenga.js). But replace `incadescent-psychedelic-spark` with the name of your Glitch project.
4. Refresh the page. You should see a spherical button that appears. Give it a click!

## Important Files

Instead of trying to clone this repository, you can add the project files to a Glitch project that already exists.

The two most important files are the following:
- `public/rooms/8-interaction-jenga.js` is the file that should be added to Hubs as a custom script.
- `public/components/jenga.js` contains the meat of the Jenga tower creation code.

You can ignore the `public/rooms/6-interaction-click.js` script.

## Future work

## Resources



## Your Project

On the front-end,

- Edit `views/index.html` to change the content of the webpage
- `public/client.js` is the javacript that runs when you load the webpage
- `public/style.css` is the styles for `views/index.html`
- Drag in `assets`, like images or music, to add them to your project

On the back-end,

- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)

Click `Show` in the header to see your app live. Updates to your code will instantly deploy.


## Made by [Glitch](https://glitch.com/)

**Glitch** is the friendly community where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).

( ᵔ ᴥ ᵔ )
