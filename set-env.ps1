Set-Location "$env:USERPROFILE\Documents\zanigo"

"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZnBzaHdqb3RvbmVoY3lranF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjM5NjYsImV4cCI6MjA5MTI5OTk2Nn0.xOBGsCTB1G6Xt4v17lQEHtx8Ml3sjxWTc08ZH_J3xB8" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes
"https://tiles.openfreemap.org/styles/liberty" | vercel env add NEXT_PUBLIC_MAP_STYLE_URL production --yes
"https://zanigo.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production --yes

Write-Host "All env vars added."
