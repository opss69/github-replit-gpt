
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let generatorPromise = null;

async function getGenerator() {
  if (!generatorPromise) {
    generatorPromise = pipeline('text-generation', 'Xenova/distilgpt2');
  }
  return generatorPromise;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const gen = await getGenerator();
    const prompt = [
      "You are a helpful assistant. Answer briefly.\n",
      ...history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}\n`),
      `User: ${message}\nAssistant:`
    ].join('');

    const output = await gen(prompt, {
      max_new_tokens: 80,
      temperature: 0.7,
      top_p: 0.9,
      do_sample: true
    });

    const text = output[0].generated_text.split('Assistant:').pop().trim();
    res.json({ reply: text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Model error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
