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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const crypto_1 = __importDefault(require("crypto"));
const openai_1 = require("./openai");
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: '10mb' }));
app.get('/', (_req, res) => {
    res.send('MCP server is running');
});
app.post('/analyze', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const question = req.body.question;
    const files = req.body.files;
    if (!question || !Array.isArray(files)) {
        res.status(400).json({ error: 'Missing question or files' });
        return;
    }
    const sessionId = crypto_1.default.randomUUID();
    const combinedCode = files
        .filter(f => f.name.endsWith('.rs'))
        .map(f => `// ${sessionId}_${f.name}\n${f.content}`)
        .join('\n\n');
    try {
        const answer = yield (0, openai_1.askClaude)(question, combinedCode);
        res.json({ answer });
    }
    catch (err) {
        console.error('Analyze error:', err);
        const isRateLimit = (err === null || err === void 0 ? void 0 : err.status) === 429;
        const retryAfter = parseInt((_a = err === null || err === void 0 ? void 0 : err.headers) === null || _a === void 0 ? void 0 : _a.get('retry-after')) || 120;
        res.status(isRateLimit ? 429 : 500).json({
            error: isRateLimit ? 'rate_limit' : 'Failed to analyze uploaded files',
            retryAfter,
        });
    }
}));
app.listen(PORT, () => {
    console.log(`MCP server running at http://localhost:${PORT}`);
});
