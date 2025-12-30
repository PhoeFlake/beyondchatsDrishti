import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeArticle(url) {
  if (!url) {
    console.error("No URL provided");
    return "";
  }
  try {
    console.log(`Scraping: ${url}`);
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    $("script, style, nav, header, footer, aside").remove();
    const selectors = [
      "article",
      "main",
      ".content",
      ".post-content",
      ".entry-content"
    ];
    let content = "";
    for (const sel of selectors) {
      if ($(sel).length) {
        content = $(sel)
          .find("p, h1, h2, h3, h4")
          .map((i, el) => {
            const tag = el.name;
            const text = $(el).text().trim();
            if (tag.startsWith("h") && text) {
              const level = "#".repeat(parseInt(tag[1]));
              return `${level} ${text}`;
            }
            return text;
          })
          .get()
          .filter(text => text.length > 20)
          .join("\n\n");
        if (content.length > 200) break;
      }
    }
    if (!content) {
      content = $("p")
        .map((i, el) => $(el).text().trim())
        .get()
        .join("\n\n");
    }
    content = content.trim();
    console.log(`Scraped ${content.length} characters`);
    return content.substring(0, 5000);
  } catch (err) {
    console.error(`Scrape failed: ${url}`, err.message);
    return "";
  }
}
