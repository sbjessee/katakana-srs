# Start server in background
$job = Start-Job -ScriptBlock {
  Set-Location "C:\Users\skyle\source\repos\katakana\backend"
  npx ts-node src/index.ts
}

# Wait for server to start
Start-Sleep -Seconds 5

# Test the API
Write-Host "Testing /api/health:"
curl http://localhost:3975/api/health

Write-Host "`nTesting /api/test:"
curl http://localhost:3975/api/test

Write-Host "`nTesting /api/stats:"
curl http://localhost:3975/api/stats

# Stop the job
Stop-Job $job
Remove-Job $job
