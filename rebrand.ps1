$files = Get-ChildItem -Path . -Recurse -Include *.tsx,*.ts,*.jsx,*.js,*.json,*.md,*.sql,*.txt,*.html,*.css -File | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\\.next\\' }

$count = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    
    $content = $content -replace 'skyline-logo\.png','magma-logo.png'
    $content = $content -replace 'skyline-icon\.png','magma-flame.png'
    $content = $content -replace 'Magma Cheats','Skyline Cheats'
    $content = $content -replace 'Magma Cheat','Skyline Cheat'
    $content = $content -replace 'Magma Store','Skyline Store'
    $content = $content -replace 'Magma <','Skyline <'
    $content = $content -replace 'magmacheats\.com','skylinecheats.org'
    $content = $content -replace 'magmacheats\.cc','skylinecheats.org'
    $content = $content -replace 'discord\.gg/magmacheats','discord.gg/skylineeggs'
    $content = $content -replace '@magmacheats','@skylinecheats'
    $content = $content -replace '@magma\.local','@skyline.local'
    $content = $content -replace "provider: 'Magma'","provider: 'Skyline'"
    $content = $content -replace "Provider='Magma'","Provider='Skyline'"
    $content = $content -replace "site_name='Magma","site_name='Skyline"
    $content = $content -replace '#dc2626','#2563eb'
    $content = $content -replace '#ef4444','#3b82f6'
    $content = $content -replace '#991b1b','#1e40af'
    $content = $content -replace 'red-600','blue-600'
    $content = $content -replace 'red-700','blue-700'
    $content = $content -replace 'red-800','blue-800'
    $content = $content -replace 'red-500','blue-500'
    $content = $content -replace 'red-400','blue-400'
    $content = $content -replace 'red-300','blue-300'
    $content = $content -replace 'red-200','blue-200'
    $content = $content -replace 'red-100','blue-100'
    $content = $content -replace 'red-50','blue-50'
    $content = $content -replace 'red-900','blue-900'
    $content = $content -replace 'rgba\(220,38,38','rgba(37,99,235'
    $content = $content -replace 'rgba\(239,68,68','rgba(59,130,246'
    $content = $content -replace 'rgba\(153,27,27','rgba(30,64,175'
    $content = $content -replace 'rgb\(220,38,38','rgb(37,99,235'
    $content = $content -replace 'text-red-','text-blue-'
    $content = $content -replace 'bg-red-','bg-blue-'
    $content = $content -replace 'border-red-','border-blue-'
    $content = $content -replace 'from-red-','from-blue-'
    $content = $content -replace 'to-red-','to-blue-'
    $content = $content -replace 'via-red-','via-blue-'
    $content = $content -replace 'hover:text-red-','hover:text-blue-'
    $content = $content -replace 'hover:bg-red-','hover:bg-blue-'
    $content = $content -replace 'hover:border-red-','hover:border-blue-'
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($file.FullName)"
        $count++
    }
}

Write-Host "`nTotal files updated: $count"
