// Charger les variables d'environnement
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const port = 3000;

// Connexion Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// L'ID fixe pour accéder à ta ligne unique dans la table
const RECORD_ID = "4e612913-4ab6-403f-b0bc-9b189b1d4314";

// CORS - autoriser uniquement ta page front locale
app.use(cors({
  origin: "http://127.0.0.1:5500"
}));
app.use(express.json());

/** 🧠 Lecture de l’état **/
async function getData() {
  const { data, error } = await supabase
    .from("file_data")
    .select("*")
    .eq("id", RECORD_ID)
    .single();

  if (error) throw error;
  return data;
}

/** ✍️ Mise à jour de l’état **/
async function updateData(current, last_ticket) {
  const { error } = await supabase
    .from("file_data")
    .update({ current, last_ticket })
    .eq("id", RECORD_ID);

  if (error) throw error;
}

/** 📌 ROUTES **/

// Obtenir l'état actuel
app.get("/api/current", async (req, res) => {
  try {
    const data = await getData();
    res.json({ current: data.current, last_ticket: data.last_ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Nouveau ticket
app.post("/api/new-ticket", async (req, res) => {
  try {
    const data = await getData();
    const newTicket = data.last_ticket + 1;
    await updateData(data.current, newTicket);
    res.json({ ticket: newTicket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suivant
app.post("/api/next", async (req, res) => {
  try {
    const data = await getData();
    let newCurrent = data.current;
    if (data.current < data.last_ticket) {
      newCurrent = data.current + 1;
      await updateData(newCurrent, data.last_ticket);
    }
    res.json({ current: newCurrent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Précédent
app.post("/api/prev", async (req, res) => {
  try {
    const data = await getData();
    let newCurrent = data.current;
    if (data.current > 1) {
      newCurrent = data.current - 1;
      await updateData(newCurrent, data.last_ticket);
    }
    res.json({ current: newCurrent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remise à zéro
app.post("/api/reset", async (req, res) => {
  try {
    await updateData(0, 0);
    res.json({ message: "Réinitialisé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${port}`);
});