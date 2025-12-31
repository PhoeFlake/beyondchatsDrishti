import axios from "axios";
import { searchGoogle } from "./google.js";
import { scrapeArticle } from "./scrape.js";
import { rewriteArticle } from "./rewrite.js";
import { publishArticle } from "./publish.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function processArticle(original) {
  console.log("\n" + "=".repeat(60));
  console.log(`Processing: ${original.title}`);
  console.log("=".repeat(60));
  const links = await searchGoogle(original.title);
  const scrapedContent = [];
  for (const link of links) {
    const content = await scrapeArticle(link);
    if (content && content.length > 100) {
      scrapedContent.push(content);
      if (scrapedContent.length >= 2) break;
    }
  }

  console.log(`Successfully scraped ${scrapedContent.length} reference articles`);
  const rewritten = await rewriteArticle(original, scrapedContent);

  console.log("Sending to publish:", {
    title: rewritten.title,
    url: rewritten.url,
    contentLength: rewritten.content.length
  });
  await publishArticle(rewritten);

  console.log("Article processed successfully!");
  await new Promise(resolve => setTimeout(resolve, 3000));
}

async function main() {
  console.log("\nStarting Phase 2\n");
  const { data: oldest } = await axios.get(
    "http://localhost:5000/articles/oldest"
  );
  console.log(`Found ${oldest.length} articles to process\n`);
  for (let i = 0; i < oldest.length; i++) {
    const article = oldest[i];
    
    console.log(`\n[${i + 1}/${oldest.length}] Starting article enhancement...`);
    try {
      await processArticle(article);
    } catch (error) {
      console.error(`Failed to process article: ${article.title}`);
      console.error(`Error: ${error.message}`);
      console.log("Skipping to next article...");
    }
  }
  console.log("\n" + "=".repeat(60));
  console.log("All articles processed!");
  console.log("=".repeat(60));
}
main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});


