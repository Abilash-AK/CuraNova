# Meditron 7B Setup Guide

This guide will help you set up Meditron 7B locally using Ollama to power the AI features in CuraNova EMR.

## 🎯 Benefits of Meditron 7B

- **Cost Savings**: $0 per request vs $0.001+ for cloud APIs
- **Privacy**: All medical data stays local (HIPAA-compliant)
- **Medical Accuracy**: Trained on PubMed, clinical guidelines, and medical literature
- **Offline Capability**: Works without internet connection
- **Fast Response**: Local inference (1-3 seconds on modern hardware)

---

## 📋 Prerequisites

- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: ~5GB for Meditron 7B model
- **CPU**: Modern multi-core processor (M1/M2/M3 Mac or Intel/AMD x64)
- **Optional**: NVIDIA GPU with 8GB+ VRAM for faster inference

---

## 🚀 Installation Steps

### Step 1: Install Ollama

#### Windows
```powershell
# Download Ollama installer
Invoke-WebRequest -Uri "https://ollama.com/download/windows" -OutFile "$env:TEMP\OllamaSetup.exe"

# Run installer
Start-Process -FilePath "$env:TEMP\OllamaSetup.exe" -Wait

# Verify installation
ollama --version
```

#### macOS
```bash
# Using Homebrew
brew install ollama

# Or download from https://ollama.com/download/mac

# Verify installation
ollama --version
```

#### Linux
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify installation
ollama --version
```

### Step 2: Pull Meditron 7B Model

```bash
# Download Meditron 7B (this will take 5-10 minutes)
ollama pull meditron

# Verify the model is available
ollama list
```

Expected output:
```
NAME                ID              SIZE      MODIFIED
meditron:latest     abc123def456    3.8 GB    2 minutes ago
```

### Step 3: Test Meditron Locally

```bash
# Start interactive chat with Meditron
ollama run meditron

# Try a medical question:
# "What are the treatment options for Type 2 Diabetes?"

# Exit with: /bye
```

### Step 4: Start Ollama Server

Ollama runs as a background service by default on port 11434.

```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# If not running, start it:
ollama serve
```

---

## ⚙️ CuraNova Configuration

The Meditron integration is already implemented in your worker! 

### Environment Variables

Your `.dev.vars` file should have:

```bash
OLLAMA_URL="http://localhost:11434"
GEMINI_API_KEY="your_gemini_key_here"  # Fallback only
```

### Fallback Strategy

CuraNova uses a **three-tier AI fallback system**:

1. **Primary**: Meditron 7B (local, $0 cost, ~2s response)
2. **Secondary**: Google Gemini API (cloud fallback, $0.001/request)
3. **Tertiary**: Static medical summaries (always available)

---

## 🧪 Testing the Integration

### Test 1: Health Check

```bash
# Verify Ollama is accessible
curl http://localhost:11434/api/tags
```

### Test 2: Generate Medical Summary

```bash
# Test Meditron text generation
curl http://localhost:11434/api/generate -d '{
  "model": "meditron",
  "prompt": "Patient has Type 2 Diabetes and hypertension. Generate treatment recommendations.",
  "stream": false
}'
```

### Test 3: Run CuraNova

```powershell
# Start the development server
npm run dev

# In another terminal, start Cloudflare Worker
npm run dev:worker

# Open http://localhost:5173 and test:
# 1. Login as a doctor
# 2. View a patient
# 3. Generate AI health summary
# 4. Use the medical chatbot
```

---

## 🎨 Custom Meditron Configuration (Optional)

Create a `Modelfile` to customize Meditron's behavior:

```bash
# Create Modelfile
@"
FROM meditron

# Set temperature for medical accuracy (lower = more precise)
PARAMETER temperature 0.5
PARAMETER top_p 0.9
PARAMETER top_k 40

# Increase context window for longer conversations
PARAMETER num_ctx 4096

