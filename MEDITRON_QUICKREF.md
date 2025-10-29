# Meditron 7B Quick Reference Card

## 🚀 Quick Start (5 Minutes)

```powershell
# 1. Install Ollama (Windows)
winget install Ollama.Ollama

# 2. Pull Meditron 7B
ollama pull meditron

# 3. Verify installation
ollama list

# 4. Test integration
.\test-meditron.ps1

# 5. Start CuraNova
npm run dev          # Frontend (Terminal 1)
npm run dev:worker   # Worker (Terminal 2)
```

---

## 📡 API Endpoints

### Chatbot (Medical Q&A)
```bash
POST /api/chatbot
Authorization: Bearer <token>

{
  "message": "What is Type 2 Diabetes?",
  "conversationHistory": []
}

Response:
{
  "response": "...",
  "model": "meditron-7b",
  "source": "meditron"
}
```

### Patient Health Summary
```bash
GET /api/patient-health-summary/:mrn
Cookie: patient_session_token=...

Response:
{
  "summary": "# Your Health Summary...",
  "model": "meditron-7b",
  "source": "meditron-cached",
  "ai_generated": true
}
```

---

## 🔧 Environment Variables

```bash
# .dev.vars
OLLAMA_URL="http://localhost:11434"
GEMINI_API_KEY="your_key_here"
```

---

## 💻 Code Usage

### Generate Patient Summary
```typescript
import { OllamaClient } from './lib/ollama-client';
import { buildPatientDataString, HEALTH_SUMMARY_PROMPT_TEMPLATE } from './lib/meditron-prompts';

const ollama = new OllamaClient({
  baseUrl: 'http://localhost:11434',
  model: 'meditron',
  temperature: 0.5,
});

const patientData = { /* ... */ };
const prompt = `${HEALTH_SUMMARY_PROMPT_TEMPLATE}\n\n${buildPatientDataString(patientData)}`;
const summary = await ollama.generate(prompt);
```

### Medical Chatbot
```typescript
const messages = [
  { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
  { role: 'user', content: 'What is hypertension?' }
];

const response = await ollama.chat(messages);
```

### With Caching
```typescript
import { OllamaCache } from './lib/ollama-client';

const cache = new OllamaCache();
const cacheKey = OllamaCache.generateKey(patientData);

// Check cache first
const cached = cache.get(cacheKey);
if (cached) return cached;

// Generate and cache
const summary = await ollama.generate(prompt);
cache.set(cacheKey, summary);
```

---

## 🔍 Health Checks

### Ollama Service
```bash
curl http://localhost:11434/api/version
```

### Test Generation
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "meditron",
  "prompt": "What is diabetes?",
  "stream": false
}'
```

### Worker Health
```bash
curl http://localhost:8787/health
```

---

## 📊 Response Sources

| Source | Meaning | Speed |
|--------|---------|-------|
| `meditron` | Fresh Meditron generation | 1-3s |
| `meditron-cached` | Cached response | <100ms |
| `gemini-fallback` | Gemini API backup | 500ms-2s |
| `fallback` | Static template | Instant |

---

## 🐛 Troubleshooting

### "Connection refused on localhost:11434"
```powershell
# Start Ollama service
ollama serve
```

### "Model not found: meditron"
```bash
ollama pull meditron
```

### Slow responses (>10s)
```powershell
# Check if model is loaded
ollama ps

# Restart Ollama to clear memory
Stop-Process -Name ollama -Force
ollama serve
```

### Worker not using Meditron
```bash
# Check logs
wrangler tail

# Verify OLLAMA_URL in .dev.vars
cat .dev.vars
```

---

## 📈 Performance Tips

1. **Keep Ollama Running**: First request loads model (5s), subsequent are faster
2. **Use Caching**: Cache hit = instant response
3. **GPU Acceleration**: Ollama auto-detects NVIDIA GPUs (10x faster)
4. **Limit History**: Keep conversation history to last 10 messages
5. **Batch Requests**: Process multiple patients in parallel

---

## 🎯 Model Parameters

```typescript
// Conservative (medical accuracy)
{
  temperature: 0.3,
  top_p: 0.9,
  top_k: 40
}

// Balanced (default)
{
  temperature: 0.5,
  top_p: 0.95,
  top_k: 50
}

// Creative (patient education)
{
  temperature: 0.7,
  top_p: 0.95,
  top_k: 60
}
```

---

## 🔐 Security Checklist

- [ ] Ollama port 11434 restricted to localhost
- [ ] Patient session validation enabled
- [ ] Audit logging for all AI requests
- [ ] HTTPS for remote access (Cloudflare Tunnel)
- [ ] Regular security updates for Ollama

---

## 📚 File Locations

```
src/
├── worker/
│   ├── index.ts              # Main worker (chatbot + summary endpoints)
│   └── lib/
│       ├── ollama-client.ts  # Ollama API client
│       └── meditron-prompts.ts  # Medical prompts
worker-configuration.d.ts      # TypeScript env types
.dev.vars                      # Environment variables
test-meditron.ps1             # Integration test script
MEDITRON_SETUP.md             # Full setup guide
MEDITRON_IMPLEMENTATION.md    # Implementation docs
```

---

## 🆘 Quick Commands

```powershell
# Check Ollama status
ollama ps

# List installed models
ollama list

# Test Meditron
ollama run meditron "What is hypertension?"

# View worker logs
wrangler tail

# Restart everything
Stop-Process -Name ollama -Force; ollama serve
npm run dev:worker

# Run integration tests
.\test-meditron.ps1
```

---

## 📞 Support

- **Setup Guide**: `MEDITRON_SETUP.md`
- **Implementation Details**: `MEDITRON_IMPLEMENTATION.md`
- **GitHub Issues**: https://github.com/Abilash-AK/CuraNova/issues

---

**Last Updated**: October 29, 2025  
**Version**: 1.0.0
