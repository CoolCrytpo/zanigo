Set-Location "$env:USERPROFILE\Documents\zanigo"
git add -A
git commit -m "feat: ingestion module + listing requests (RGPD)"
git push
vercel --yes --prod 2>&1
