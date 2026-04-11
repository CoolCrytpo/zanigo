Set-Location "$env:USERPROFILE\Documents\zanigo"
git add lib/ingestion/extractor.ts
git commit -m "fix: list page detection by DOM containers and link depth grouping"
git push
vercel --yes --prod 2>&1
