# اختبار API العقود
Write-Host "🧮 اختبار API العقود..." -ForegroundColor Cyan

# تجهيز البيانات
$body = @{
    workerId = "cm2i6lk0x000013oka4625i15"
    selectedMonth = "2025-09"
} | ConvertTo-Json

Write-Host "📤 إرسال طلب إلى API..." -ForegroundColor Yellow
Write-Host "📋 Worker ID: cm2i6lk0x000013oka4625i15" -ForegroundColor Gray
Write-Host "📅 الشهر: 2025-09" -ForegroundColor Gray

try {
    # إرسال POST request
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/contracts" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ نجح الطلب!" -ForegroundColor Green
    Write-Host "📊 النتيجة:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
    # حساب أيام العمل إذا كانت هناك عقود
    if ($response.contracts) {
        Write-Host "🗓️ عدد العقود الموجودة: $($response.contracts.Count)" -ForegroundColor Yellow
        foreach ($contract in $response.contracts) {
            Write-Host "📝 عقد من $($contract.startDate) إلى $($contract.endDate)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ خطأ في الطلب: $($_.Exception.Message)" -ForegroundColor Red
}