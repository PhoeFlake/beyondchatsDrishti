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
      console.log(`Fetching page ${page}...`);
      const response = await axios.get(
        `https://beyondchats.com/wp-json/wp/v2/posts?per_page=100&page=${page}`
      );
      
      totalPages = parseInt(response.headers["x-wp-totalpages"]);
      const articles = response.data.map(p => ({
        title: p.title.rendered,
        url: p.link,
        content: p.content.rendered,
        published_at: p.date
      }));
      for (const article of articles) {
        await pool.query(
          `INSERT INTO articles (title, url, original_content, published_at)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          original_content = VALUES(original_content),
          published_at = VALUES(published_at)`,
          [article.title, article.url, article.content, article.published_at]
        );
      }
      totalInserted += articles.length;
      console.log(`Page ${page} done. Inserted ${articles.length} articles.`);
      page++;
    } while (page <= totalPages);
    console.log(`✓ Scraping complete! Total: ${totalInserted} articles`);
    res.json({ 
      success: true, 
      totalInserted,
      message: `Successfully scraped ${totalInserted} articles with full content`
    });
  } catch (err) {
    console.error('Scraping error:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/oldest", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM articles WHERE title IS NOT NULL AND url IS NOT NULL AND published_at IS NOT NULL ORDER BY published_at ASC LIMIT 5"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM articles ORDER BY published_at DESC"
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
router.post("/", async (req, res) => {
  try {
    const { title, url, content, published_at } = req.body;

    if (!title || !url || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [result] = await pool.query(
      `INSERT INTO articles (title, url, rewritten_content, published_at)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       rewritten_content = VALUES(rewritten_content),
       published_at = VALUES(published_at)`,
      [title, url, content, published_at || new Date()]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/by-url", async (req, res) => {
  try {
    const { url, title, content, published_at } = req.body;
    await pool.query(
      `UPDATE articles
       SET title=?, rewritten_content=?, published_at=?
       WHERE url=?`,
      [title, content, published_at, url]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { title, content, url, published_at } = req.body;
    await pool.query(
      `UPDATE articles 
       SET title=?, rewritten_content=?, url=?, published_at=? 
       WHERE id=?`,
      [title, content, url, published_at, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM articles WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;