$ErrorActionPreference = "Continue"
Set-Location "C:\Users\op\Desktop\magma src (1)\magma src"
git add . 2>&1 | Out-File -FilePath "git-output.txt"
git commit -m "Add live sales notifications and dynamic online counter" 2>&1 | Out-File -FilePath "git-output.txt" -Append
git push origin main 2>&1 | Out-File -FilePath "git-output.txt" -Append
Write-Host "Git commands executed. Check git-output.txt for results."
