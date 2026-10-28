# Rooftop Rumble game server

Runs the online matches, player search, invites and parties for Rooftop Rumble.

- `index.js` – the server
- `game.js` – the game itself (every match runs on the server with this file)
- `package.json` – tells the host what to install

## Put it online with Render (free)
1. Sign in at render.com with GitHub.
2. New → Web Service → pick this repository.
3. Build command: `npm install` · Start command: `npm start` · Instance type: Free → Create.
4. Copy the link Render gives you (like `https://rooftop-rumble-server.onrender.com`)
   and paste it in the game: Settings → Online server.

`game.js` must match the game version on the phones. It's updated here whenever the game is updated.

## Rise (motivational quotes app)
`rise/index.html` is a separate phone app: pick how you feel and get a quote for it.
Motivation and Exercise are marked "coming soon" for now.
Open it at your server link + `/rise` (like `https://rooftop-rumble-server.onrender.com/rise`),
or open the file straight in a browser. On a phone, use "Add to Home Screen" to keep it like an app.
