import axios from "axios";
import { searchGoogle } from "./google.js";
import { scrapeArticle } from "./scrape.js";
import { rewriteArticle } from "./rewrite.js";
import { publishArticle } from "./publish.js";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const { data: oldest } = await axios.get(
    "http://localhost:5000/articles/oldest"
  );
  const original = oldest[0];
  console.log("Processing:", original.title);
  const links = await searchGoogle(original.title);
  const scrapedContent = [];
  for (const link of links) {
    const content = await scrapeArticle(link);
    if (content && content.length > 100) {
      scrapedContent.push(content);
      if (scrapedContent.length >= 2) break;
    }
  }
  console.log(`\nSuccessfully scraped ${scrapedContent.length} reference articles\n`);
  const rewritten = await rewriteArticle(original, scrapedContent);
  console.log("Sending to publish:", {
    title: rewritten.title,
    url: rewritten.url,
    contentLength: rewritten.content.length
  });
  await publishArticle(rewritten);
  console.log("\nDone!");
}
main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});