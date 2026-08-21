const BUILD_ENDPOINT = 'https://duizgtmbptmlbyipreqg.supabase.co/functions/v1/mela-web';
const SUPABASE_URL = 'https://duizgtmbptmlbyipreqg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_flQNx6AE3_dbPDHfYGNwWQ_7cMSsAng';

const app = document.getElementById('app');
app.innerHTML = `<section class="mela-loader"><div class="mela-mark">M</div><h1>Mela</h1><p>Loading your real workspace…</p></section>`;

const css = `
:root{--purple:#6b46c1;--blue:#3b82f6;--teal:#14b8a6;--mint:#d1fae5;--coral:#fed7d7;--rose:#e11d48;--amber:#f59e0b;--red:#ef4444;--slate:#1e293b;--indigo:#4f46e5;--violet:#7c3aed}
.mela-loader{min-height:100vh;display:grid;place-content:center;text-align:center;background:linear-gradient(135deg,#eef2ff,#ecfeff,#fdf2f8);font-family:system-ui;color:#1e293b}.mela-mark{width:64px;height:64px;margin:auto;border-radius:20px;display:grid;place-items:center;color:#fff;font-size:30px;font-weight:950;background:linear-gradient(135deg,#6b46c1,#ec4899,#14b8a6);box-shadow:0 18px 40px #6b46c155}.mela-loader h1{font-size:38px;margin:14px 0 4px}.mela-loader p{color:#64748b}
.mela-redesign{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;background:#ebf4ff!important;color:#172033!important}.mela-redesign *{box-sizing:border-box}.mela-redesign .top{background:#6b46c1!important;color:#fff!important;border:0!important;box-shadow:0 8px 25px #31206b44}.mela-redesign .top .w{max-width:1280px}.mela-redesign .top .btn{background:#ffffff1c!important;color:#fff!important}.mela-redesign .top .in{border:1px solid #ffffff55!important;background:#fff!important;color:#1e293b!important}.mela-redesign .m{background:linear-gradient(135deg,#14b8a6,#3b82f6,#7c3aed)!important}.mela-redesign .hero{padding:38px 0!important}.mela-redesign .card,.mela-redesign .box{background:#fff!important;border:1px solid #dbe5f0!important;border-radius:22px!important;box-shadow:0 12px 35px #33415512!important}.mela-redesign .hero>.card{border-left:8px solid #7c3aed!important;background:linear-gradient(135deg,#fff,#f5f3ff)!important}.mela-redesign .btn.pri,.mela-redesign .pri{background:linear-gradient(135deg,#14b8a6,#3b82f6)!important;color:#fff!important;border:0!important;box-shadow:0 8px 18px #3b82f633}.mela-redesign .btn{transition:.18s transform,.18s box-shadow}.mela-redesign .btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px #33415522}.mela-redesign .chip{border:1px solid #e2e8f0!important}.mela-redesign .chip:nth-child(1){background:#dbeafe!important;color:#1d4ed8!important}.mela-redesign .chip:nth-child(2){background:#d1fae5!important;color:#047857!important}.mela-redesign .chip:nth-child(3){background:#fed7d7!important;color:#be123c!important}.mela-redesign .box:nth-child(3n+1){border-left:7px solid #3b82f6!important}.mela-redesign .box:nth-child(3n+2){border-left:7px solid #14b8a6!important}.mela-redesign .box:nth-child(3n){border-left:7px solid #f59e0b!important}.mela-redesign .tabs .btn:nth-child(1){border-left:5px solid #3b82f6}.mela-redesign .tabs .btn:nth-child(2){border-left:5px solid #14b8a6}.mela-redesign .tabs .btn:nth-child(3){border-left:5px solid #f59e0b}.mela-redesign .tabs .btn:nth-child(4){border-left:5px solid #ec4899}.mela-redesign .tabs .btn:nth-child(5){border-left:5px solid #06b6d4}.mela-redesign .tabs .btn:nth-child(6){border-left:5px solid #7c3aed}.mela-redesign #c{min-height:300px}.mela-redesign .qitem{border-left-color:#7c3aed!important;background:#fff!important}.mela-redesign .score{color:#6b46c1}.mela-redesign .good{background:#d1fae5!important}.mela-redesign .bad{background:#fed7d7!important}
#role-gate{position:fixed;inset:0;z-index:9999;display:none;place-items:center;background:linear-gradient(135deg,#1e293bee,#4c1d95ee);backdrop-filter:blur(8px);padding:18px;font-family:Inter,system-ui}.role-panel{width:min(760px,100%);background:#fff;border-radius:28px;padding:28px;box-shadow:0 30px 100px #0007}.role-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}.role-head .mark{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;color:#fff;font-weight:950;font-size:23px;background:linear-gradient(135deg,#6b46c1,#ec4899,#14b8a6)}.role-head h2{margin:0;font-size:27px}.role-head p{margin:4px 0;color:#64748b}.role-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.role-card{border:2px solid #e2e8f0;background:#fff;border-radius:18px;padding:17px;text-align:left;cursor:pointer;transition:.18s}.role-card:hover{transform:translateY(-2px);box-shadow:0 12px 25px #33415518}.role-card.selected{border-color:#7c3aed;background:#f5f3ff}.role-icon{font-size:28px}.role-card b{display:block;margin-top:8px}.role-card span{display:block;color:#64748b;font-size:12px;margin-top:3px}.lang-grid{display:flex;gap:7px;flex-wrap:wrap;margin:17px 0}.lang-btn{border:1px solid #cbd5e1;background:#f8fafc;padding:9px 12px;border-radius:999px;cursor:pointer}.lang-btn.selected{background:#6b46c1;color:#fff;border-color:#6b46c1}.role-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px}.role-error{color:#b91c1c;background:#fee2e2;border-radius:12px;padding:10px;font-size:13px;display:none}@media(max-width:650px){.role-grid{grid-template-columns:repeat(2,1fr)}.role-panel{padding:20px}.role-actions{flex-direction:column}.role-actions button{width:100%}}
#role-strip{display:none;position:sticky;top:66px;z-index:4;background:#1e293b;color:#fff;padding:8px 14px;font-size:12px}#role-strip b{color:#d1fae5}#role-strip .role-pill{float:right;border-radius:999px;padding:4px 8px;background:#6b46c1}
`;

