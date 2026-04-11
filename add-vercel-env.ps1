$path = [System.IO.Path]::Combine($env:USERPROFILE, 'Documents', 'zanigo')
Set-Location $path

$vars = @{
  "DATABASE_URL"                  = "postgresql://postgres.cbfpshwjotonehcykjqt:ZmR3rf8an4FJywZi@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
  "NEXT_PUBLIC_SUPABASE_URL"      = "https://cbfpshwjotonehcykjqt.supabase.co"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZnBzaHdqb3RvbmVoY3lranF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjM5NjYsImV4cCI6MjA5MTI5OTk2Nn0.xOBGsCTB1G6Xt4v17lQEHtx8Ml3sjxWTc08ZH_J3xB8"
  "NEXT_PUBLIC_MAP_STYLE_URL"     = "https://tiles.openfreemap.org/styles/liberty"
  "NEXT_PUBLIC_APP_URL"           = "https://zanigo.vercel.app"
}

# Remove existing and re-add cleanly
foreach ($key in $vars.Keys) {
  $tmpFile = [System.IO.Path]::GetTempFileName()
  [System.IO.File]::WriteAllText($tmpFile, $vars[$key])
  Get-Content $tmpFile | vercel env add $key production --yes 2>&1
  Remove-Item $tmpFile
}

Write-Host "Done."
