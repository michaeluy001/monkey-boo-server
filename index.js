import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST", "GET"],
  })
);

app.use(express.json());

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

let leaderboard = [];

app.get("/", async (req, res) => {
  try {
    const query = await db.query(
      "SELECT * FROM player ORDER BY playerscore DESC"
    );
    const result = query.rows;

    res.json(result);
  } catch (err) {
    res.send(404).json("Error.", err);
  }
});

app.post("/submit", async (req, res) => {
  const entry = req.body;
  const name = entry.playerName;
  const score = entry.score;
  try {
    await db.query(
      "INSERT INTO player (playername, playerscore) VALUES ($1, $2)",
      [name, score]
    );
    res.status(200).json({ message: "Success" });
  } catch (err) {
   res.status(400).json({ message: "Error" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
