// Dark / Light mode toggle
const modeBtn = document.getElementById('mode-toggle');
if(modeBtn){
  let dark = true;
  modeBtn.addEventListener('click', ()=>{
    dark = !dark;
    document.documentElement.style.setProperty('--bg', dark ? '#0f0a0a' : '#faf8f7');
    document.documentElement.style.setProperty('--bg-soft', dark ? '#1a1111' : '#fff');
    document.documentElement.style.setProperty('--text', dark ? '#f2e9e4' : '#1b1b1b');
    document.documentElement.style.setProperty('--muted', dark ? '#c9b7b1' : '#4b4b4b');
    document.documentElement.style.setProperty('--card', dark ? '#140d0d' : '#ffffff');
  });
}

// Search
async function runSearch(){
  const q = (document.getElementById('q')?.value || '').trim().toLowerCase();
  const resultsEl = document.getElementById('results');
  if(!resultsEl) return;
  const res = await fetch('/posts.json').then(r=>r.json()).catch(()=>[]);
  const filtered = res.filter(p => 
    p.title.toLowerCase().includes(q) ||
    (p.category||'').toLowerCase().includes(q) ||
    (p.tags||[]).join(' ').toLowerCase().includes(q) ||
    (p.excerpt||'').toLowerCase().includes(q)
  );
  resultsEl.innerHTML = filtered.map(p => `
    <a class="tile" href="${p.url}">
      <div class="cover"></div>
      <div class="content">
        <div class="meta">${p.category || 'Post'} · ${p.date}</div>
        <h3>${p.title}</h3>
        <p class="meta">${p.excerpt||''}</p>
      </div>
    </a>
  `).join('');
}
window.addEventListener('DOMContentLoaded', ()=>{
  const q = document.getElementById('q');
  if(q){ q.addEventListener('input', runSearch); runSearch(); }
});

// Social share
function share(platform, url, title){
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  let shareUrl = '#';
  if(platform==='twitter'){ shareUrl = `https://twitter.com/intent/tweet?url=${u}&text=${t}`; }
  if(platform==='whatsapp'){ shareUrl = `https://api.whatsapp.com/send?text=${t}%20${u}`; }
  if(platform==='facebook'){ shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${u}`; }
  window.open(shareUrl, '_blank');
}

// Persist theme and reflect icon
(function(){
  const btn = document.getElementById('mode-toggle');
  if(!btn) return;
  let dark = localStorage.getItem('theme') !== 'light';
  function apply(){
    document.documentElement.style.setProperty('--bg', dark ? '#0f0a0a' : '#faf8f7');
    document.documentElement.style.setProperty('--bg-soft', dark ? '#1a1111' : '#ffffff');
    document.documentElement.style.setProperty('--text', dark ? '#f2e9e4' : '#1b1b1b');
    document.documentElement.style.setProperty('--muted', dark ? '#c9b7b1' : '#4b4b4b');
    document.documentElement.style.setProperty('--card', dark ? '#140d0d' : '#ffffff');
    btn.textContent = dark ? '☾' : '☀';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
  apply();
  btn.addEventListener('click', ()=>{ dark = !dark; apply(); });
})();

// Intersection-based reveal
(function(){
  if(!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){ e.target.classList.add('revealed'); obs.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.fade-in, .tile, .card, .hero-card').forEach(el=>obs.observe(el));
})();

// Modal popup (once per session)
(function(){
  const overlay = document.getElementById('welcome-modal');
  const btn = document.getElementById('close-modal');
  if(!overlay || !btn) return;
  if(sessionStorage.getItem('welcomed')) return;
  setTimeout(()=>{
    overlay.classList.add('show');
    overlay.querySelector('.modal').classList.add('show');
  }, 900);
  function close(){
    overlay.classList.remove('show');
  }
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
  btn.addEventListener('click', ()=>{ close(); sessionStorage.setItem('welcomed','1'); });
})();
