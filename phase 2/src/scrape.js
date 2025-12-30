import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeArticle(url) {
  if (!url) {
    console.error("No URL provided");
    return "";
  }
  try {
    console.log(`Fetching: ${url}`);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $("script, style, nav, footer, header").remove();
    let content = $("p")
      .map((i, el) => $(el).text().trim())
      .get()
      .filter(text => text.length > 20)
      .join("\n\n");
    content = content
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    console.log(`Scraped ${content.length} characters`);
    return content;
  } catch (err) {
    console.error(`Error scraping ${url}:`, err.message);
    return "";
  }
}
