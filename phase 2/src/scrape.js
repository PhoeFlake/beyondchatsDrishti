import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeArticle(url) {
  if (!url) return "";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const content = $("p")
    .map((i, el) => $(el).text().trim())
    .get()
    .join("\n\n");
  return content;
}
