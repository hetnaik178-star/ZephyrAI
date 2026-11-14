/**
 * Zephyr Theme Engine — Multi-theme system with particle sync
 */
const ZephyrThemes = {
  current: 'cosmic-purple',
  widgetOpen: false,
  themes: {
    'cosmic-purple': {
      name:'Cosmic Purple',icon:'🔮',badge:'DEFAULT',
      primary:[139,92,246],accent:[251,191,36],secondary:[236,72,153],
      bg:'#08080c',bgSec:'#0e0e14',bgTert:'#16161e',bgElev:'#1e1e28',
      glass:'rgba(14,14,20,0.75)',glassHover:'rgba(22,22,30,0.85)',
      textPri:'#f0f0f3',textSec:'#9898a6',textTert:'#5c5c6e',
      orb1:'rgba(139,92,246,0.08)',orb2:'rgba(251,191,36,0.05)',
      starColor:'200,190,255',cursorGlow:'rgba(139,92,246,',
      lineColor:'rgba(139,92,246,',lineHover:'rgba(236,72,153,',
      scrollThumb:['#8b5cf6','#ec4899'],
      particles:[{r:139,g:92,b:246},{r:167,g:139,b:250},{r:196,g:181,b:253},{r:6,g:182,b:212},{r:59,g:130,b:246},{r:251,g:191,b:36},{r:236,g:72,b:153},{r:255,g:255,b:255}],
      nebula:[{r:139,g:92,b:246},{r:88,g:28,b:135},{r:6,g:182,b:212},{r:30,g:58,b:138},{r:124,g:58,b:237},{r:236,g:72,b:153}]
    },
    'aurora-borealis': {
      name:'Aurora Borealis',icon:'🌌',badge:'NATURE',
      primary:[16,185,129],accent:[6,182,212],secondary:[52,211,153],
      bg:'#050d0a',bgSec:'#0a1612',bgTert:'#0f1f1a',bgElev:'#162b24',
      glass:'rgba(10,22,18,0.78)',glassHover:'rgba(15,31,26,0.85)',
      textPri:'#e8f5f0',textSec:'#7fb8a4',textTert:'#4a7d6b',
      orb1:'rgba(16,185,129,0.08)',orb2:'rgba(6,182,212,0.05)',
      starColor:'180,240,220',cursorGlow:'rgba(16,185,129,',
      lineColor:'rgba(16,185,129,',lineHover:'rgba(6,182,212,',
      scrollThumb:['#10b981','#06b6d4'],
      particles:[{r:16,g:185,b:129},{r:52,g:211,b:153},{r:110,g:231,b:183},{r:6,g:182,b:212},{r:34,g:211,b:238},{r:167,g:243,b:208},{r:255,g:255,b:255},{r:153,g:246,b:228}],
      nebula:[{r:16,g:185,b:129},{r:6,g:95,b:70},{r:6,g:182,b:212},{r:13,g:148,b:136},{r:52,g:211,b:153},{r:20,g:184,b:166}]
    },
    'sunset-blaze': {
      name:'Sunset Blaze',icon:'🌅',badge:'WARM',
      primary:[249,115,22],accent:[245,158,11],secondary:[239,68,68],
      bg:'#0c0806',bgSec:'#140e0a',bgTert:'#1e1510',bgElev:'#2a1e18',
      glass:'rgba(20,14,10,0.78)',glassHover:'rgba(30,21,16,0.85)',
      textPri:'#fef2e8',textSec:'#c49a78',textTert:'#8a6548',
      orb1:'rgba(249,115,22,0.08)',orb2:'rgba(239,68,68,0.05)',
      starColor:'255,220,180',cursorGlow:'rgba(249,115,22,',
      lineColor:'rgba(249,115,22,',lineHover:'rgba(239,68,68,',
      scrollThumb:['#f97316','#ef4444'],
      particles:[{r:249,g:115,b:22},{r:245,g:158,b:11},{r:252,g:211,b:77},{r:239,g:68,b:68},{r:251,g:146,b:60},{r:253,g:186,b:116},{r:255,g:255,b:255},{r:220,g:38,b:38}],
      nebula:[{r:249,g:115,b:22},{r:180,g:52,b:8},{r:239,g:68,b:68},{r:245,g:158,b:11},{r:220,g:38,b:38},{r:251,g:146,b:60}]
    },
    'ocean-depths': {
      name:'Ocean Depths',icon:'🌊',badge:'COOL',
      primary:[37,99,235],accent:[6,182,212],secondary:[99,102,241],
      bg:'#040810',bgSec:'#081020',bgTert:'#0c1830',bgElev:'#122040',
      glass:'rgba(8,16,32,0.80)',glassHover:'rgba(12,24,48,0.85)',
      textPri:'#e0eaff',textSec:'#7a9cc8',textTert:'#4a6a8a',
      orb1:'rgba(37,99,235,0.08)',orb2:'rgba(6,182,212,0.05)',
      starColor:'180,200,255',cursorGlow:'rgba(37,99,235,',
      lineColor:'rgba(37,99,235,',lineHover:'rgba(6,182,212,',
      scrollThumb:['#2563eb','#06b6d4'],
      particles:[{r:37,g:99,b:235},{r:59,g:130,b:246},{r:96,g:165,b:250},{r:6,g:182,b:212},{r:99,g:102,b:241},{r:147,g:197,b:253},{r:255,g:255,b:255},{r:165,g:180,b:252}],
      nebula:[{r:37,g:99,b:235},{r:29,g:78,b:216},{r:6,g:182,b:212},{r:99,g:102,b:241},{r:59,g:130,b:246},{r:30,g:64,b:175}]
    },
    'cherry-blossom': {
      name:'Cherry Blossom',icon:'🌸',badge:'ELEGANT',
      primary:[236,72,153],accent:[244,114,182],secondary:[219,39,119],
      bg:'#0c0609',bgSec:'#140a10',bgTert:'#1e1018',bgElev:'#2a1822',
      glass:'rgba(20,10,16,0.78)',glassHover:'rgba(30,16,24,0.85)',
      textPri:'#fce7f3',textSec:'#c4789a',textTert:'#8a4a68',
      orb1:'rgba(236,72,153,0.08)',orb2:'rgba(244,114,182,0.05)',
      starColor:'255,200,220',cursorGlow:'rgba(236,72,153,',
      lineColor:'rgba(236,72,153,',lineHover:'rgba(244,114,182,',
      scrollThumb:['#ec4899','#f472b6'],
      particles:[{r:236,g:72,b:153},{r:244,g:114,b:182},{r:251,g:146,b:60},{r:219,g:39,b:119},{r:249,g:168,b:212},{r:252,g:231,b:243},{r:255,g:255,b:255},{r:253,g:164,b:175}],
      nebula:[{r:236,g:72,b:153},{r:190,g:24,b:93},{r:244,g:114,b:182},{r:219,g:39,b:119},{r:249,g:168,b:212},{r:157,g:23,b:77}]
    },
    'neon-cyberpunk': {
      name:'Neon Cyberpunk',icon:'⚡',badge:'BOLD',
      primary:[0,255,136],accent:[255,0,128],secondary:[0,212,255],
      bg:'#050508',bgSec:'#0a0a12',bgTert:'#10101c',bgElev:'#181828',
      glass:'rgba(10,10,18,0.82)',glassHover:'rgba(16,16,28,0.88)',
      textPri:'#e0ffe8',textSec:'#80c8a0',textTert:'#508868',
      orb1:'rgba(0,255,136,0.08)',orb2:'rgba(255,0,128,0.05)',
      starColor:'180,255,220',cursorGlow:'rgba(0,255,136,',
      lineColor:'rgba(0,255,136,',lineHover:'rgba(255,0,128,',
      scrollThumb:['#00ff88','#ff0080'],
      particles:[{r:0,g:255,b:136},{r:255,g:0,b:128},{r:0,g:212,b:255},{r:0,g:255,b:200},{r:180,g:0,b:255},{r:255,g:255,b:0},{r:255,g:255,b:255},{r:255,g:100,b:200}],
      nebula:[{r:0,g:255,b:136},{r:255,g:0,b:128},{r:0,g:212,b:255},{r:0,g:100,b:60},{r:100,g:0,b:60},{r:180,g:0,b:255}]
    },
    'golden-luxe': {
      name:'Golden Luxe',icon:'👑',badge:'PREMIUM',
      primary:[245,158,11],accent:[217,119,6],secondary:[252,211,77],
      bg:'#0a0804',bgSec:'#12100a',bgTert:'#1c1810',bgElev:'#282018',
      glass:'rgba(18,16,10,0.80)',glassHover:'rgba(28,24,16,0.85)',
      textPri:'#fef9e7',textSec:'#c8a860',textTert:'#8a7440',
      orb1:'rgba(245,158,11,0.08)',orb2:'rgba(217,119,6,0.05)',
      starColor:'255,235,180',cursorGlow:'rgba(245,158,11,',
      lineColor:'rgba(245,158,11,',lineHover:'rgba(252,211,77,',
      scrollThumb:['#f59e0b','#fbbf24'],
      particles:[{r:245,g:158,b:11},{r:252,g:211,b:77},{r:253,g:230,b:138},{r:217,g:119,b:6},{r:251,g:191,b:36},{r:254,g:240,b:138},{r:255,g:255,b:255},{r:202,g:138,b:4}],
      nebula:[{r:245,g:158,b:11},{r:180,g:83,b:9},{r:252,g:211,b:77},{r:217,g:119,b:6},{r:251,g:191,b:36},{r:146,g:64,b:14}]
    },
    'frost-crystal': {
      name:'Frost Crystal',icon:'❄️',badge:'CLEAN',
      primary:[125,211,252],accent:[186,230,253],secondary:[56,189,248],
      bg:'#060a10',bgSec:'#0a1018',bgTert:'#101820',bgElev:'#182030',
      glass:'rgba(10,16,24,0.80)',glassHover:'rgba(16,24,32,0.85)',
      textPri:'#e0f2fe',textSec:'#7aaccc',textTert:'#4a7a9a',
      orb1:'rgba(125,211,252,0.08)',orb2:'rgba(56,189,248,0.05)',
      starColor:'200,230,255',cursorGlow:'rgba(125,211,252,',
      lineColor:'rgba(125,211,252,',lineHover:'rgba(56,189,248,',
      scrollThumb:['#7dd3fc','#38bdf8'],
      particles:[{r:125,g:211,b:252},{r:186,g:230,b:253},{r:224,g:242,b:254},{r:56,g:189,b:248},{r:14,g:165,b:233},{r:240,g:249,b:255},{r:255,g:255,b:255},{r:186,g:230,b:253}],
      nebula:[{r:125,g:211,b:252},{r:56,g:189,b:248},{r:14,g:165,b:233},{r:2,g:132,b:199},{r:186,g:230,b:253},{r:3,g:105,b:161}]
    },
  },

  init() {
    this.current = localStorage.getItem('zephyr-theme') || 'cosmic-purple';
    this.buildWidget();
    this.applyTheme(this.current, false);
    console.log('🎨 Theme engine loaded:', this.current);
  },

  _tint(rgb, amt) { return `rgb(${rgb.map(c=>Math.round(c+(255-c)*amt)).join(',')})`; },
  _shade(rgb, amt) { return `rgb(${rgb.map(c=>Math.round(c*(1-amt))).join(',')})`; },

  applyTheme(id, animate=true) {
    const t = this.themes[id];
    if (!t) return;
    this.current = id;
    localStorage.setItem('zephyr-theme', id);
    const root = document.documentElement;
    const [pr,pg,pb] = t.primary;
    const [ar,ag,ab] = t.accent;

    // Primary palette
    root.style.setProperty('--primary-50', this._tint(t.primary,0.95));
    root.style.setProperty('--primary-100', this._tint(t.primary,0.9));
    root.style.setProperty('--primary-200', this._tint(t.primary,0.8));
    root.style.setProperty('--primary-300', this._tint(t.primary,0.6));
    root.style.setProperty('--primary-400', this._tint(t.primary,0.4));
    root.style.setProperty('--primary-500', `rgb(${pr},${pg},${pb})`);
    root.style.setProperty('--primary-600', this._shade(t.primary,0.15));
    root.style.setProperty('--primary-700', this._shade(t.primary,0.3));
    root.style.setProperty('--primary-800', this._shade(t.primary,0.45));
    root.style.setProperty('--primary-900', this._shade(t.primary,0.6));
    root.style.setProperty('--accent-400', `rgb(${ar},${ag},${ab})`);
    root.style.setProperty('--accent-500', this._shade(t.accent,0.1));
    root.style.setProperty('--bg-primary', t.bg);
    root.style.setProperty('--bg-secondary', t.bgSec);
    root.style.setProperty('--bg-tertiary', t.bgTert);
    root.style.setProperty('--bg-elevated', t.bgElev);
    root.style.setProperty('--bg-glass', t.glass);
    root.style.setProperty('--bg-glass-hover', t.glassHover);
    root.style.setProperty('--text-primary', t.textPri);
    root.style.setProperty('--text-secondary', t.textSec);
    root.style.setProperty('--text-tertiary', t.textTert);
    root.style.setProperty('--shadow-glow', `0 0 30px rgba(${pr},${pg},${pb},0.15)`);
    document.body.style.background = t.bg;

    // Grid + orbs
    const grid = document.querySelector('.cyber-grid');
    if (grid) grid.style.backgroundImage = `linear-gradient(rgba(${pr},${pg},${pb},0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(${pr},${pg},${pb},0.015) 1px,transparent 1px)`;
    const orb1 = document.querySelector('.holo-orb-1');
    const orb2 = document.querySelector('.holo-orb-2');
    if (orb1) orb1.style.background = `radial-gradient(circle,${t.orb1},transparent 70%)`;
    if (orb2) orb2.style.background = `radial-gradient(circle,${t.orb2},transparent 70%)`;

    // Cursor glow div
    const glow = document.getElementById('cursor-glow');
    if (glow) glow.style.background = `radial-gradient(circle,rgba(${pr},${pg},${pb},0.08) 0%,rgba(${pr},${pg},${pb},0.03) 40%,transparent 70%)`;

    // Logo icon
    const logo = document.querySelector('.logo-icon');
    if (logo) logo.style.boxShadow = `0 0 20px rgba(${pr},${pg},${pb},0.2)`;

    // Welcome icon
    const wIcon = document.querySelector('.welcome-icon');
    if (wIcon) {
      wIcon.style.background = `linear-gradient(135deg,rgb(${pr},${pg},${pb}),${this._shade(t.primary,0.3)})`;
      wIcon.style.boxShadow = `0 0 40px rgba(${pr},${pg},${pb},0.15),0 8px 24px rgba(0,0,0,0.3)`;
    }

    // Welcome title gradient
    const wTitle = document.querySelector('.welcome-title');
    if (wTitle) wTitle.style.background = `linear-gradient(135deg,${t.textPri} 30%,${this._tint(t.primary,0.6)})`;
    if (wTitle) { wTitle.style.webkitBackgroundClip='text'; wTitle.style.webkitTextFillColor='transparent'; wTitle.style.backgroundClip='text'; }

    // New chat button
    const ncBtn = document.querySelector('.btn-new-chat');
    if (ncBtn) {
      ncBtn.style.background = `rgb(${pr},${pg},${pb})`;
      ncBtn.style.boxShadow = `0 2px 8px rgba(${pr},${pg},${pb},0.25)`;
    }

    // Sync particles + scrollbar
    if (typeof ZephyrFX !== 'undefined') this.syncParticles(t);
    this._updateScrollbar(t);

    // Update widget active
    document.querySelectorAll('.zt-card').forEach(c => c.classList.toggle('active', c.dataset.theme === id));

    if (animate) this._flashTransition(t.primary);
  },

  syncParticles(t) {
    if (ZephyrFX.particles) ZephyrFX.particles.forEach((p,i)=>{p.color={...t.particles[i%t.particles.length]};});
    if (ZephyrFX.nebulaClouds) ZephyrFX.nebulaClouds.forEach((c,i)=>{c.color={...t.nebula[i%t.nebula.length]};});
    ZephyrFX._themeColors = {cursorGlow:t.cursorGlow,lineColor:t.lineColor,lineHover:t.lineHover,starColor:t.starColor,primary:t.primary,secondary:t.secondary};
  },

  _updateScrollbar(t) {
    let el=document.getElementById('zt-scrollbar-style');
    if(!el){el=document.createElement('style');el.id='zt-scrollbar-style';document.head.appendChild(el);}
    el.textContent=`::-webkit-scrollbar-thumb{background:linear-gradient(180deg,${t.scrollThumb[0]},${t.scrollThumb[1]},${t.scrollThumb[0]})!important;box-shadow:0 0 6px ${t.scrollThumb[0]}99!important}`;
  },

  _flashTransition(rgb) {
    const f=document.createElement('div');
    f.style.cssText=`position:fixed;inset:0;z-index:99998;pointer-events:none;background:radial-gradient(circle,rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.18),transparent 70%);opacity:1;transition:opacity 0.8s ease`;
    document.body.appendChild(f);
    requestAnimationFrame(()=>f.style.opacity='0');
    setTimeout(()=>f.remove(),900);
  },

  toggleWidget(force) {
    this.widgetOpen = force!==undefined ? force : !this.widgetOpen;
    document.getElementById('zt-panel').classList.toggle('open',this.widgetOpen);
    document.getElementById('zt-toggle').classList.toggle('active',this.widgetOpen);
  },

  buildWidget() {
    // Toggle button
    const btn=document.createElement('button');
    btn.id='zt-toggle';btn.className='zt-toggle';btn.innerHTML='🎨';btn.title='Change Theme';
    document.body.appendChild(btn);
    // Panel
    const panel=document.createElement('div');
    panel.id='zt-panel';panel.className='zt-panel';
    let cards='';
    for(const[id,t] of Object.entries(this.themes)){
      const[r,g,b]=t.primary;const[sr,sg,sb]=t.secondary;const[acr,acg,acb]=t.accent;
      cards+=`<button class="zt-card ${id===this.current?'active':''}" data-theme="${id}">
        <div class="zt-card-preview" style="background:linear-gradient(135deg,rgb(${r},${g},${b}),rgb(${sr},${sg},${sb}))">
          <span class="zt-card-icon">${t.icon}</span>
          <div class="zt-card-dots"><span style="background:rgb(${r},${g},${b})"></span><span style="background:rgb(${acr},${acg},${acb})"></span><span style="background:rgb(${sr},${sg},${sb})"></span></div>
        </div>
        <div class="zt-card-info"><span class="zt-card-name">${t.name}</span><span class="zt-card-badge">${t.badge}</span></div>
      </button>`;
    }
    panel.innerHTML=`<div class="zt-header"><div class="zt-header-left"><span class="zt-header-icon">🎨</span><div><div class="zt-header-title">Theme Studio</div><div class="zt-header-sub">Customize your vibe</div></div></div><button class="zt-close" id="zt-close">✕</button></div><div class="zt-grid">${cards}</div><div class="zt-footer"><span class="zt-footer-text">⚡ Particles & UI sync automatically</span></div>`;
    document.body.appendChild(panel);
    // Events
    btn.addEventListener('click',()=>this.toggleWidget());
    document.getElementById('zt-close').addEventListener('click',()=>this.toggleWidget(false));
    panel.querySelectorAll('.zt-card').forEach(c=>c.addEventListener('click',()=>this.applyTheme(c.dataset.theme)));
    document.addEventListener('click',(e)=>{if(this.widgetOpen&&!panel.contains(e.target)&&e.target!==btn)this.toggleWidget(false);});
  }
};

// Boot
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>ZephyrThemes.init());}
else{ZephyrThemes.init();}
