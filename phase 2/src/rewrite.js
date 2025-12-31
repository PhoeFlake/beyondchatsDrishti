import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function rewriteArticle(original, references) {
  try {

    const prompt = `
Rewrite ONLY the CONTENT of the article from the scrapped articles.
Do NOT change the title.
You may expand explanations and add structure for clarity,
but do not invent facts or statistics.
The final article should be AT LEAST as long as the original.

Return JSON ONLY in this format:

{
 "content": "updated markdown content"
}

Article Title:
${original.title}

Original Content:
${original.content}

Reference 1:
${references?.[0] || ""}

Reference 2:
${references?.[1] || ""}

Make sure to append:

## References
1. ${references?.[0] || ""}
2. ${references?.[1] || ""}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an expert SEO editor." },
        { role: "user", content: prompt }
      ],
    });
    const data = JSON.parse(completion.choices[0].message.content);
    return {
      title: original.title,
      url: original.url,
      published_at: original.published_at,
      content: data.content
    };
  } catch (err) {
    console.error("Rewrite failed:", err.message);
    return {
      title: original.title,
      url: original.url,
      published_at: original.published_at,
      content: `
${original.content}

---

## References
${references?.[0] ? "1. " + references[0] : ""}
${references?.[1] ? "2. " + references[1] : ""}
`
    };
  }
}
