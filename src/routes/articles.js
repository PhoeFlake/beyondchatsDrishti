import express from "express";
import axios from "axios";
import { pool } from "../db.js";

const router = express.Router();

router.get("/scrape", async (req, res) => {
  try {
    let page = 1;
    let totalPages = 1;
    let totalInserted = 0;
    do {
      const response = await axios.get(
        `https://beyondchats.com/wp-json/wp/v2/posts?per_page=100&page=${page}`
      );
      totalPages = parseInt(response.headers["x-wp-totalpages"]);
      const articles = response.data.map(p => ({
        title: p.title.rendered,
        url: p.link,
        content: p.excerpt.rendered,
        published_at: p.date
      }));
      for (const article of articles) {
        await pool.query(
          `INSERT INTO articles (title, url, content, published_at)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           published_at = VALUES(published_at)`,
          [article.title, article.url, article.content, article.published_at]
        );
      }
      totalInserted += articles.length;
      page++;
    } while (page <= totalPages);
    res.json({ success: true, totalInserted });
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
