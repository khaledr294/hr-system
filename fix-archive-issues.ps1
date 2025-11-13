# سكريبت تصحيح بيانات الأرشيف
# الاستخدام: .\fix-archive-issues.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   تصحيح مشاكل نظام الأرشيف" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود المتغيرات البيئية
if (-not $env:NEXTAUTH_URL) {
    Write-Host "⚠️  تحذير: NEXTAUTH_URL غير معرف" -ForegroundColor Yellow
    $env:NEXTAUTH_URL = "http://localhost:3000"
    Write-Host "   استخدام القيمة الافتراضية: $env:NEXTAUTH_URL" -ForegroundColor Gray
}

$baseUrl = $env:NEXTAUTH_URL
Write-Host "🌐 عنوان السيرفر: $baseUrl" -ForegroundColor Green
Write-Host ""

# قائمة الخيارات
Write-Host "اختر العملية المطلوبة:" -ForegroundColor Yellow
Write-Host "1. تصحيح حالة عاملة معينة"
Write-Host "2. حذف عقد مؤرشف مكرر"
Write-Host "3. تنظيف شامل لجميع العقود المكررة"
Write-Host "4. تحديث العقود المنتهية وحالة العاملات"
Write-Host "5. البحث عن عقد JOSNA BEGUM"
Write-Host "0. خروج"
Write-Host ""

$choice = Read-Host "أدخل رقم الخيار"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📝 تصحيح حالة عاملة" -ForegroundColor Cyan
        Write-Host "-------------------" -ForegroundColor Gray
        
        $workerId = Read-Host "أدخل معرف العاملة (Worker ID)"
        
        Write-Host ""
        Write-Host "⏳ جاري تصحيح حالة العاملة..." -ForegroundColor Yellow
        
        $body = @{
            action = "fix-worker-status"
            workerId = $workerId
        } | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/api/archive/fix" `
                -Method POST `
                -ContentType "application/json" `
                -Body $body
            
            Write-Host "✅ نجح!" -ForegroundColor Green
            Write-Host $response.message -ForegroundColor White
            if ($response.previousStatus) {
                Write-Host "   الحالة السابقة: $($response.previousStatus)" -ForegroundColor Gray
                Write-Host "   الحالة الجديدة: $($response.newStatus)" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "❌ خطأ: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🗑️  حذف عقد مؤرشف مكرر" -ForegroundColor Cyan
        Write-Host "----------------------" -ForegroundColor Gray
        
        $archivedId = Read-Host "أدخل معرف العقد المؤرشف (Archived Contract ID)"
        
        Write-Host ""
        Write-Host "⏳ جاري حذف العقد المكرر..." -ForegroundColor Yellow
        
        $body = @{
            action = "delete-archived-duplicate"
            archivedContractId = $archivedId
        } | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/api/archive/fix" `
                -Method POST `
                -ContentType "application/json" `
                -Body $body
            
            if ($response.success) {
                Write-Host "✅ نجح!" -ForegroundColor Green
                Write-Host $response.message -ForegroundColor White
            } else {
                Write-Host "⚠️  $($response.message)" -ForegroundColor Yellow
                if ($response.canRestore) {
                    Write-Host "   يمكنك استعادة هذا العقد من الأرشيف" -ForegroundColor Gray
                }
            }
        }
        catch {
            Write-Host "❌ خطأ: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🧹 تنظيف شامل للعقود المكررة" -ForegroundColor Cyan
        Write-Host "----------------------------" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⚠️  تحذير: هذه العملية ستحذف جميع العقود المؤرشفة المكررة!" -ForegroundColor Yellow
        $confirm = Read-Host "هل أنت متأكد؟ (yes/no)"
        
        if ($confirm -eq "yes") {
            Write-Host ""
            Write-Host "⏳ جاري التنظيف..." -ForegroundColor Yellow
            
            $body = @{
                action = "cleanup-duplicate-archives"
            } | ConvertTo-Json
            
            try {
                $response = Invoke-RestMethod -Uri "$baseUrl/api/archive/fix" `
                    -Method POST `
                    -ContentType "application/json" `
                    -Body $body
                
                Write-Host "✅ نجح!" -ForegroundColor Green
                Write-Host $response.message -ForegroundColor White
                Write-Host "   تم تنظيف: $($response.cleanedCount) عقد" -ForegroundColor Gray
            }
            catch {
                Write-Host "❌ خطأ: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "تم الإلغاء" -ForegroundColor Gray
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "🔄 تحديث العقود المنتهية" -ForegroundColor Cyan
        Write-Host "----------------------" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⏳ جاري تحديث العقود المنتهية وحالة العاملات..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/api/contracts/update-expired" `
                -Method POST `
                -ContentType "application/json"
            
            Write-Host "✅ نجح!" -ForegroundColor Green
            Write-Host $response.message -ForegroundColor White
            Write-Host "   تم تحديث: $($response.updatedContracts) عقد" -ForegroundColor Gray
        }
        catch {
            Write-Host "❌ خطأ: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "🔍 البحث عن عقد JOSNA BEGUM" -ForegroundColor Cyan
        Write-Host "-------------------------" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⏳ جاري البحث..." -ForegroundColor Yellow
        
        try {
            # البحث في الأرشيف
            $response = Invoke-RestMethod -Uri "$baseUrl/api/archive?workerName=JOSNA" `
                -Method GET
            
            if ($response.Count -gt 0) {
                Write-Host "✅ تم العثور على $($response.Count) عقد في الأرشيف:" -ForegroundColor Green
                Write-Host ""
                
                foreach ($contract in $response) {
                    Write-Host "📄 عقد رقم: $($contract.contractNumber)" -ForegroundColor White
                    Write-Host "   ID: $($contract.id)" -ForegroundColor Gray
                    Write-Host "   العاملة: $($contract.workerName)" -ForegroundColor Gray
                    Write-Host "   العميل: $($contract.clientName)" -ForegroundColor Gray
                    Write-Host "   الحالة: $($contract.status)" -ForegroundColor Gray
                    Write-Host "   تاريخ البداية: $($contract.startDate)" -ForegroundColor Gray
                    Write-Host "   تاريخ النهاية: $($contract.endDate)" -ForegroundColor Gray
                    Write-Host "   سبب الأرشفة: $($contract.archiveReason)" -ForegroundColor Gray
                    Write-Host ""
                }
                
                Write-Host "💡 لحل المشكلة:" -ForegroundColor Yellow
                Write-Host "   1. احصل على Worker ID للعاملة JOSNA BEGUM"
                Write-Host "   2. استخدم الخيار 1 لتصحيح حالتها"
                Write-Host "   3. ثم حاول استعادة العقد من صفحة الأرشيف"
            } else {
                Write-Host "⚠️  لم يتم العثور على عقود مؤرشفة باسم JOSNA" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "❌ خطأ: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "0" {
        Write-Host "وداعاً! 👋" -ForegroundColor Cyan
        exit
    }
    
    default {
        Write-Host "❌ خيار غير صحيح" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "اضغط Enter للخروج..."
Read-Host
