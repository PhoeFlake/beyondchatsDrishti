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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0"
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    $("script, style, nav, header, footer, aside, .advertisement, .ad, .ads, .cookie-banner, .newsletter").remove();
    const selectors = [
      "article",
      '[role="main"]',
      ".post-content",
      ".entry-content",
      ".article-content",
      ".blog-content",
      ".post-body",
      ".story-body",
      'main article',
      'main',
      ".content",
      "#content"
    ];
    let content = "";
    for (const sel of selectors) {
      if ($(sel).length) {
        content = $(sel)
          .find("p, h1, h2, h3, h4, h5, h6")
          .map((_, el) => {
            const tag = el.name;
            const text = $(el).text().trim();
            if (tag.startsWith('h') && text) {
              const level = '#'.repeat(parseInt(tag[1]));
              return `${level} ${text}`;
            }
            return text;
          })
          .get()
          .filter(text => text.length > 20)
          .join("\n\n");
        if (content.length > 200) {
          break;
        }
      }
    }
    if (!content || content.length < 200) {
      content = $("p")
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20)
        .join("\n\n");
    }
    content = content
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\t/g, " ")
      .trim();
    if (content.length > 100) {
      console.log(`Scraped ${content.length} characters`);
      return content.substring(0, 5000);
    } else {
      console.log(`Content too short (${content.length} chars)`);
      return "";
    }
  } catch (err) {
    if (err.response?.status === 403) {
      console.error(`Access denied (403): ${url}`);
      console.log("Site is blocking scrapers - trying alternative...");
    } else if (err.code === 'ECONNABORTED') {
      console.error(`Timeout: ${url}`);
    } else {
      console.error(`Scrape failed: ${url} - ${err.message}`);
    }
    return "";
}}