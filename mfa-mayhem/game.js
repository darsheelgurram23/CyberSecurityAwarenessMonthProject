const cv=document.getElementById('game'),g=cv.getContext('2d');
const COLS=9,ROWS=5,CW=100,CH=90,WAVES=8;
const HINT='PICK A DEFENDER (1-7) · CLICK A TILE TO PLACE · CLICK A PLACED ONE TO UPGRADE · F = FAST FORWARD · ESC = CANCEL';
const DEF={
 manager:{icon:'🔑',name:'Password Manager',cost:50,hp:100,tip:'Makes ⚡ over time'},
 sms:{icon:'💬',name:'SMS Code',cost:50,hp:100,tip:'Cheap, weak shots'},
 auth:{icon:'📱',name:'Authenticator App',cost:100,hp:100,tip:'Solid code shots'},
 passkey:{icon:'🛡️',name:'Passkey',cost:75,hp:700,tip:'Tank. Phishing-proof'},
 bio:{icon:'👆',name:'Biometric Scan',cost:150,hp:100,tip:'Shots slow attackers'},
 lockout:{icon:'🚧',name:'Account Lockout',cost:125,hp:60,tip:'Blasts attackers on contact'},
 firewall:{icon:'🔥',name:'Firewall',cost:200,hp:100,tip:'Burns whole lanes'}
};
const SHOOT={sms:{dmg:12,cd:1.1},auth:{dmg:25,cd:1.2},bio:{dmg:14,cd:1.6,slow:1}};
const UPG={manager:['MORE ⚡, FASTER','EVEN MORE ⚡, FASTER'],sms:['+DMG, SHOOTS 3 LANES','+DMG, SHOOTS ALL LANES'],auth:['+DMG, SHOOTS 3 LANES','+DMG, SHOOTS ALL LANES'],bio:['+DMG, SHOOTS 3 LANES','+DMG, SHOOTS ALL LANES'],
 passkey:['+60% HP, FULL HEAL','+60% HP, FULL HEAL'],lockout:['BIGGER, STRONGER BLAST','BIGGER, STRONGER BLAST'],firewall:['BURNS 3 LANES','BURNS ALL LANES']};
