import { config } from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';

config(); // Load .env only once

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export async function askClaude(question: string, code: string): Promise<string> {
  const prompt = `You are a helpful and knowledgeable assistant specialized in Turbo, a game engine for Rust. A user is building a game using Turbo and has uploaded the contents of their project's src folder. They have a question about how to improve or debug their game code.

  Question:
  "${question}"

  Below is the full source code they uploaded. Analyze and respond only using the code provided. Do not reference external files or previous sessions.

  --- PROJECT FILES START ---
  ${code}
  --- PROJECT FILES END ---
  `;
  
  const msg = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
  const contentBlock = msg.content.find(c => c.type === 'text');
  if (contentBlock && contentBlock.type === 'text') {
  return contentBlock.text;
  }
  return "No answer generated.";
}
