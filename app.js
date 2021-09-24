const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// GET Players
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT player_id as playerId, player_name as playerName,
    jersey_number as jerseyNumber, role
    FROM cricket_team;
    `;
  const getPlayersList = await db.all(getPlayersQuery);
  response.send(getPlayersList);
});

// CREATE New Player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
        INSERT INTO cricket_team (player_name, jersey_number, role)
        VALUES (
            
            "${playerName}",
             ${jerseyNumber},
            "${role}"
        )
    `;
  const dbResponse = await db.run(createPlayerQuery);
  response.send("Player Added to Team");
});

// GET player
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayerQuery = `
    SELECT
        player_id as playerId, player_name as playerName,
        jersey_number as jerseyNumber, role
     FROM
         cricket_team
      WHERE
         player_id = ${playerId}
    `;
  const getPlayer = await db.get(getPlayerQuery);
  response.send(getPlayer);
});

// UPDATE Player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerDetails = `
    UPDATE cricket_team
    SET
    player_name = "${playerName}",
    jersey_number = ${jerseyNumber},
    role = "${role}"
    WHERE player_id =${playerId};
    `;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//DELETE Player
app.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
