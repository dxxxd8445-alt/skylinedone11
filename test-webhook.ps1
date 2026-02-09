# Test Discord Webhook
$webhookUrl = "https://discord.com/api/webhooks/1470214571913646246/QtYckEUaUFeG8ybiRMY1CVH1VnybbxS3-R4fdRECQZ7zGVVwgwSTn2EdI4rseTrFUaHr"

$body = @{
    embeds = @(
        @{
            title = "🧪 Skyline Cheats - Webhook Test"
            description = "Your Discord webhook is configured and working!"
            color = 2563235
            fields = @(
                @{
                    name = "Status"
                    value = "✅ Active"
                    inline = $true
                }
                @{
                    name = "Events"
                    value = "7 tracked"
                    inline = $true
                }
            )
            timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            footer = @{
                text = "Skyline Cheats"
            }
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "🧪 Testing Discord Webhook..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Webhook test successful!" -ForegroundColor Green
    Write-Host "Check your Discord channel for the test message." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Webhook test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
