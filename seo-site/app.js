// app.js — client-side SEO + AEO + accessibility analyzer
(function(){
  'use strict';

  const analyzeBtn = document.getElementById('analyzeBtn');
  const exampleBtn = document.getElementById('exampleBtn');
  const backBtn = document.getElementById('backBtn');
  const htmlInput = document.getElementById('html-input');
  const resultsSection = document.getElementById('results');
  const seoScoreEl = document.getElementById('seo-score');
  const aeoScoreEl = document.getElementById('aeo-score');
  const accScoreEl = document.getElementById('acc-score');
  const recommendationsEl = document.getElementById('recommendations');
  const rawOutput = document.getElementById('raw-output');

  function parseHTML(input){
    // create a DOM parser and element
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    return doc;
  }

  function computeSEO(doc){
    // lightweight checks and weights
    const checks = [];
    let score = 0, total = 0;

    function ok(w) { score += w; total += w; }
    function fail(w) { total += w; }

    // title
    const title = (doc.querySelector('title') || {}).textContent || '';
    if(title && title.length >= 30 && title.length <= 60) ok(15); else fail(15);
    checks.push({k:'title',v:title});

    // meta description
    const desc = (doc.querySelector('meta[name="description"]')||{}).content || '';
    if(desc && desc.length >= 50 && desc.length <= 160) ok(12); else fail(12);
    checks.push({k:'meta_description',v:desc});

    // canonical
    const can = !!doc.querySelector('link[rel="canonical"]');
    if(can) ok(8); else fail(8);
    checks.push({k:'canonical',v:can});

    // structured data
    const jsonld = !!doc.querySelector('script[type="application/ld+json"]');
    if(jsonld) ok(10); else fail(10);
    checks.push({k:'jsonld',v:jsonld});

    // OG tags
    const ogTitle = !!doc.querySelector('meta[property="og:title"]');
    const ogDesc = !!doc.querySelector('meta[property="og:description"]');
    if(ogTitle && ogDesc) ok(8); else fail(8);
    checks.push({k:'og',v:{ogTitle,ogDesc}});

    // internal links
    const anchors = Array.from(doc.querySelectorAll('a[href]'));
    if(anchors.length > 0) ok(5); else fail(5);
    checks.push({k:'links',v:anchors.length});

    // images alt
    const imgs = Array.from(doc.images || []);
    const missingAlts = imgs.filter(i=>!i.alt||i.alt.trim()==='').length;
    if(missingAlts===0) ok(10); else fail(10);
    checks.push({k:'images_missing_alt',v:missingAlts});

    // heading structure
    const h1s = doc.querySelectorAll('h1');
    if(h1s.length===1) ok(10); else fail(10);
    checks.push({k:'h1_count',v:h1s.length});

    const percent = Math.round((score/total)*100);
    return {score:percent, raw:{score,total,checks}};
  }

  function computeAEO(doc){
    // AEO — Answer Engine Optimization: structured content, FAQ, Q&A, schema for QAPage, FAQPage
    let score=0,total=0; const checks=[];
    function ok(w){score+=w; total+=w;} function fail(w){total+=w}

    // presence of FAQPage schema
    const faq = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).some(s=>/FAQPage|QAPage/.test(s.textContent));
    if(faq) ok(30); else fail(30); checks.push({k:'faq_schema',v:faq});

    // headings that look like questions (h2/h3 beginning with 'How','What','Why','Where','When')
    const qheads = Array.from(doc.querySelectorAll('h2,h3')).filter(h=>/^(how|what|why|where|when|who)\b/i.test(h.textContent));
    if(qheads.length>0) ok(20); else fail(20); checks.push({k:'question_headings',v:qheads.length});

    // presence of FAQ markup lists (dt/dd or details/summary)
    const detailCount = doc.querySelectorAll('details, summary, dt, dd').length;
    if(detailCount>0) ok(10); else fail(10); checks.push({k:'faq_markup',v:detailCount});

    const percent = total? Math.round((score/total)*100):0;
    return {score:percent, raw:{score,total,checks}};
  }

  function computeAccessibility(doc){
    let score=0,total=0; const checks=[]; function ok(w){score+=w; total+=w} function fail(w){total+=w}

    // contrast hint: presence of inline or computed colors not possible — check alt and labels
    const imgs = Array.from(doc.images||[]);
    const missingAlt = imgs.filter(i=>!i.alt||i.alt.trim()==='').length;
    if(missingAlt===0) ok(40); else fail(40); checks.push({k:'images_missing_alt',v:missingAlt});

    // form labels
    const inputs = Array.from(doc.querySelectorAll('input,textarea,select')); let labelled=0; inputs.forEach(i=>{ if(i.id && doc.querySelector('label[for="'+i.id+'"]')) labelled++; });
    if(inputs.length===0) { ok(20); checks.push({k:'form_inputs',v:0}); } else { if(labelled===inputs.length) ok(20); else fail(20); checks.push({k:'form_inputs',v:labelled+'/'+inputs.length}); }

    // language attribute
    const hasLang = !!doc.documentElement.getAttribute('lang'); if(hasLang) ok(20); else fail(20); checks.push({k:'html_lang',v:hasLang});

    // headings order: at least one h1
    const h1s = doc.querySelectorAll('h1'); if(h1s.length>=1) ok(20); else fail(20); checks.push({k:'h1',v:h1s.length});

    const percent = Math.round((score/total)*100);
    return {score:percent, raw:{score,total,checks}};
  }

  function renderResults(seo, aeo, acc, doc){
    resultsSection.hidden = false;
    seoScoreEl.textContent = seo.score + '%';
    aeoScoreEl.textContent = aeo.score + '%';
    accScoreEl.textContent = acc.score + '%';

    // breakdowns
    const recs = [];
    recommendationsEl.innerHTML = '';
    rawOutput.textContent = JSON.stringify({seo:seo.raw,aeo:aeo.raw,acc:acc.raw},null,2);

    // collect simple recommendations
    seo.raw.checks.forEach(c=>{ if((c.k==='title' && (!c.v||c.v.length<30)) || (c.k==='meta_description' && (!c.v||c.v.length<50)) || (c.k==='images_missing_alt' && c.v>0) || (c.k==='h1_count' && c.v!==1) ){
      if(c.k==='title') recs.push('Improve the page <title> to be descriptive and ~50–60 characters long.');
      if(c.k==='meta_description') recs.push('Add a meta description of 50–160 characters that summarizes the page.');
      if(c.k==='images_missing_alt') recs.push('Add descriptive alt attributes to images for accessibility and image SEO.');
      if(c.k==='h1_count') recs.push('Ensure a single clear H1 representing the main topic.');
    }});

    aeo.raw.checks.forEach(c=>{ if(c.k==='faq_schema' && !c.v) recs.push('Add FAQPage or QAPage JSON-LD to appear in answer-rich results.'); if(c.k==='question_headings' && c.v===0) recs.push('Add question-style headings (How, What, Why) and short concise answers.'); });

    acc.raw.checks.forEach(c=>{ if(c.k==='html_lang' && !c.v) recs.push('Add lang attribute to <html> (e.g., <html lang="en">).'); if(c.k==='form_inputs' && c.v!=='0' && c.v.split && parseInt(c.v.split('/')[0])<parseInt(c.v.split('/')[1])) recs.push('Ensure all form controls have associated <label for=> elements.'); });

    // dedupe
    const dedup = [...new Set(recs)];
    dedup.forEach(r=>{ const li=document.createElement('li'); li.textContent=r; recommendationsEl.appendChild(li); });
  }

  analyzeBtn.addEventListener('click', ()=>{
    const input = htmlInput.value.trim();
    if(!input){ alert('Paste HTML into the textbox first.'); return; }
    const doc = parseHTML(input);
    const seo = computeSEO(doc);
    const aeo = computeAEO(doc);
    const acc = computeAccessibility(doc);
    renderResults(seo,aeo,acc,doc);
  });

  exampleBtn.addEventListener('click', ()=>{
    const example = `<!doctype html><html lang="en"><head><title>Sample Homestay — Hillside</title><meta name="description" content="Cozy homestay with mountain views"><link rel="canonical" href="https://example.com/"><meta property="og:title" content="Sample Homestay"><script type="application/ld+json">{ "@context":"https://schema.org","@type":"LodgingBusiness","name":"Hillside" }</script></head><body><h1>Hillside Homestay</h1><h2>How to Book</h2><p>Details...</p><img src="img.jpg" alt="mountain view"><form><label for="q">Name</label><input id="q"></form></body></html>`;
    htmlInput.value = example;
  });

  backBtn.addEventListener('click', ()=>{ resultsSection.hidden = true; rawOutput.textContent=''; recommendationsEl.innerHTML=''; htmlInput.value=''; });
})();