const roleDefs={
 student:['🎓','Student','Learn, practice, compete and apply'],
 parent:['👨‍👩‍👧','Parent','Track your children and family opportunities'],
 teacher:['👨‍🏫','Teacher','Teach, create content and support learners'],
 company:['🏢','Company','Recruit, publish vacancies and manage applicants']
};
const langs={en:'English',am:'አማርኛ',om:'Afaan Oromoo',ti:'ትግርኛ',so:'Soomaali',aa:'Qafar af'};

function injectDesign(html){
  const style=`<style>${css}</style>`;
  const gate=`<div id="role-gate"><div class="role-panel"><div class="role-head"><div class="mark">M</div><div><h2>Create your Mela identity</h2><p>Choose your language and account type. Your selection controls your workspace.</p></div></div><div class="role-error" id="role-error"></div><h3>1. Choose language</h3><div class="lang-grid">${Object.entries(langs).map(([k,v])=>`<button class="lang-btn ${k==='en'?'selected':''}" data-lang="${k}">${v}</button>`).join('')}</div><h3>2. Choose account type</h3><div class="role-grid">${Object.entries(roleDefs).map(([k,v])=>`<button class="role-card" data-role="${k}"><div class="role-icon">${v[0]}</div><b>${v[1]}</b><span>${v[2]}</span></button>`).join('')}</div><div class="role-actions"><button class="btn" id="role-cancel">Cancel</button><button class="btn pri" id="role-continue">Continue to registration</button></div></div></div><div id="role-strip"><span>Account workspace: <b id="role-name">Member</b></span><span class="role-pill" id="role-lang">English</span></div>`;
  const compatibility=`<script>(function(){try{if(window.L&&typeof L==='object'){L.aa=['Afar','Qafar af','aa-ET'];}if(window.T&&typeof T==='object'){T.aa=['MELA · QAFAR AF','Kutaa → Barnoota → Boqonnaa → Mata-duree','Gaaffiin Mela af Qafar keessatti ni jira.','Mela bani'];}if(window.NAVTXT&&typeof NAVTXT==='object'){NAVTXT.aa={q:'Baankii Gaaffii',learn:'Barnoota',src:'Maddoota Addunyaa',apps:'Iyyannoowwan Koo',access:'Dhaqqabummaa',review:'Gamaaggama Qulqullinaa',ops:'Hojiiwwan',read:'🔊 Narrate'};}var s=document.getElementById('lang');if(s&&!Array.from(s.options).some(function(o){return o.value==='aa';})){var o=document.createElement('option');o.value='aa';o.textContent='Qafar af';s.appendChild(o);}}catch(e){console.warn('Afar localization compatibility patch',e);}})();</script>`;
  return html.replace('</head>',style+'</head>').replace('<body>', '<body>'+gate).replace('</body>',compatibility+'</body>');
}

async function loadMela(){
  const response=await fetch(BUILD_ENDPOINT,{cache:'no-store',headers:{Accept:'text/plain'}});
  if(!response.ok) throw new Error(`Mela build service returned HTTP ${response.status}`);
  let html=await response.text();
  if(!/^\s*<!doctype html>/i.test(html)||!/<title>\s*Mela/i.test(html)) throw new Error('Unexpected Mela build payload');
  html=injectDesign(html);
  document.open();document.write(html);document.close();
}

