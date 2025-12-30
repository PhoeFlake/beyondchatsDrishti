import axios from "axios";
function mysqlDate(d) {
  return new Date(d).toISOString().slice(0, 19).replace("T", " ");
}
export async function publishArticle(article) {
  try {
    const payload = {
      title: article.title,
      url: article.url,
      content: article.content,
      published_at: mysqlDate(article.published_at || new Date())
    };
    try {
      const res = await axios.post(
        "http://localhost:5000/articles",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Created → ID:", res.data.id);
      return res.data;
    } catch (err) {
      if (err.response?.data?.error?.includes("Duplicate entry")) {
        await axios.put(
          "http://localhost:5000/articles/by-url",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Updated existing article");
        return { updated: true };
      }
      throw err;
    }
  } catch (err) {
    console.error("Publish failed:", err.response?.data || err.message);
  }
}
