const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const a = express();
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
a.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    a.listen(3000, () => {
      console.log("Server Is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base Error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//1st
const player = (a) => {
  return {
    playerId: a.player_id,
    playerName: a.player_name,
  };
};
a.get("/players/", async (request, response) => {
  const p = `select * from player_details;`;
  const q = await db.all(p);
  response.send(q.map((e) => player(e)));
});

//2nd
a.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const p = `select * from player_details where player_id=${playerId}`;
  const q = await db.get(p);
  response.send(player(q));
});

//3rd
a.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const p = `update player_details set player_name='${playerName}' where player_id=${playerId};`;
  const q = await db.run(p);
  response.send("Player Details Updated");
});

//4th
const match = (a) => {
  return {
    matchId: a.match_id,
    match: a.match,
    year: a.year,
  };
};
a.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const p = `select * from match_details where match_id=${matchId}`;
  const q = await db.get(p);
  response.send(match(q));
});

//5th
a.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const p = `select m.match_id,m.match,m.year from match_details m inner join player_match_score p on m.match_id=p.match_id where player_id=${playerId}`;
  const q = await db.all(p);
  response.send(q.map((e) => match(e)));
});

//6th
a.get("/macthes/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const p = `select * from player_details  natural join player_match_score where match_id=${matchId}`;
  const q = await db.all(p);
  response.send(q.map((e) => player(e)));
});

//7th
const score = (a) => {
  return {
    playerId: a.player_id,
    playerName: a.player_name,
    totalScore: a.score,
    totalFours: a.fours,
    totalSixes: a.sixes,
  };
};
a.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const p = `SELECT
    player_details.player_id AS player_id,
    player_details.player_name AS player_name,
    SUM(player_match_score.score) AS score,
    SUM(fours) AS fours,
    SUM(sixes) AS sixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const q = await db.all(p);
  response.send(q.map((e) => score(e)));
});
module.exports = a;