function supaFetch(path,options={}){return fetch(SUPABASE_URL+path,{...options,headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',...(options.headers||{})}})}
async function signUpReal(email,password,fullName,role,language){
  const r=await supaFetch('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{full_name:fullName,role,preferred_language:language}})});
  const data=await r.json();if(!r.ok)throw new Error(data.msg||data.error_description||data.message||'Registration failed');
  return data;
}
async function saveProfile(token,userId,fullName,role,language){
  const r=await supaFetch('/rest/v1/profiles?id=eq.'+encodeURIComponent(userId),{method:'PATCH',headers:{Authorization:'Bearer '+token,Prefer:'return=minimal'},body:JSON.stringify({full_name:fullName,role,preferred_language:language,role_selected_at:new Date().toISOString(),updated_at:new Date().toISOString()})});
  if(!r.ok){const t=await r.text();throw new Error(t||'Profile role could not be saved');}
}

function wireOnboarding(){
  let chosenRole=null,chosenLang='en';
  const gate=document.getElementById('role-gate');
  const strip=document.getElementById('role-strip');
  const langInput=document.getElementById('lang');
  const open=document.getElementById('open');
  const login=document.getElementById('login');
  const signup=document.getElementById('signup');
  const create=document.getElementById('create');
  const newBtn=document.getElementById('new');
  if(langInput){if(!Array.from(langInput.options).some(o=>o.value==='aa')){langInput.insertAdjacentHTML('beforeend','<option value="aa">Qafar af</option>');}}
  if(langInput)langInput.innerHTML=Object.entries(langs).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
  const saved=JSON.parse(localStorage.getItem('mela_identity')||'null');
  if(saved&&saved.role){strip.style.display='block';document.getElementById('role-name').textContent=roleDefs[saved.role]?.[1]||saved.role;document.getElementById('role-lang').textContent=langs[saved.lang]||saved.lang||'English';}
  open?.addEventListener('click',()=>{login?.classList.remove('hide');open?.classList.add('hide');login?.scrollIntoView({behavior:'smooth'})});
  newBtn?.addEventListener('click',()=>{gate.style.display='grid';});
  document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.lang-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');chosenLang=b.dataset.lang;}));
  document.querySelectorAll('.role-card').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.role-card').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');chosenRole=b.dataset.role;}));
  document.getElementById('role-cancel')?.addEventListener('click',()=>gate.style.display='none');
  document.getElementById('role-continue')?.addEventListener('click',()=>{
    const err=document.getElementById('role-error');if(!chosenRole){err.textContent='Select an account type before continuing.';err.style.display='block';return}err.style.display='none';gate.style.display='none';signup?.classList.remove('hide');login?.classList.remove('hide');document.getElementById('sl')&&(document.getElementById('sl').value=langs[chosenLang]);localStorage.setItem('mela_pending_identity',JSON.stringify({role:chosenRole,lang:chosenLang}));signup?.scrollIntoView({behavior:'smooth'});
  });
  create?.addEventListener('click',async(e)=>{
    const pending=JSON.parse(localStorage.getItem('mela_pending_identity')||'null');
    if(!pending?.role){e.preventDefault();e.stopImmediatePropagation();gate.style.display='grid';return;}
    e.preventDefault();e.stopImmediatePropagation();
    const btn=e.currentTarget;btn.disabled=true;btn.textContent='Creating secure account…';
    try{
      const fullName=document.getElementById('nm')?.value.trim();const email=document.getElementById('se')?.value.trim();const password=document.getElementById('sp')?.value;
      if(!fullName||!email||!password||password.length<12)throw new Error('Enter your full name, valid email and a password of at least 12 characters.');
      const data=await signUpReal(email,password,fullName,pending.role,pending.lang);
      if(data.access_token&&data.user?.id)await saveProfile(data.access_token,data.user.id,fullName,pending.role,pending.lang);
      localStorage.setItem('mela_identity',JSON.stringify({role:pending.role,lang:pending.lang}));localStorage.removeItem('mela_pending_identity');
      const msg=document.getElementById('msg');if(msg){msg.className='chip ok';msg.textContent=data.session?'Account created. Your '+roleDefs[pending.role][1]+' workspace is ready.':'Account created. Check your email to verify before signing in.';}
      signup?.classList.add('hide');
      if(data.session){setTimeout(()=>location.reload(),700);}
    }catch(err){const msg=document.getElementById('msg');if(msg){msg.className='chip warn';msg.textContent=err.message||String(err)}btn.disabled=false;btn.textContent='Create';}
  },true);
  langInput?.addEventListener('change',()=>{const v=langInput.value;localStorage.setItem('mela_ui_language',v);});
}

loadMela().then(()=>setTimeout(wireOnboarding,250)).catch(error=>{console.error('Mela bootstrap failed',error);app.innerHTML=`<section class="mela-loader"><div class="mela-mark">M</div><h1>Mela preview unavailable</h1><p>${String(error?.message||error).replace(/[<>&]/g,'')}</p></section>`;});
