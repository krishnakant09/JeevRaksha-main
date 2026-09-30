<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Pashu Rakshak – Prototype</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;800&display=swap">
<style>
:root{--bg:#EEF2EA;--card:#fff;--ink:#16261B;--mut:#5B6B5F;--g:#2E7D46;--gl:#DCEFE1;--y:#E8A317;--yl:#FBEFCF;--r:#C8372D;--rl:#F8DAD6;--line:#D5DDD0;--phone:#16261B;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0F1A12;--card:#19271D;--ink:#EAF2EA;--mut:#9DB0A2;--gl:#1E3D28;--yl:#3D3212;--rl:#45201D;--line:#2A3D2F;--phone:#050A06}}
:root[data-theme="dark"]{--bg:#0F1A12;--card:#19271D;--ink:#EAF2EA;--mut:#9DB0A2;--gl:#1E3D28;--yl:#3D3212;--rl:#45201D;--line:#2A3D2F;--phone:#050A06}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Mukta','Noto Sans Devanagari',system-ui,sans-serif;font-size:17px;line-height:1.35}
button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}
button:focus-visible{outline:3px solid var(--y);outline-offset:2px}
.top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:12px 18px;background:var(--g);color:#fff}
.top h1{margin:0;font-size:22px;font-weight:800}
.tabs{display:flex;gap:6px}
.tabs button{padding:8px 16px;border-radius:99px;background:rgba(255,255,255,.18);color:#fff;font-weight:600}
.tabs button.on{background:#fff;color:var(--g)}
.lang{padding:6px 12px;border:2px solid #fff;border-radius:8px;color:#fff;font-weight:600}
.note{max-width:900px;margin:12px auto 0;padding:0 18px;color:var(--mut);font-size:15px}
.stage{display:flex;justify-content:center;padding:16px 12px 40px}
.phone{width:375px;max-width:100%;height:700px;background:var(--card);border:8px solid var(--phone);border-radius:34px;display:flex;flex-direction:column;overflow:hidden;position:relative}
.scr{flex:1;overflow-y:auto;padding:14px}
.nav{display:flex;border-top:1px solid var(--line);background:var(--card)}
.nav button{flex:1;padding:8px 0 6px;font-size:13px;color:var(--mut);display:flex;flex-direction:column;align-items:center}
.nav button b{font-size:22px;font-weight:400}
.nav button.on{color:var(--g);font-weight:800}
h2{font-size:22px;margin:4px 0 10px;font-weight:800}
.hello{display:flex;justify-content:space-between;align-items:center}
.mic{width:48px;height:48px;border-radius:50%;background:var(--y);font-size:22px}
.sos{width:100%;margin:12px 0;padding:18px;border-radius:18px;background:var(--r);color:#fff;font-size:22px;font-weight:800;text-align:left;display:flex;gap:12px;align-items:center}
.sos small{display:block;font-size:14px;font-weight:400;opacity:.9}
.row{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}
.an{min-width:130px;background:var(--bg);border-radius:14px;padding:10px;border-top:6px solid var(--g)}
.an.y{border-color:var(--y)}.an.r{border-color:var(--r)}
.an .e{font-size:34px}.an small{color:var(--mut);display:block}
.task{display:flex;gap:10px;align-items:center;padding:12px;background:var(--bg);border-radius:12px;margin-bottom:8px}
.task .e{font-size:26px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sym{padding:16px 6px;border-radius:16px;background:var(--bg);border:3px solid transparent;font-weight:600;text-align:center}
.sym .e{display:block;font-size:38px}
.sym.on{border-color:var(--g);background:var(--gl)}
.btn{width:100%;padding:15px;border-radius:14px;background:var(--g);color:#fff;font-weight:800;font-size:18px;margin-top:10px}
.btn.alt{background:var(--bg);color:var(--ink);border:2px solid var(--line)}
.btn.no{background:var(--rl);color:var(--r)}
.btn[disabled]{opacity:.4}
.back{color:var(--g);font-weight:600;margin-bottom:4px}
.pill{display:inline-block;padding:3px 10px;border-radius:99px;font-size:14px;font-weight:600}
.p-r{background:var(--rl);color:var(--r)}.p-y{background:var(--yl);color:#8A5E00}.p-g{background:var(--gl);color:var(--g)}
.res{padding:14px;border-radius:16px;margin:8px 0}
.steps{list-style:none;padding:0;margin:14px 0}
.steps li{display:flex;gap:12px;align-items:center;padding:10px 0;color:var(--mut)}
.steps i{width:30px;height:30px;border-radius:50%;background:var(--line);display:grid;place-items:center;font-style:normal;font-weight:800;color:#fff}
.steps li.done{color:var(--ink)}.steps li.done i{background:var(--g)}
.card{background:var(--bg);border-radius:14px;padding:12px;margin-bottom:10px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.chips button{padding:10px 14px;border-radius:99px;background:var(--bg);border:2px solid var(--line);font-weight:600}
.chips button.on{background:var(--gl);border-color:var(--g)}
.toggle{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--gl);border-radius:12px;margin-bottom:10px;font-weight:600}
.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:12px 20px;border-radius:12px;font-weight:600;z-index:9;max-width:90%;text-align:center}
.adm{width:100%;max-width:1000px;padding:0 6px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:14px}
.stat{background:var(--card);border-radius:14px;padding:14px;border-left:6px solid var(--g)}
.stat b{font-size:32px;display:block;line-height:1}
.stat span{color:var(--mut);font-size:14px}
.cols{display:grid;grid-template-columns:1.2fr 1fr;gap:14px}
@media(max-width:760px){.cols{grid-template-columns:1fr}}
.panel{background:var(--card);border-radius:14px;padding:14px;overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:15px}
th,td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--line);white-space:nowrap}
.alert{display:flex;gap:10px;align-items:center;padding:10px;border-radius:10px;background:var(--rl);margin-bottom:8px;font-size:15px}
.alert.y{background:var(--yl)}
.sm{padding:8px 14px;border-radius:10px;background:var(--g);color:#fff;font-weight:600;font-size:15px}
</style>
</head>
<body>
<div class="top">
  <h1>🐄 Pashu Rakshak</h1>
  <div class="tabs" id="tabs"></div>
  <button class="lang" id="lang" aria-label="Change language">हि / EN</button>
</div>
<p class="note" id="note"></p>
<div class="stage" id="stage"></div>
<script>
var S={role:'farmer',lang:'hi',screen:'home',sym:null,cid:null,treat:{},
cases:[
{id:1,animal:'Kali (Buffalo)',sym:'Fever',villa:'Sultanpur',urg:0,st:'new',km:4,owner:'Suresh'},
{id:2,animal:'Bholu (Goat)',sym:'Limping',villa:'Rampur',urg:2,st:'new',km:9,owner:'Geeta'}]};
var SYM=[['🍽️','खाना बंद','Not eating',1,'साफ पानी दें, हरा चारा रखें। 1 दिन में सुधार न हो तो डॉक्टर को दिखाएं।','Offer clean water and green fodder. See a vet if no change in a day.'],
['🌡️','बुखार','Fever',0,'छाया में रखें, ठंडा पानी दें। तुरंत डॉक्टर को बुलाएं।','Keep in shade, give cool water. Call a vet right away.'],
['🦶','लंगड़ाना','Limping',2,'खुर साफ करें, नरम जगह पर बिठाएं। 2 दिन में न ठीक हो तो दिखाएं।','Clean the hoof, rest on soft ground. Get it checked if no better in 2 days.'],
['💧','पतला गोबर','Loose motion',1,'ORS घोल पिलाएं और पानी की कमी रोकें।','Give ORS solution and prevent dehydration.'],
['🥛','दूध कम','Less milk',2,'चारा और पानी की मात्रा जांचें, थन की जांच करें।','Check feed and water, and examine the udder.'],
['🩹','घाव','Wound',1,'साफ पानी से धोएं, गंदगी से बचाएं, घाव ढकें।','Wash with clean water, keep it covered and dirt-free.']];
var URG=[['🚨','अभी डॉक्टर चाहिए','Emergency: need a vet now','p-r','var(--rl)'],['⚠️','आज डॉक्टर को दिखाएं','See a vet today','p-y','var(--yl)'],['✅','घर पर देखभाल करें','Home care is enough','p-g','var(--gl)']];
var STL=[['new','अनुरोध भेजा','Request sent'],['accepted','डॉक्टर ने स्वीकार किया','Vet accepted'],['ontheway','डॉक्टर रास्ते में','Vet on the way'],['done','इलाज पूरा','Treatment done']];
var T=function(h,e){return S.lang==='hi'?h:e};
var $=function(i){return document.getElementById(i)};
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
function go(s){S.screen=s;render()}
function mine(){return S.cases.filter(function(c){return c.owner==='Ramu'}).slice(-1)[0]}
function stIdx(c){return STL.findIndex(function(x){return x[0]===c.st})}

function farmer(){
 var h='<div class="scr">',c=mine();
 if(S.screen==='home'){
  h+='<div class="hello"><div><small>'+T('नमस्ते','Namaste')+'</small><h2 style="margin:0">'+T('रामू जी','Ramu ji')+'</h2></div><button class="mic" onclick="toast(\''+T('सुन रहा हूँ… (डेमो)','Listening… (voice demo)')+'\')" aria-label="Voice">🎤</button></div>'
  +'<button class="sos" onclick="go(\'sick\')"><span style="font-size:40px">🚨</span><span>'+T('पशु बीमार है','My animal is sick')+'<small>'+T('यहाँ दबाएं, मदद मिलेगी','Tap here to get help')+'</small></span></button>'
  +(c&&c.st!=='done'?'<button class="task" style="width:100%;text-align:left;border:2px solid var(--y)" onclick="go(\'track\')"><span class="e">🩺</span><span><b>'+T('डॉक्टर अनुरोध चालू है','Vet request in progress')+'</b><br><small>'+STL[stIdx(c)][S.lang==='hi'?1:2]+'</small></span></button>':'')
  +'<h2>'+T('मेरे पशु','My animals')+'</h2><div class="row">'
  +'<div class="an"><div class="e">🐄</div><b>'+T('लक्ष्मी','Lakshmi')+'</b><small>'+T('स्वस्थ','Healthy')+'</small></div>'
  +'<div class="an y"><div class="e">🐃</div><b>'+T('गौरी','Gauri')+'</b><small>'+T('टीका 3 दिन में','Vaccine in 3 days')+'</small></div>'
  +'<div class="an"><div class="e">🐐</div><b>'+T('मोती','Moti')+'</b><small>'+T('स्वस्थ','Healthy')+'</small></div></div>'
  +'<h2 style="margin-top:14px">'+T('आज के काम','Today')+'</h2>'
  +'<div class="task"><span class="e">💉</span><span><b>'+T('गौरी: खुरपका टीका','Gauri: FMD vaccine')+'</b><br><small>'+T('3 दिन बाकी','Due in 3 days')+'</small></span></div>'
  +'<div class="task"><span class="e">☀️</span><span><b>'+T('आज बहुत गर्मी','Very hot today')+'</b><br><small>'+T('छाया और ज्यादा पानी दें','Give shade and extra water')+'</small></span></div>';
 }
 if(S.screen==='sick'){
  h+='<button class="back" onclick="go(\'home\')">← '+T('वापस','Back')+'</button><h2>'+T('क्या दिक्कत है?','What is the problem?')+'</h2><div class="grid">';
  SYM.forEach(function(s,i){h+='<button class="sym'+(S.sym===i?' on':'')+'" onclick="S.sym='+i+';render()"><span class="e">'+s[0]+'</span>'+s[S.lang==='hi'?1:2]+'</button>'});
  h+='</div><button class="btn alt" onclick="toast(\''+T('फोटो खींचें (डेमो)','Take photo (demo)')+'\')">📷 '+T('फोटो जोड़ें','Add photo')+'</button>'
  +'<button class="btn" '+(S.sym===null?'disabled':'')+' onclick="go(\'result\')">'+T('आगे','Next')+'</button>';
 }
 if(S.screen==='result'){
  var s=SYM[S.sym],u=URG[s[3]];
  h+='<button class="back" onclick="go(\'sick\')">← '+T('वापस','Back')+'</button><h2>'+s[0]+' '+s[S.lang==='hi'?1:2]+'</h2>'
  +'<div class="res" style="background:'+u[4]+'"><span class="pill '+u[3]+'">'+u[0]+' '+u[S.lang==='hi'?1:2]+'</span><p style="margin:10px 0 0"><b>'+T('पहले क्या करें','First aid')+':</b> '+s[S.lang==='hi'?4:5]+'</p></div>'
  +'<button class="btn" onclick="req()">🩺 '+T('डॉक्टर बुलाएं','Request a vet')+'</button>'
  +'<button class="btn alt" onclick="toast(\''+T('कॉल लग रही है… (डेमो)','Calling… (demo)')+'\')">📞 '+T('सीधे कॉल करें','Call directly')+'</button>';
 }
 if(S.screen==='track'){
  h+='<h2>'+T('डॉक्टर की स्थिति','Vet request status')+'</h2>';
  if(!c){h+='<p>'+T('अभी कोई अनुरोध नहीं है।','No requests yet. Tap "Animal is sick" to start.')+'</p>'}
  else{
   h+='<div class="card"><b>'+c.animal+'</b> · '+c.sym+'</div><ul class="steps">';
   STL.forEach(function(x,i){h+='<li class="'+(i<=stIdx(c)?'done':'')+'"><i>'+(i<=stIdx(c)?'✓':i+1)+'</i>'+x[S.lang==='hi'?1:2]+'</li>'});
   h+='</ul>';
   if(c.st==='done')h+='<div class="res" style="background:var(--gl)"><b>💊 '+T('पर्चा','Prescription')+'</b><p style="margin:6px 0 0">'+c.rx+'</p></div>';
   else h+='<div class="card" style="color:var(--mut)">'+T('डेमो: ऊपर "डॉक्टर" टैब पर जाकर इस केस को स्वीकार करें।','Demo tip: open the Vet tab at the top and accept this case.')+'</div>';
   h+='<button class="btn alt" onclick="toast(\''+T('कॉल लग रही है… (डेमो)','Calling… (demo)')+'\')">📞 '+T('डॉक्टर को कॉल','Call vet')+'</button>';
  }
 }
 h+='</div><div class="nav">';
 [['home','🏠',T('घर','Home')],['x1','🐄',T('पशु','Animals')],['track','🩺',T('डॉक्टर','Vet')],['x2','🛒',T('बाज़ार','Market')],['x3','❓',T('मदद','Help')]].forEach(function(n){
  var on=(n[0]===S.screen)||(n[0]==='home'&&(S.screen==='sick'||S.screen==='result'));
  h+='<button class="'+(on?'on':'')+'" onclick="'+(n[0][0]==='x'?'toast(\''+T('प्रोटोटाइप: जल्द आ रहा है','Prototype: coming soon')+'\')':'go(\''+n[0]+'\')')+'"><b>'+n[1]+'</b>'+n[2]+'</button>'});
 return h+'</div>';
}
function req(){
 var s=SYM[S.sym];
 S.cases.push({id:S.cases.length+1,animal:T('गौरी (भैंस)','Gauri (Buffalo)'),sym:s[2],villa:'Rampur',urg:s[3],st:'new',km:2,owner:'Ramu'});
 S.sym=null;toast(T('अनुरोध भेज दिया गया','Request sent'));go('track');
}

var DX=['Fever','Infection','Indigestion','FMD','Mastitis','Injury'],RX=['Antibiotic 5 days','Fluids + ORS','Pain relief','Dewormer'];
function vet(){
 var h='<div class="scr"><div class="toggle"><span>🟢 Available for cases</span><b>'+S.cases.filter(function(c){return c.st==='done'}).length+' done today</b></div>';
 if(S.cid){
  var c=S.cases.find(function(x){return x.id===S.cid});
  h+='<button class="back" onclick="S.cid=null;render()">← Queue</button><h2>'+c.animal+'</h2><div class="card">'+c.sym+' · '+c.villa+' · owner '+c.owner+'<br><small style="color:var(--mut)">Last vaccine: FMD, 4 months ago</small></div>'
  +'<b>Diagnosis</b><div class="chips">'+DX.map(function(d){return '<button class="'+(S.treat.dx===d?'on':'')+'" onclick="S.treat.dx=\''+d+'\';render()">'+d+'</button>'}).join('')+'</div>'
  +'<b>Treatment</b><div class="chips">'+RX.map(function(d){return '<button class="'+(S.treat.rx===d?'on':'')+'" onclick="S.treat.rx=\''+d+'\';render()">'+d+'</button>'}).join('')+'</div>'
  +'<button class="btn alt" onclick="toast(\'Recording voice note… (demo)\')">🎤 Add voice note</button>'
  +'<button class="btn" '+(S.treat.dx&&S.treat.rx?'':'disabled')+' onclick="finish('+c.id+')">Send prescription</button>';
 }else{
  h+='<h2>Case queue</h2>';
  var q=S.cases.filter(function(c){return c.st!=='done'}).sort(function(a,b){return a.urg-b.urg});
  if(!q.length)h+='<p style="color:var(--mut)">No open cases. You will be alerted when a farmer asks for help.</p>';
  q.forEach(function(c){var u=URG[c.urg];
   h+='<div class="card"><span class="pill '+u[3]+'">'+u[0]+' '+u[2].split(':')[0]+'</span><h3 style="margin:8px 0 2px">'+c.animal+' · '+c.sym+'</h3><small style="color:var(--mut)">'+c.villa+' · '+c.km+' km away</small>';
   if(c.st==='new')h+='<div style="display:flex;gap:8px"><button class="btn" onclick="setSt('+c.id+',\'accepted\')">Accept</button><button class="btn no" onclick="toast(\'Passed to next vet\')">Decline</button></div>';
   if(c.st==='accepted')h+='<button class="btn" onclick="setSt('+c.id+',\'ontheway\')">🧭 I am on the way</button>';
   if(c.st==='ontheway')h+='<button class="btn" onclick="S.cid='+c.id+';S.treat={};render()">🩺 Start treatment</button>';
   h+='</div>'});
 }
 return h+'</div><div class="nav"><button class="on"><b>📋</b>Cases</button><button onclick="toast(\'Route map: coming soon\')"><b>🗺️</b>Route</button><button onclick="toast(\'Campaign mode: coming soon\')"><b>💉</b>Vaccinate</button><button onclick="toast(\'Earnings: coming soon\')"><b>₹</b>Earnings</button></div>';
}
function setSt(id,st){S.cases.find(function(c){return c.id===id}).st=st;toast(st==='accepted'?'Case accepted':'Farmer notified');render()}
function finish(id){var c=S.cases.find(function(x){return x.id===id});c.st='done';c.rx=S.treat.dx+': '+S.treat.rx;S.cid=null;toast('Prescription sent to farmer by SMS');render()}

function admin(){
 var open=S.cases.filter(function(c){return c.st!=='done'}).length,done=S.cases.length-open;
 var h='<div class="adm"><div class="stats"><div class="stat"><b>1,248</b><span>Active farmers</span></div><div class="stat" style="border-color:var(--y)"><b>37</b><span>Vets online</span></div><div class="stat" style="border-color:var(--r)"><b>'+open+'</b><span>Open cases</span></div><div class="stat"><b>'+done+'</b><span>Closed today</span></div></div>'
 +'<div class="cols"><div class="panel"><h2>Live cases</h2><table><tr><th>Animal</th><th>Issue</th><th>Village</th><th>Urgency</th><th>Status</th></tr>';
 S.cases.forEach(function(c){var u=URG[c.urg];h+='<tr><td>'+c.animal+'</td><td>'+c.sym+'</td><td>'+c.villa+'</td><td><span class="pill '+u[3]+'">'+u[2].split(':')[0]+'</span></td><td>'+STL[stIdx(c)][2]+'</td></tr>'});
 h+='</table></div><div class="panel"><h2>Alerts</h2><div class="alert">🚨 Suspected lumpy skin disease: Sultanpur block (3 reports)</div><div class="alert y">⏱️ 1 case unassigned for over 10 minutes</div>'
 +'<button class="sm" onclick="toast(\'Alert sent to 214 farmers in Sultanpur\')">Send alert to block</button>'
 +'<h2 style="margin-top:16px">Map</h2><svg viewBox="0 0 300 160" width="100%" role="img" aria-label="Case map"><rect width="300" height="160" rx="10" fill="var(--gl)"/><path d="M0 110 Q80 70 150 100 T300 60" stroke="var(--line)" stroke-width="10" fill="none"/>'
 +S.cases.map(function(c,i){var col=['var(--r)','var(--y)','var(--g)'][c.urg];return '<circle cx="'+(50+i*70%220)+'" cy="'+(40+i*37%90)+'" r="9" fill="'+col+'" stroke="#fff" stroke-width="2"/>'}).join('')
 +'<circle cx="120" cy="80" r="6" fill="#246" stroke="#fff" stroke-width="2"/><circle cx="220" cy="110" r="6" fill="#246" stroke="#fff" stroke-width="2"/></svg><small style="color:var(--mut)">Dots: cases by urgency · Blue: vets online</small></div></div>'
 +'<div class="panel" style="margin-top:14px"><h2>Vet approvals</h2><table><tr><th>Name</th><th>Registration</th><th></th></tr><tr><td>Dr. Anil Verma</td><td>UP-VC-20418</td><td><button class="sm" onclick="toast(\'Dr. Anil Verma approved\')">Approve</button></td></tr></table></div></div>';
 return h;
}

var NOTES={farmer:'Farmer view: Hindi first, big icons, voice button. Try "Animal is sick", then switch to the Vet tab to accept the case.',vet:'Vet view: urgent cases first, tap-only treatment entry. Accept a case, then start treatment.',admin:'Admin view: live case table, outbreak alerts and approvals. It updates as farmers and vets act.'};
function render(){
 $('tabs').innerHTML=['farmer','vet','admin'].map(function(r){return '<button class="'+(S.role===r?'on':'')+'" onclick="S.role=\''+r+'\';render()">'+{farmer:T('किसान','Farmer'),vet:T('डॉक्टर','Vet'),admin:'Admin'}[r]+'</button>'}).join('');
 $('note').textContent=NOTES[S.role];
 $('stage').innerHTML=S.role==='admin'?admin():'<div class="phone">'+(S.role==='farmer'?farmer():vet())+'</div>';
}
$('lang').onclick=function(){S.lang=S.lang==='hi'?'en':'hi';render()};
render();
</script>
</body>
</html>
