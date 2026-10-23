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

# Rooftop Chess

A full chess app lives in the **`chess/`** folder. It's a complete project on its own (app, online server, tests, tools) – see [`chess/README.md`](chess/README.md).
This server also hosts it at **`/chess/`** (for example `https://rooftop-rumble-server.onrender.com/chess/`), with online games on `/chess/ws`.

To give it its own repository: create an empty repo on GitHub, then from here run
`git subtree split --prefix=chess -b chess-only && git push <new-repo-url> chess-only:main`.