const ZOM={
 guesser:{icon:'🧟',hp:110,spd:20,dmg:40,en:8,score:100},
 phisher:{icon:'🎣',hp:75,spd:38,dmg:35,en:12,score:150},
 stuffer:{icon:'🤖',hp:170,spd:17,dmg:55,en:8,score:80},
 swapper:{icon:'🥷',hp:220,spd:26,dmg:50,en:20,score:250},
 bomber:{icon:'📲',hp:160,spd:18,dmg:40,en:20,score:200},
 boss:{icon:'💀',hp:2400,spd:9,dmg:250,en:150,score:2000}
};
const INTRO={t:'★ INSERT COIN ★\nDON’T MAKE IT EASY FOR THEM',b:'Crooks have your stolen password. Alone, it opens your accounts.\n\nBut MFA (multifactor authentication) asks for a SECOND proof: something you know, have, or are.\n\nDefend the Account Vault on the left against REAL hacker tactics. It is fast. It is hard. Upgrade smart.'};
const INSTR={t:'HOW TO PLAY',b:'1. Click ⚡ coins to collect Auth Points. Defeating attackers earns ⚡ too.\n2. Pick a defender (click its card or press 1-7), then click an empty tile.\n3. CLICK A PLACED DEFENDER TO UPGRADE IT (up to LV3). LV2 hits 3 lanes, LV3 hits ALL lanes!\n4. 3 breaches = GAME OVER. Press F to fast-forward, ESC to cancel a pick.\n\nDEFENDERS\n🔑 Password Manager: makes ⚡\n💬 SMS Code: cheap, weak shots\n📱 Authenticator App: solid shots\n🛡️ Passkey: huge HP, phishing-proof\n👆 Biometric Scan: slows attackers\n🚧 Account Lockout: blasts attackers that touch it\n🔥 Firewall: burns whole lanes'};
const FOES={t:'KNOW YOUR ATTACKERS',b:'Each one is a real hacking tactic:\n\n🧟 BRUTE FORCE: guesses passwords nonstop. Lockouts crush it.\n🎣 PHISHING: fast. Its lures DISABLE defenders. Passkeys are immune!\n🤖 CREDENTIAL STUFFING: reused passwords. Arrives in packs of 3.\n🥷 SIM SWAPPING: hijacks text codes. SMS Code defenders barely hurt it and die to it.\n📲 MFA FATIGUE: spams fake login prompts. CLICK each prompt to DENY it before it expires, or you lose ⚡ and a defender goes down.\n💀 DATA BREACH: final boss. If it reaches the vault, game over.\n\nSurvive 8 waves. Good luck!'};
const FACTS=[
 ['MFA = 2+ proofs','Multifactor authentication combines two or more kinds of proof:\n• Something you KNOW (password)\n• Something you HAVE (phone app, security key)\n• Something you ARE (fingerprint, face)\n\nBrute-force guessing fails once a second factor is in the way.'],
 ['Phishing','Phishing tricks you into handing over passwords or codes on a fake site.\n\nTip: NEVER share a one-time code with anyone. Real companies will not ask for it. Passkeys and security keys are built to resist fake sites.'],
 ['Credential stuffing','Attackers try a password leaked from one site on many others.\n\nTip: use a unique password for every account (a password manager helps), AND turn on MFA so a stolen password isn’t enough.'],
 ['Text codes can be hijacked','In SIM swapping, a crook tricks your phone carrier into moving your number to their SIM, then receives your text codes.\n\nTip: any MFA beats none, but prefer an authenticator app or passkey over text messages.'],
 ['MFA fatigue','Attackers spam you with approval prompts hoping you tap “Approve” just to make them stop.\n\nTip: if you get a prompt you didn’t start, DENY it, change that account’s password, and report it.'],
 ['Plan for a lost phone','Tip: save your backup codes somewhere safe and offline, keep your recovery info up to date, and put MFA on your recovery email too.\n\nLocked out with no plan is a bad day.'],
 ['Protect email first','Your email can reset the passwords on your other accounts, so it is the master key.\n\nTurn on MFA first for email, then banking, social media, school or work, cloud storage, and gaming accounts.'],
 ['Final wave: breaches happen','Companies get breached and passwords leak, even strong ones. MFA is your second lock.\n\nTip: you can check whether your email appeared in a known breach at haveibeenpwned.com, then change those passwords and turn on MFA.']
];
let S,mouse={c:-1,r:-1},sel=null,hi=0,ac,speed=1.5;
try{hi=+localStorage.getItem('mfaHi')||0}catch(e){}
function beep(f,d){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),v=ac.createGain();o.type='square';o.frequency.value=f;v.gain.value=.04;o.connect(v);v.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
const $=id=>document.getElementById(id),rand=n=>Math.floor(Math.random()*n);
function show(t,b,btn,cb){$('mt').textContent=t;$('mb').textContent=b;$('mgo').textContent=btn;$('modal').classList.remove('hidden');$('mgo').onclick=()=>{$('modal').classList.add('hidden');cb()};}
function say(s){S.msg={s,t:2.2}}
function reset(){S={score:0,pts:75,plants:[],zoms:[],shots:[],coins:[],prompts:[],fx:[],msg:null,wave:0,lives:3,queue:[],spawnT:3,coinT:6,paused:true,over:false};hud();}
function hud(){$('score').textContent='SCORE '+String(S.score).padStart(6,'0')+'  HI '+String(hi).padStart(6,'0');$('pts').textContent='⚡ '+S.pts;$('wave').textContent='WAVE '+Math.max(1,S.wave)+'/'+WAVES;$('lives').textContent='🔒'.repeat(S.lives)+'🔓'.repeat(3-S.lives);
 document.querySelectorAll('.dcard').forEach(b=>{b.classList.toggle('off',S.pts<DEF[b.dataset.k].cost);b.classList.toggle('sel',sel===b.dataset.k)});}
Object.keys(DEF).forEach((k,i)=>{const d=DEF[k],b=document.createElement('button');b.className='dcard';b.dataset.k=k;
 b.innerHTML=`<b>${i+1}. ${d.icon} ${d.name}</b>⚡ ${d.cost}<small>${d.tip}</small>`;b.onclick=()=>{sel=k;hud()};$('cards').appendChild(b)});
addEventListener('keydown',e=>{const k=Object.keys(DEF)[+e.key-1];if(k){sel=k;hud()}if(e.key==='Escape'){sel=null;hud()}if(e.key==='f'||e.key==='F')speed=speed>2?1.5:2.6});
const upCost=p=>Math.round(DEF[p.k].cost*(p.lvl===1?1.2:2)/5)*5;
const maxHp=p=>DEF[p.k].hp*(p.k==='passkey'?1+.6*(p.lvl-1):1+.25*(p.lvl-1));
function setHint(){const h=document.querySelector('.hint');if(!S||mouse.c<0||mouse.c>=COLS||mouse.r<0||mouse.r>=ROWS){h.textContent=HINT;return}
 const p=S.plants.find(q=>q.c===mouse.c&&q.r===mouse.r);if(!p){h.textContent=HINT;return}
 h.textContent=DEF[p.k].name.toUpperCase()+(p.lvl>=3?' · MAX LEVEL ★★★':' · CLICK TO UPGRADE TO LV'+(p.lvl+1)+' FOR ⚡'+upCost(p)+' · '+UPG[p.k][p.lvl-1]);}
