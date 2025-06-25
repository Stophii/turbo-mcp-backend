"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askClaude = askClaude;
const dotenv_1 = require("dotenv");
const sdk_1 = require("@anthropic-ai/sdk");
(0, dotenv_1.config)(); // Load .env only once
const anthropic = new sdk_1.Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});
function askClaude(question, code) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `You are a helpful and knowledgeable assistant specialized in Turbo, a game engine for Rust. A user is building a game using Turbo and has uploaded the contents of their project's src folder. They have a question about how to improve or debug their game code.

  Question:
  "${question}"

  Below is the full source code they uploaded. Analyze and respond only using the code provided. Do not reference external files or previous sessions.

  --- PROJECT FILES START ---
  ${code}
  --- PROJECT FILES END ---
  `;
        const msg = yield anthropic.messages.create({
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
    });
}
