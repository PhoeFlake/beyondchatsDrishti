import axios from "axios";
import * as cheerio from "cheerio";

export async function searchGoogle(query) {
  try {
    console.log(`Searching DuckDuckGo for: "${query}"`);
    const response = await axios.get("https://html.duckduckgo.com/html/", {
      params: {
        q: query
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const $ = cheerio.load(response.data);
    const results = [];
    $(".result").each((i, elem) => {
      const link = $(elem).find(".result__url").attr("href");
      if (link) {
        const actualUrl = link.startsWith("//duckduckgo.com/l/?") 
          ? decodeURIComponent(link.split("uddg=")[1]?.split("&")[0] || "")
          : link;
        if (actualUrl && actualUrl.startsWith("http")) {
          results.push(actualUrl);
        }
      }
    });
    const filtered = results
      .filter(link =>
        link &&
        !link.includes("youtube.com") &&
        !link.includes("facebook.com") &&
        !link.includes("twitter.com") &&
        !link.includes("instagram.com") &&
        !link.includes("medium.com") &&
        !link.includes("amazon") &&
        !link.includes("pinterest") &&
        !link.includes("reddit.com") &&
        !link.includes("login") &&
        !link.endsWith(".pdf")
      )
      .slice(0, 3);
    console.log(`Found ${filtered.length} article links`);
    filtered.forEach((link, i) => {
      console.log(`   ${i + 1}. ${link}`);
    });
    return filtered;
  } catch (err) {
    console.error("Search Failed:", err.message);
    return [];
  }
}