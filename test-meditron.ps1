#!/usr/bin/env pwsh
# Test script for Meditron 7B integration with CuraNova

Write-Host "🔬 CuraNova Meditron 7B Integration Test" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Test 1: Check if Ollama is installed
Write-Host "[Test 1] Checking Ollama installation..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ollama installed: $ollamaVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Ollama not found. Please install from https://ollama.com" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Ollama not found. Please install from https://ollama.com" -ForegroundColor Red
    exit 1
}

# Test 2: Check if Ollama service is running
Write-Host "`n[Test 2] Checking Ollama service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/version" -Method Get -TimeoutSec 5
    Write-Host "✅ Ollama service is running (version: $($response.version))" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ollama service not responding. Starting it..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -NoNewWindow -PassThru | Out-Null
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/version" -Method Get -TimeoutSec 5
        Write-Host "✅ Ollama service started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start Ollama service" -ForegroundColor Red
        Write-Host "   Try running: ollama serve" -ForegroundColor Yellow
        exit 1
    }
}

# Test 3: Check if Meditron model is installed
Write-Host "`n[Test 3] Checking Meditron 7B model..." -ForegroundColor Yellow
try {
    $models = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 10
    $meditronInstalled = $models.models | Where-Object { $_.name -like "meditron*" }
    
    if ($meditronInstalled) {
        Write-Host "✅ Meditron model found: $($meditronInstalled.name)" -ForegroundColor Green
        $size = [math]::Round($meditronInstalled.size / 1GB, 2)
        Write-Host "   Size: $size GB" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Meditron model not found" -ForegroundColor Red
        Write-Host "`n   Installing Meditron 7B (this will take 5-10 minutes)..." -ForegroundColor Yellow
        Write-Host "   Run: ollama pull meditron" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Failed to check models" -ForegroundColor Red
    exit 1
}

# Test 4: Test Meditron text generation
Write-Host "`n[Test 4] Testing Meditron text generation..." -ForegroundColor Yellow
$testPrompt = @{
    model = "meditron"
    prompt = "What is Type 2 Diabetes? Give a brief 2-sentence explanation."
    stream = $false
    options = @{
        temperature = 0.5
        num_predict = 100
    }
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $testPrompt -ContentType "application/json" -TimeoutSec 30
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    if ($response.response) {
        Write-Host "✅ Meditron generated response in $([math]::Round($duration, 2))s" -ForegroundColor Green
        Write-Host "`n   Response preview:" -ForegroundColor Cyan
        $preview = $response.response.Substring(0, [Math]::Min(200, $response.response.Length))
        Write-Host "   $preview..." -ForegroundColor White
    } else {
        Write-Host "❌ No response from Meditron" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to generate text: $_" -ForegroundColor Red
    exit 1
}

# Test 5: Test Meditron chat interface
Write-Host "`n[Test 5] Testing Meditron chat interface..." -ForegroundColor Yellow
$chatPayload = @{
    model = "meditron"
    messages = @(
        @{
            role = "system"
            content = "You are a medical AI assistant."
        },
        @{
            role = "user"
            content = "What is hypertension?"
        }
    )
    stream = $false
    options = @{
        temperature = 0.5
    }
} | ConvertTo-Json -Depth 10

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/chat" -Method Post -Body $chatPayload -ContentType "application/json" -TimeoutSec 30
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    if ($response.message.content) {
        Write-Host "✅ Chat interface working ($([math]::Round($duration, 2))s)" -ForegroundColor Green
        Write-Host "`n   Response preview:" -ForegroundColor Cyan
        $preview = $response.message.content.Substring(0, [Math]::Min(200, $response.message.content.Length))
        Write-Host "   $preview..." -ForegroundColor White
    } else {
        Write-Host "❌ No chat response from Meditron" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Chat interface failed: $_" -ForegroundColor Red
    exit 1
}

# Test 6: Check environment configuration
Write-Host "`n[Test 6] Checking CuraNova configuration..." -ForegroundColor Yellow
$devVarsPath = Join-Path $PSScriptRoot ".dev.vars"
if (Test-Path $devVarsPath) {
    $devVars = Get-Content $devVarsPath -Raw
    if ($devVars -match 'OLLAMA_URL') {
        Write-Host "✅ OLLAMA_URL configured in .dev.vars" -ForegroundColor Green
    } else {
        Write-Host "⚠️  OLLAMA_URL not found in .dev.vars" -ForegroundColor Yellow
        Write-Host "   Add: OLLAMA_URL=`"http://localhost:11434`"" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  .dev.vars file not found" -ForegroundColor Yellow
}

# Test 7: Check TypeScript integration files
Write-Host "`n[Test 7] Checking integration files..." -ForegroundColor Yellow
$filesToCheck = @(
    "src\worker\lib\ollama-client.ts",
    "src\worker\lib\meditron-prompts.ts",
    "worker-configuration.d.ts"
)

$allFilesExist = $true
foreach ($file in $filesToCheck) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Final Summary
Write-Host "`n=========================================`n" -ForegroundColor Cyan
Write-Host "🎉 Test Summary" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

if ($allFilesExist) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Run: npm run dev (start frontend)" -ForegroundColor White
    Write-Host "   2. Run: npm run dev:worker (start worker)" -ForegroundColor White
    Write-Host "   3. Open: http://localhost:5173" -ForegroundColor White
    Write-Host "   4. Login and test AI features" -ForegroundColor White
    Write-Host "`n💡 Tips:" -ForegroundColor Yellow
    Write-Host "   - First AI request may be slower (~5s) as model loads" -ForegroundColor White
    Write-Host "   - Subsequent requests will be cached (60 min TTL)" -ForegroundColor White
    Write-Host "   - Check worker logs with: wrangler tail" -ForegroundColor White
} else {
    Write-Host "⚠️  Some tests failed. Please review errors above." -ForegroundColor Yellow
}

Write-Host "`n=========================================`n" -ForegroundColor Cyan
