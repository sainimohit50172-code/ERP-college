$code = Get-Content -Path 'src/pages/TimetableManagementPage.jsx' -Raw
$lines = $code -split "\r?\n"
$counts = @{ '(':0; ')':0; '{':0; '}':0; '[':0; ']':0 }
for ($i=520; $i -lt 847; $i++) {
  $line = $lines[$i]
  foreach ($ch in $line.ToCharArray()) {
    if ($counts.ContainsKey($ch)) { $counts[$ch] += 1 }
  }
}
Write-Output "counts: $($counts | ForEach-Object { "$($_.Key)=$($_.Value)" } -join ', ')"
