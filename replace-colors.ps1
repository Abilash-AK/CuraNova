# PowerShell script to replace purple colors with turquoise blue
# Color mapping:
# purple-50 -> cyan-50
# purple-100 -> cyan-100
# purple-200 -> cyan-200
# purple-300 -> cyan-300
# purple-400 -> cyan-400
# purple-500 -> cyan-500
# purple-600 -> cyan-600
# purple-700 -> cyan-700
# purple-800 -> cyan-800
# purple-900 -> cyan-900
# purple -> cyan

Write-Host "Starting color replacement from purple to cyan (turquoise blue)..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src\react-app" -Include *.tsx,*.ts,*.css -Recurse

$replacements = @{
    "purple-900" = "cyan-900"
    "purple-800" = "cyan-800"
    "purple-700" = "cyan-700"
    "purple-600" = "cyan-600"
    "purple-500" = "cyan-500"
    "purple-400" = "cyan-400"
    "purple-300" = "cyan-300"
    "purple-200" = "cyan-200"
    "purple-100" = "cyan-100"
    "purple-50" = "cyan-50"
    "text-purple" = "text-cyan"
    "bg-purple" = "bg-cyan"
    "border-purple" = "border-cyan"
    "ring-purple" = "ring-cyan"
    "from-purple" = "from-cyan"
    "to-purple" = "to-cyan"
    "via-purple" = "via-cyan"
    "hover:text-purple" = "hover:text-cyan"
    "hover:bg-purple" = "hover:bg-cyan"
    "hover:border-purple" = "hover:border-cyan"
    "dark:text-purple" = "dark:text-cyan"
    "dark:bg-purple" = "dark:bg-cyan"
    "dark:border-purple" = "dark:border-cyan"
    "dark:from-purple" = "dark:from-cyan"
    "dark:to-purple" = "dark:to-cyan"
    "dark:via-purple" = "dark:via-cyan"
    "dark:hover:text-purple" = "dark:hover:text-cyan"
    "shadow-purple" = "shadow-cyan"
    "focus:ring-purple" = "focus:ring-cyan"
    "dark:focus:ring-purple" = "dark:focus:ring-cyan"
    "group-hover:text-purple" = "group-hover:text-cyan"
    "dark:group-hover:text-purple" = "dark:group-hover:text-cyan"
}

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($key in $replacements.Keys) {
        $pattern = [regex]::Escape($key)
        $matches = [regex]::Matches($content, $pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $pattern, $replacements[$key]
            $fileReplacements += $matches.Count
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalFiles++
        $totalReplacements += $fileReplacements
        Write-Host "[OK] Updated: $($file.Name) ($fileReplacements replacements)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Color replacement complete!" -ForegroundColor Green
Write-Host "Files modified: $totalFiles" -ForegroundColor Cyan
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Pink colors kept for contrast. Indigo kept as complementary color." -ForegroundColor Yellow
