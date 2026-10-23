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

A full chess app that lives on this same server at **`/chess/`** (for example `https://rooftop-rumble-server.onrender.com/chess/`).
It's a web app you can install on a phone: open the link, then **Me → Install app** (Android/Chrome), or in Safari **Share → Add to Home Screen** (iPhone).
Once installed it opens full screen, and everything except online play works offline.

What's in it:
- **Play online** – bullet, blitz and rapid (1|0 up to 30|0) with matchmaking, server-side clocks, Glicko ratings, draw offers, rematches, quick chat (preset messages only), premoves and a leaderboard.
- **Play a friend** – make a 6-letter code or share a link; casual or rated.
- **Play a bot** – 11 characters from 250 to 2300. Takebacks and hints, plus a "beaten" badge for wins without help.
- **Pass & play** – two people on one device, with an optional clock.
- **Puzzles** – rated puzzles with your own puzzle rating, **Puzzle Rush** (3 minutes, 3 strikes), a daily puzzle, and themes (mate in 1/2/3+, forks, sacrifices, back-rank mates, endgames…).
- **Game Review** – the engine checks every move: best / brilliant / great / excellent / good / book / inaccuracy / mistake / miss / blunder, with accuracy, an eval graph and an explanation for each move.
- **Analysis board** – engine with the top 3 lines and an eval bar; load or copy PGN and FEN.
- **Learn** – interactive "how the pieces move" lessons, checkmate drills against the engine, and the rules explained.
- **Watch** – spectate live online games, or set two bots against each other.

Files:
- `chess/` – the app (plain HTML/CSS/JS, no build step). `chess/js/chess.js` holds the rules and `chess/js/engine.js` the engine.
  The engine runs in a background thread (`engine-worker.js`) so the screen never freezes.
- `chess-server.js` – online play. Every move is checked with the same `chess.js` the app uses, and clocks are kept on the server.
- `tools/make-puzzles.js` – makes the puzzles. Bots play each other, and when one blunders the engine checks that only one move wins, then saves it.
  Run `node tools/make-puzzles.js <seed> <games> out.json` (several at once is faster), then `node tools/make-puzzles.js merge chess/js/puzzles.js out*.json`.
- `test/` – `npm test` runs the rules tests (perft move counts, SAN/PGN, draws, every opening line and every puzzle), the engine tests, and an online test that starts the server and plays games between two clients.

Ratings and names: players are known by a secret token saved on their device (only its hash is stored on the server).
Online ratings are saved in Postgres when `DATABASE_URL` is set (the same database as Rumble ID), otherwise in `chess-data.json`, which is wiped whenever Render redeploys.
Names go through the same word filter as party chat.

Updates reach installed apps by themselves: the app always loads the newest files when it's online and only uses its saved copy when offline.
