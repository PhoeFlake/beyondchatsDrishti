import express from "express";
import axios from "axios";
import { pool } from "../db.js";

const router = express.Router();

router.get("/scrape", async (req, res) => {
  try {
    const { data } = await axios.get("https://beyondchats.com/blogs/");
    const $ = cheerio.load(data);
    const articles = [];
    $(".elementor-post").each((_, el) => {
      const title = $(el).find(".elementor-post__title a").text().trim();
      const url = $(el).find(".elementor-post__title a").attr("href");
      if (title && url) {
        articles.push({ title, url });
      }
    });
    for (const article of articles) {
      await pool.query(
        "INSERT INTO articles (title, url) VALUES (?, ?)",
        [article.title, article.url]
      );
    }
    res.json({ success: true, count: articles.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/oldest", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, url, published_at FROM articles ORDER BY published_at ASC LIMIT 5"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, url, published_at FROM articles ORDER BY published_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM articles WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Article not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
