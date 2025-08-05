require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const systemPrompt = `Olet ystävällinen oppimiskumppani, joka auttaa oppilasta ymmärtämään veden kiertokulkua paremmin.
Älä koskaan anna suoraa vastausta, vaan ohjaa oppilasta kysymyksillä, esimerkeillä ja kannustavalla tavalla.
Oppilas on juuri kertonut ajatuksiaan sateesta. Vastaa nyt jatkokysymyksellä tai pohdintaa herättävällä kommentilla.`;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { userMessage } = req.body;
  if (!userMessage) return res.status(400).json({ error: 'userMessage is required' });
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500
    });
    const botMessage = response.choices[0].message.content;
    // Lähetetään vastauksen sisältö frontendiin JSON-muodossa
    res.json({ botMessage });
  } catch (error) {
    console.error(error);
    if (error.code === 'insufficient_quota') {
      return res.status(500).json({ error: 'Quota exceeded. Saldo ylittynyt.' });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));