function mk(t,x,row){const hp=Math.round(ZOM[t].hp*(1+.07*S.wave));return{t,row,x,hp,max:hp,slow:0,cd:t==='phisher'?3:t==='bomber'?4:t==='boss'?5:0}}
function startWave(){S.wave++;const n=S.wave,q=[];
 for(let i=0;i<2+Math.floor(n*1.5);i++)q.push('guesser');
 if(n>=2)for(let i=0;i<n;i++)q.push('phisher');
 if(n>=3)for(let i=0;i<Math.floor(n/2);i++)q.push('pack');
 if(n>=4)for(let i=0;i<n-2;i++)q.push('swapper');
 if(n>=5)for(let i=0;i<Math.ceil((n-4)/1.5);i++)q.push('bomber');
 q.sort(()=>Math.random()-.5);if(n===WAVES)q.splice(Math.floor(q.length/2),0,'boss');
 S.queue=q;S.spawnT=n===1?4:2;S.paused=true;S.prompts=[];if(n>1)S.pts+=40;hud();
 show('WAVE '+n+' · '+FACTS[n-1][0].toUpperCase(),FACTS[n-1][1],'▶ START WAVE',()=>S.paused=false);}
function begin(){reset();show(INTRO.t,INTRO.b,'▶ NEXT',()=>show(INSTR.t,INSTR.b,'▶ NEXT',()=>show(FOES.t,FOES.b,'▶ START GAME',startWave)));}
function end(win){S.over=true;S.paused=true;if(win)S.score+=S.lives*500;if(S.score>hi){hi=S.score;try{localStorage.setItem('mfaHi',hi)}catch(e){}}hud();const sc='\n\nFINAL SCORE: '+S.score+(S.score>=hi?'  ★ NEW HIGH SCORE ★':'');
 if(win)show('★ VAULT SECURED ★','You beat the Data Breach! Remember:\n✔ Turn on MFA for email first, then banking, social, and school/work accounts\n✔ Prefer passkeys or an authenticator app over texts\n✔ Never share codes; DENY prompts you didn’t start\n✔ Save backup codes and use unique passwords\n\nDon’t make it easy for them!'+sc,'↻ PLAY AGAIN',begin);
 else show('GAME OVER','ACCOUNT BREACHED! A password alone is easy to steal, guess, or reuse. Add MFA and try again!'+sc,'↻ CONTINUE?',begin);}
