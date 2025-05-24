import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://michaeluy001.github.io"  // <-- your deployed frontend URL here
];

app.options("/", cors());
app.options("/submit", cors());

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true); // allow requests without an origin (like from Postman)
      if (allowedOrigins.includes(origin)) {
        callback(null, true); // if the origin is in the allowed list, allow it
      } else {
        callback(new Error("Not allowed by CORS")); // otherwise, block it
      }
    },
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
    console.log('Error on GET', err.message);
    res.status(500).json({ error: err.message });
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
   res.status(400).json({ message: "Error on post" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
