// seo.js — in-browser SEO auditor
// Run by clicking the "Run SEO Audit" button in the page
(function(){
  'use strict';

  function scoreItem(ok, weight){
    return ok ? weight : 0;
  }

  function getMeta(name){
    const el = document.querySelector(`meta[name="${name}"]`);
    return el ? el.getAttribute('content') || '' : '';
  }

  function getMetaProperty(prop){
    const el = document.querySelector(`meta[property="${prop}"]`);
    return el ? el.getAttribute('content') || '' : '';
  }

  function hasJSONLD(){
    return !!document.querySelector('script[type="application/ld+json"]');
  }

  function countImagesMissingAlt(){
    const imgs = Array.from(document.images);
    return imgs.filter(i => !i.alt || i.alt.trim() === '').length;
  }

  function computeSeo(){
    const results = [];
    let totalWeight = 0;
    let score = 0;

    // 1. Title tag
    const title = document.title || '';
    const titleOk = title.length >= 30 && title.length <= 60;
    results.push({key:'title', ok: !!title, value: title, note: `${title.length} chars`, weight: 10});
    score += scoreItem(!!title,10); totalWeight += 10;
    // bonus for ideal length
    if(titleOk){ score += 5; totalWeight += 5; } else { totalWeight += 5; }

    // 2. Meta description
    const desc = getMeta('description');
    const descLen = desc ? desc.length : 0;
    const descOk = descLen >= 50 && descLen <= 160;
    results.push({key:'meta_description', ok: !!desc, value: desc, note: `${descLen} chars`, weight: 15});
    score += scoreItem(!!desc,15); totalWeight += 15;
    if(descOk){ score += 5; totalWeight +=5; } else { totalWeight +=5; }

    // 3. Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    results.push({key:'canonical', ok: !!canonical, value: canonical ? canonical.href : '', weight:8});
    score += scoreItem(!!canonical,8); totalWeight +=8;

    // 4. Viewport (mobile friendly)
    const viewport = document.querySelector('meta[name="viewport"]');
    results.push({key:'viewport', ok: !!viewport, value: viewport ? viewport.content : '', weight:8});
    score += scoreItem(!!viewport,8); totalWeight +=8;

    // 5. Robots meta
    const robots = getMeta('robots');
    results.push({key:'robots', ok: !!robots, value: robots, weight:5});
    score += scoreItem(!!robots,5); totalWeight +=5;

    // 6. Open Graph tags (og:title & og:description & og:image)
    const ogTitle = getMetaProperty('og:title');
    const ogDesc = getMetaProperty('og:description');
    const ogImage = getMetaProperty('og:image');
    const ogOk = ogTitle && ogDesc;
    results.push({key:'open_graph', ok: ogOk, value: {ogTitle,ogDesc,ogImage}, weight:8});
    score += scoreItem(ogOk,8); totalWeight +=8;

    // 7. H1 presence and count
    const h1s = document.getElementsByTagName('h1');
    const h1count = h1s.length;
    results.push({key:'h1', ok: h1count>=1, value: h1count, note: h1count>1? 'Multiple H1s' : 'OK', weight:7});
    score += scoreItem(h1count>=1 && h1count<=2,7); totalWeight +=7;

    // 8. Images alt attributes
    const imgsMissing = countImagesMissingAlt();
    const imgsTotal = document.images.length;
    results.push({key:'images_alt', ok: imgsMissing===0, value: `${imgsTotal} images, ${imgsMissing} missing alt`, weight:8});
    score += scoreItem(imgsMissing===0,8); totalWeight +=8;

    // 9. Structured data JSON-LD
    const jsonld = hasJSONLD();
    results.push({key:'jsonld', ok: jsonld, value: jsonld ? 'present' : 'absent', weight:6});
    score += scoreItem(jsonld,6); totalWeight +=6;

    // 10. HTTPS check (if canonical or page loaded over HTTPS)
    const usingHTTPS = location.protocol === 'https:' || (canonical && canonical.href && canonical.href.startsWith('https:'));
    results.push({key:'https', ok: usingHTTPS, value: location.protocol, weight:5});
    score += scoreItem(usingHTTPS,5); totalWeight +=5;

    // 11. Link counts (internal vs external)
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const internal = anchors.filter(a => a.hostname === location.hostname).length;
    const external = anchors.length - internal;
    results.push({key:'links', ok: true, value: {internal, external}, weight:3});
    totalWeight +=3; // neutral

    // 12. Performance hint (navigation timing)
    let perfNote = 'n/a';
    let perfScore = 0;
    if(window.performance && performance.timing){
      const timing = performance.timing;
      const loadTime = (timing.loadEventEnd && timing.navigationStart) ? (timing.loadEventEnd - timing.navigationStart) : null;
      perfNote = loadTime ? `${Math.round(loadTime)} ms` : 'unavailable';
      if(loadTime && loadTime < 2000){ perfScore = 3; }
      else if(loadTime && loadTime < 4000){ perfScore = 2; }
      else if(loadTime){ perfScore = 1; }
    }
    results.push({key:'performance', ok: perfScore>0, value: perfNote, weight:3});
    score += perfScore; totalWeight +=3; // performance contributes up to 3 points

    // Compute percentage
    const percent = Math.round((score / totalWeight) * 100);

    return {score, totalWeight, percent, results};
  }

  function renderResults(report){
    const container = document.getElementById('seo-results');
    if(!container) return;

    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'seo-summary';
    header.innerHTML = `<h3>SEO Audit Score: <span class="seo-score">${report.percent}%</span></h3>
      <p>Score: ${report.score} / ${report.totalWeight} — quick checks for on-page SEO, social and accessibility.</p>`;
    container.appendChild(header);

    const list = document.createElement('div');
    list.className = 'seo-list';

    report.results.forEach(r => {
      const item = document.createElement('div');
      item.className = 'seo-item ' + (r.ok ? 'ok' : 'warn');
      const title = document.createElement('div');
      title.className = 'seo-item-title';
      title.textContent = r.key.replace(/_/g,' ');

      const details = document.createElement('div');
      details.className = 'seo-item-detail';
      details.textContent = typeof r.value === 'string' ? r.value : JSON.stringify(r.value);

      if(r.note) {
        const note = document.createElement('div');
        note.className = 'seo-item-note';
        note.textContent = r.note;
        details.appendChild(note);
      }

      item.appendChild(title);
      item.appendChild(details);
      list.appendChild(item);
    });

    container.appendChild(list);

    // Recommendations
    const rec = document.createElement('div');
    rec.className = 'seo-rec';
    rec.innerHTML = `<h4>Recommendations</h4>`;

    const ul = document.createElement('ul');
    // build recommendations from failed checks
    report.results.forEach(r => {
      if(!r.ok){
        let msg = '';
        switch(r.key){
          case 'title': msg = 'Add a concise title (50–60 chars) describing the page.'; break;
          case 'meta_description': msg = 'Add a meta description (50–160 chars) that summarizes the page.'; break;
          case 'canonical': msg = 'Add a <link rel="canonical"> tag to prevent duplicate content issues.'; break;
          case 'viewport': msg = 'Add a mobile viewport meta tag for mobile friendliness.'; break;
          case 'robots': msg = 'Consider adding a robots meta tag to control crawling (e.g., index, follow).'; break;
          case 'open_graph': msg = 'Add Open Graph meta tags (og:title, og:description, og:image) for better social sharing.'; break;
          case 'h1': msg = 'Ensure there is a single clear H1 on each page that reflects the main topic.'; break;
          case 'images_alt': msg = 'Add descriptive alt attributes to images for accessibility and SEO.'; break;
          case 'jsonld': msg = 'Add structured data (JSON-LD) for business, product or lodging to improve rich results.'; break;
          case 'https': msg = 'Serve the site over HTTPS to improve security and ranking.'; break;
          case 'performance': msg = 'Improve page load performance (optimize images, reduce blocking scripts).'; break;
          default: msg = 'Review this item for improvement.';
        }
        const li = document.createElement('li');
        li.textContent = msg;
        ul.appendChild(li);
      }
    });

    if(ul.children.length === 0){
      const okMsg = document.createElement('p');
      okMsg.textContent = 'Great! No immediate issues found in the quick checks.';
      rec.appendChild(okMsg);
    } else {
      rec.appendChild(ul);
    }

    container.appendChild(rec);

    // Add timestamp
    const footer = document.createElement('div');
    footer.className = 'seo-footer';
    footer.textContent = 'Audit run at ' + (new Date()).toLocaleString();
    container.appendChild(footer);
  }

  // Hook button
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('run-seo');
    if(!btn) return;
    btn.addEventListener('click', function(){
      btn.disabled = true;
      btn.textContent = 'Running audit...';
      setTimeout(() => {
        const report = computeSeo();
        renderResults(report);
        btn.disabled = false;
        btn.textContent = 'Run SEO Audit';
      }, 250);
    });
  });
})();
