SEO + AEO Audit Tool

This is a small client-side web tool that analyzes pasted HTML and produces:
- SEO score (title, meta description, canonical, OG, images alt, headings)
- AEO score (Answer Engine Optimization — presence of FAQ/Q&A schema and question headings)
- Accessibility score (alt attributes, form labels, lang attribute, H1)

Usage
1. Open `seo-site/index.html` in a browser.
2. Paste the HTML of the page you want to analyze (you can paste the whole page or only the <head> and key content).
3. Click "Analyze". The results panel will show scores, recommendations and raw findings.

Notes
- This runs entirely in the browser and does not send data anywhere.
- For checking remote URLs (fetching HTML from another domain), you'll need a server-side proxy because of CORS; this tool is intentionally local-only.

Extensions
- Add a server endpoint to fetch remote pages (requires careful sanitization and CORS handling).
- Store historical audits in a small SQLite or JSON store on a server.
- Integrate with Google Search Console API to pull query and ranking data (requires oAuth and server credentials).