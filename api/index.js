import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const RECORD_ID = "4e612913-4ab6-403f-b0bc-9b189b1d4314";

export default async function handler(req, res) {
  const { url, method } = req;

  const getData = async () => {
    const { data, error } = await supabase
      .from("file_data")
      .select("*")
      .eq("id", RECORD_ID)
      .single();
    if (error) throw error;
    return data;
  };

  const updateData = async (current, last_ticket) => {
    const { error } = await supabase
      .from("file_data")
      .update({ current, last_ticket })
      .eq("id", RECORD_ID);
    if (error) throw error;
  };

  try {
    if (url.endsWith("/api/current") && method === "GET") {
      const data = await getData();
      return res.status(200).json({
        current: data.current,
        last_ticket: data.last_ticket,
      });
    }

    if (url.endsWith("/api/new-ticket") && method === "POST") {
      const data = await getData();
      const newTicket = data.last_ticket + 1;
      await updateData(data.current, newTicket);
      return res.status(200).json({ ticket: newTicket });
    }

    if (url.endsWith("/api/next") && method === "POST") {
      const data = await getData();
      const next = Math.min(data.current + 1, data.last_ticket);
      await updateData(next, data.last_ticket);
      return res.status(200).json({ current: next });
    }

    if (url.endsWith("/api/prev") && method === "POST") {
      const data = await getData();
      const prev = Math.max(data.current - 1, 0);
      await updateData(prev, data.last_ticket);
      return res.status(200).json({ current: prev });
    }

    if (url.endsWith("/api/reset") && method === "POST") {
      await updateData(0, 0);
      return res.status(200).json({ message: "Réinitialisé" });
    }

    res.status(404).json({ error: "Not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}