# Medical system prompt
SYSTEM "You are Meditron, a medical AI assistant trained on PubMed and clinical literature. Provide evidence-based, accurate medical information. Always emphasize consulting healthcare providers for personalized advice."
"@ | Out-File -FilePath Modelfile -Encoding UTF8

# Create custom model
ollama create meditron-medical -f Modelfile

# Update worker to use custom model
# In src/worker/lib/ollama-client.ts, change:
# model: 'meditron-medical'
```

---

## 📊 Performance Optimization

### CPU Optimization
```bash
# Limit CPU threads (if system is slow)
$env:OLLAMA_NUM_THREAD = "4"
ollama serve
```

### GPU Acceleration (NVIDIA)
```bash
# Ollama automatically uses GPU if available
# Verify GPU usage:
nvidia-smi

# Should show "ollama" process using VRAM
```

### Memory Management
```bash
# Set model keep-alive time (default: 5 minutes)
$env:OLLAMA_KEEP_ALIVE = "10m"
ollama serve
```

---

## 🔧 Troubleshooting

### Issue: "Connection refused on localhost:11434"

**Solution**: Start Ollama service
```powershell
ollama serve
```

### Issue: "Model not found: meditron"

**Solution**: Pull the model
```bash
ollama pull meditron
```

### Issue: Slow response times (>10 seconds)

**Solutions**:
1. Check CPU usage: `Task Manager` (Windows) or `top` (Mac/Linux)
2. Reduce concurrent requests
3. Use GPU acceleration if available
4. Increase cache TTL in `OllamaCache` (default: 60 minutes)

### Issue: Out of memory errors

**Solutions**:
1. Close other applications
2. Use smaller model: `ollama pull meditron:7b-q4_0` (quantized, 2GB)
3. Increase system swap space
4. Use cloud Ollama instance (see below)

---

## ☁️ Cloud Deployment Options

### Option 1: VPS with Ollama

Deploy to a VPS (DigitalOcean, AWS, Azure):

```bash
# On VPS (Ubuntu 22.04)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull meditron
ollama serve

# Update .dev.vars in CuraNova
OLLAMA_URL="http://your-vps-ip:11434"
```

### Option 2: Cloudflare Tunnel

Expose local Ollama securely:

```bash
# Install Cloudflare Tunnel
npm install -g cloudflared

# Create tunnel
cloudflared tunnel create curanova-ollama

# Route tunnel to localhost:11434
cloudflared tunnel route dns curanova-ollama ollama.yourdomain.com

# Run tunnel
cloudflared tunnel run curanova-ollama
```

---

## 📈 Monitoring & Analytics

### Cache Statistics

```typescript
// In your worker logs, you'll see:
const stats = cache.getStats();
console.log(`Cache hits: ${stats.hits}, misses: ${stats.misses}`);
```

### Response Times

The worker automatically logs:
- Meditron response time
- Fallback to Gemini (if triggered)
- Cache hit/miss

Check Cloudflare Worker logs for metrics.

---

## 🔐 Security Considerations

1. **Firewall**: Restrict Ollama port (11434) to localhost only
2. **HTTPS**: Use Cloudflare Tunnel or VPN for remote access
3. **Authentication**: Ollama has no built-in auth - secure with network layers
4. **Data Privacy**: All patient data stays local (HIPAA-compliant)

---

## 📚 Additional Resources

- **Meditron Paper**: https://arxiv.org/abs/2311.16079
- **Ollama Docs**: https://ollama.com/docs
- **Model Library**: https://ollama.com/library/meditron
- **CuraNova Issues**: https://github.com/Abilash-AK/CuraNova/issues

---

## 🎉 Success!

If you see these in your worker logs:

```
✅ Ollama health check: OK
✅ Generated patient summary with Meditron 7B (2.3s)
✅ Cache hit rate: 45%
```

**You're all set!** CuraNova is now running with local AI powered by Meditron 7B.

---

## 🆘 Need Help?

- Check logs: `wrangler tail` (for worker logs)
- Ollama logs: `ollama logs` (if available on your OS)
- Create an issue: https://github.com/Abilash-AK/CuraNova/issues/new
