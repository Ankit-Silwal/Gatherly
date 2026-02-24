#!/usr/bin/env pwsh
# kill-port-3000.ps1
# Kills any process using port 3000 on Windows

try {
    $proc = Get-NetTCPConnection -LocalPort 3000 -ErrorAction Stop | Select-Object -First 1
    if ($proc) {
        $pid = $proc.OwningProcess
        Stop-Process -Id $pid -Force
        Write-Host "Killed process $pid using port 3000."
    } else {
        Write-Host "No process found using port 3000."
    }
} catch {
    Write-Host "No process found using port 3000 or insufficient permissions."
}