function coin(x,y,ty,v=25){S.coins.push({x,y,ty,life:9,v})}
const lanes=p=>p.lvl>=3?[0,1,2,3,4]:p.lvl===2?[p.r-1,p.r,p.r+1].filter(r=>r>=0&&r<ROWS):[p.r];
function update(dt){
 if(S.paused||S.over)return;
 if(S.msg){S.msg.t-=dt;if(S.msg.t<=0)S.msg=null}
 S.spawnT-=dt;
 if(S.queue.length&&S.spawnT<=0){const t=S.queue.shift();
  if(t==='pack'){const rs=[0,1,2,3,4].sort(()=>Math.random()-.5).slice(0,3);rs.forEach((r,i)=>S.zoms.push(mk('stuffer',COLS*CW+20+i*25,r)))}
  else S.zoms.push(mk(t,COLS*CW+20,rand(ROWS)));
  if(t==='boss')say('☠ DATA BREACH INCOMING ☠');
  S.spawnT=Math.max(.9,3.2-S.wave*.25)*(.6+Math.random()*.8)}
 S.coinT-=dt;if(S.coinT<=0){S.coinT=10;coin(60+Math.random()*780,-20,80+Math.random()*330)}
 S.coins.forEach(c=>{if(c.y<c.ty)c.y+=60*dt;else c.life-=dt});S.coins=S.coins.filter(c=>c.life>0);
 S.fx.forEach(f=>f.t-=dt);S.fx=S.fx.filter(f=>f.t>0);
 S.plants.forEach(p=>{if(p.stun>0){p.stun-=dt;return}
  const k=p.k,m=1+.5*(p.lvl-1);p.cd-=dt;
  if(k==='manager'&&p.cd<=0){p.cd=6.5-.5*(p.lvl-1);coin(p.c*CW+50,p.r*CH+25,p.r*CH+70,25+15*(p.lvl-1))}
  else if(SHOOT[k]&&p.cd<=0){const o=SHOOT[k],ls=lanes(p).filter(r=>S.zoms.some(z=>z.row===r&&z.x>p.c*CW+30));
   if(ls.length){p.cd=o.cd*(1-.12*(p.lvl-1));ls.forEach(r=>S.shots.push({r,x:p.c*CW+75,dmg:o.dmg*m,slow:o.slow,src:k}))}}
  else if(k==='firewall'&&p.cd<=0){const ls=lanes(p).filter(r=>S.zoms.some(z=>z.row===r&&z.x<COLS*CW));
   if(ls.length){p.cd=5-.5*(p.lvl-1);ls.forEach(r=>{S.fx.push({r,t:.3});S.zoms.forEach(z=>{if(z.row===r&&z.x<COLS*CW)z.hp-=45*m})});beep(260,.15)}}
  else if(k==='lockout'){p.arm-=dt;
   if(p.arm<=0&&S.zoms.some(z=>z.row===p.r&&z.x>p.c*CW-20&&z.x<p.c*CW+CW+30)){const R=150*(1+.15*(p.lvl-1));
    S.zoms.forEach(z=>{if(Math.abs(z.row-p.r)<=1&&Math.abs(z.x-(p.c*CW+50))<R)z.hp-=260*m});
    S.fx.push({boom:1,x:p.c*CW+50,y:p.r*CH+45,t:.35,R});p.hp=0;beep(70,.3)}}});
 S.shots.forEach(s=>{s.x+=340*dt;const z=S.zoms.find(z=>z.row===s.r&&Math.abs(z.x-s.x)<28);
  if(z){z.hp-=(z.t==='swapper'&&s.src==='sms')?s.dmg*.25:s.dmg;if(s.slow)z.slow=3;s.dead=true}
  if(s.x>COLS*CW+40)s.dead=true;});S.shots=S.shots.filter(s=>!s.dead);
 S.zoms.forEach(z=>{const d=ZOM[z.t];z.slow=Math.max(0,z.slow-dt);
  if(z.t==='phisher'){z.cd-=dt;if(z.cd<=0){z.cd=5;const t=S.plants.filter(p=>p.k!=='passkey'&&p.stun<=0);if(t.length&&z.x<COLS*CW)t[rand(t.length)].stun=4}}
  if(z.t==='bomber'){z.cd-=dt;if(z.cd<=0){z.cd=6;S.prompts.push({x:100+Math.random()*700,y:60+Math.random()*330,life:3.5})}}
  if(z.t==='boss'){z.cd-=dt;if(z.cd<=0){z.cd=7;for(let i=0;i<2;i++)S.zoms.push(mk('stuffer',z.x-20,rand(ROWS)))}}
  const p=S.plants.find(p=>p.r===z.row&&p.c*CW+CW>z.x-35&&p.c*CW<z.x);
  if(p){p.hp-=d.dmg*dt;if(z.t==='swapper'&&p.k==='sms')p.hp=0}
  else z.x-=d.spd*(1+.03*S.wave)*(z.slow>0?.5:1)*dt;
  if(z.x<10){z.dead=true;S.lives=z.t==='boss'?0:S.lives-1;beep(90,.35)}});
 S.zoms.forEach(z=>{if(z.hp<=0&&!z.dead){S.score+=ZOM[z.t].score;S.pts+=ZOM[z.t].en;beep(200,.08)}});
 S.plants=S.plants.filter(p=>p.hp>0);S.zoms=S.zoms.filter(z=>z.hp>0&&!z.dead);
 S.prompts.forEach(pr=>pr.life-=dt);
 S.prompts=S.prompts.filter(pr=>{if(pr.life>0)return true;S.pts=Math.max(0,S.pts-40);if(S.plants.length)S.plants[rand(S.plants.length)].stun=6;say('APPROVED BY MISTAKE! DEFENDER DOWN');beep(120,.3);return false});
 if(S.lives<=0){hud();return end(false)}
 if(!S.queue.length&&!S.zoms.length)S.wave>=WAVES?end(true):startWave();
 hud();}
