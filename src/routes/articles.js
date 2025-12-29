import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { pool } from "../db.js";

const router = express.Router();
router.get("/scrape", async (req, res) => {
  try {
    const { data } = await axios.get("https://beyondchats.com/blog/");
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

export default router;
