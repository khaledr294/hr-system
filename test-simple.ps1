Write-Host "Testing API..." -ForegroundColor Cyan

$body = @{
    workerId = "cm2i6lk0x000013oka4625i15"
    selectedMonth = "2025-09"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/contracts" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}