function em(ch,x,y,sz){g.font=sz+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,x,y)}
function draw(){
 g.clearRect(0,0,900,450);
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){g.fillStyle=(r+c)%2?'#14213d':'#101b33';g.fillRect(c*CW,r*CH,CW,CH)}
 g.fillStyle='rgba(46,230,200,.18)';g.fillRect(0,0,12,450);
 S.fx.forEach(f=>{if(f.boom){g.fillStyle='rgba(255,170,60,.4)';g.beginPath();g.arc(f.x,f.y,f.R*(1-f.t/.35)+20,0,7);g.fill()}else{g.fillStyle='rgba(255,120,40,'+f.t+')';g.fillRect(0,f.r*CH,900,CH)}});
 if(sel&&mouse.c>=0&&mouse.r>=0){g.globalAlpha=.45;em(DEF[sel].icon,mouse.c*CW+50,mouse.r*CH+45,48);g.globalAlpha=1}
 S.plants.forEach(p=>{const x=p.c*CW+50,y=p.r*CH+45;g.globalAlpha=p.stun>0?.35:1;em(DEF[p.k].icon,x,y,48);g.globalAlpha=1;if(p.stun>0)em('😵',x,y,26);
  g.fillStyle='#2ee6c8';g.fillRect(p.c*CW+20,p.r*CH+76,60*Math.max(0,p.hp)/p.max,4);
  g.fillStyle='#ffd24a';g.font='10px monospace';g.fillText('★'.repeat(p.lvl),x,p.r*CH+12)});
 g.fillStyle='#2ee6c8';g.shadowColor='#2ee6c8';g.shadowBlur=12;S.shots.forEach(s=>{g.fillRect(s.x-6,s.r*CH+35,14,10)});g.shadowBlur=0;
 S.zoms.forEach(z=>{const sz=z.t==='boss'?84:48;em(ZOM[z.t].icon,z.x,z.row*CH+45,sz);g.fillStyle='#ff4d8d';g.fillRect(z.x-25,z.row*CH+(z.t==='boss'?0:8),50*z.hp/z.max,4);if(z.slow>0)em('❄️',z.x+22,z.row*CH+20,18)});
 S.coins.forEach(c=>em('⚡',c.x,c.y,34));
 S.prompts.forEach(pr=>{g.fillStyle='#2b0d18';g.fillRect(pr.x-80,pr.y-28,160,56);g.strokeStyle='#ff4d8d';g.lineWidth=3;g.strokeRect(pr.x-80,pr.y-28,160,56);g.fillStyle='#fff';g.font='bold 12px monospace';g.textAlign='center';g.fillText('🔔 APPROVE LOGIN?',pr.x,pr.y-8);g.fillStyle='#ffd24a';g.fillText('CLICK = ✖ DENY',pr.x,pr.y+10);g.fillStyle='#ff4d8d';g.fillRect(pr.x-76,pr.y+20,152*pr.life/3.5,4)});
 if(S.msg){g.font='bold 18px monospace';g.textAlign='center';g.fillStyle='#000';g.fillText(S.msg.s,452,22);g.fillStyle='#ffd24a';g.fillText(S.msg.s,450,20)}}
cv.addEventListener('mousemove',e=>{const p=pos(e);mouse={c:Math.floor(p.x/CW),r:Math.floor(p.y/CH)};setHint()});
cv.addEventListener('mouseleave',()=>{mouse={c:-1,r:-1};setHint()});
cv.addEventListener('contextmenu',e=>{e.preventDefault();sel=null;hud()});
function pos(e){const b=cv.getBoundingClientRect();return{x:(e.clientX-b.left)*900/b.width,y:(e.clientY-b.top)*450/b.height}}
cv.addEventListener('click',e=>{if(S.paused||S.over)return;const p=pos(e);
 const pi=S.prompts.findIndex(q=>Math.abs(q.x-p.x)<80&&Math.abs(q.y-p.y)<28);
 if(pi>=0){S.prompts.splice(pi,1);S.pts+=10;beep(700,.08);return hud()}
 const ci=S.coins.findIndex(c=>Math.hypot(c.x-p.x,c.y-p.y)<32);
 if(ci>=0){S.pts+=S.coins[ci].v;S.coins.splice(ci,1);beep(880,.08);return hud()}
 const c=Math.floor(p.x/CW),r=Math.floor(p.y/CH);if(c<0||c>=COLS||r<0||r>=ROWS)return;
 const ex=S.plants.find(q=>q.c===c&&q.r===r);
 if(ex){if(ex.lvl<3&&S.pts>=upCost(ex)){S.pts-=upCost(ex);ex.lvl++;ex.max=maxHp(ex);ex.hp=ex.max;beep(990,.12)}else beep(150,.1);setHint();return hud()}
 if(sel&&S.pts>=DEF[sel].cost){S.pts-=DEF[sel].cost;S.plants.push({k:sel,c,r,hp:DEF[sel].hp,max:DEF[sel].hp,lvl:1,cd:sel==='manager'?3:.5,arm:2,stun:0});beep(520,.06);hud()}});
begin();
let last=performance.now();
(function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;update(dt*speed);draw();requestAnimationFrame(loop)})(last);