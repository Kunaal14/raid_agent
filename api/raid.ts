import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { tweet_id } = req.query;

  if (!tweet_id) {
    return res.status(400).json({ error: "Missing tweet_id" });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.rpc("get_and_mark_reply", {
      p_tweet_id: tweet_id,
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No more replies available" });
    }

    const reply = data[0];
    const encodedReply = encodeURIComponent(reply.reply_text);
    const twitterUrl = `https://twitter.com/intent/tweet?in_reply_to=${tweet_id}&text=${encodedReply}`;

    return res.redirect(302, twitterUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
