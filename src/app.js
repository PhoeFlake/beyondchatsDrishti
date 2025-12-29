import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running 😎");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
