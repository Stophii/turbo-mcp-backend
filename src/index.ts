// index.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { askClaude } from './openai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
  res.send('MCP server is running');
});

app.post('/analyze', async (req, res) => {
  const question: string = req.body.question;
  const files: { name: string; content: string }[] = req.body.files;

  if (!question || !Array.isArray(files)) {
    res.status(400).json({ error: 'Missing question or files' });
    return;
  }

  const sessionId = crypto.randomUUID();

  const combinedCode = files
    .filter(f => f.name.endsWith('.rs'))
    .map(f => `// ${sessionId}_${f.name}\n${f.content}`)
    .join('\n\n');

  try {
    const answer = await askClaude(question, combinedCode);
    res.json({ answer });
  } catch (err: any) {
    console.error('Analyze error:', err);

    const isRateLimit = err?.status === 429;
    const retryAfter = parseInt(err?.headers?.get('retry-after')) || 120;

    res.status(isRateLimit ? 429 : 500).json({
      error: isRateLimit ? 'rate_limit' : 'Failed to analyze uploaded files',
      retryAfter,
    });
  }
});


app.listen(PORT, () => {
  console.log(`MCP server running at http://localhost:${PORT}`);
});
