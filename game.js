/* =====================================================================
   행사 설정 — 이 부분만 고치면 됩니다
   ===================================================================== */
const CONFIG = {
  HOST: '신한금융희망재단 x 함께일하는재단',
  EVENT_NAME: '《지역에서 시작된 변화, 당신의 일상으로》',
  GAME_NAME: '우리 일상 속 숨은 사회연대경제 제품 찾기',
  // Google Apps Script 웹앱 주소 (README 2단계). 비워두면 이 기기에만 기록됩니다.
  SHEET_URL: 'https://script.google.com/macros/s/AKfycbwB_jKcBu0VAkQjlaJG9XHvUBmKNeFpLQ0VKI7qc7V8a_9_hSu2SrbTaRMjY_ydwPMxXg/exec',
  TIME_LIMIT: 30,        // 제한시간(초)
  IDLE_SEC: 60,          // 이 시간 동안 아무도 안 만지면 처음 화면으로
  RANK_REFRESH_SEC: 60,  // TOP 10 새로고침 주기
};
/* ===================================================================== */

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const today=()=>{const d=new Date(Date.now()+9*3600e3);return d.toISOString().slice(0,10)}; // KST
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

/* ---------------- pixel palette & sprites ---------------- */
const K='#2b2340';
const P={k:K,w:'#ffffff',x:'#f3f4fb',G:'#2fae90',g:'#1f7d66',L:'#a8e3d2',y:'#ffc63a',Y:'#fff3b0',o:'#d98a12',O:'#ff8c2e',
  r:'#e8484a',R:'#a8303a',p:'#f7a8c8',P:'#d9739c',b:'#a0693f',d:'#5c3a22',c:'#e2a65b',C:'#b97a35',t:'#f6d39b',
  n:'#f2e6cf',N:'#cdb98f',l:'#6cc04a',e:'#3f8f2e',E:'#a6e07f',s:'#c9ced6',S:'#8d94a3',B:'#4fa3e0',D:'#2c6fb0',U:'#bfe6f5',v:'#8b6fd6'};
const SPR={
 jam:['..kkkkkkkk..','..kttttttk..','.kkkkkkkkkk.','.krwrrrrrRk.','.krxxxxxxRk.','.krxxlexxRk.','.krxxexxxRk.','.krxxxxxxRk.','.krrrrrrrRk.','.krrrrrrRRk.','..kkkkkkkk..'],
 tote:['...kkkkkk...','..kk....kk..','..k......k..','.kkkkkkkkkk.','.knnnnnnnNk.','.knnnlnnnNk.','.knnlllnnNk.','.knnnennnNk.','.knnnnnnnNk.','.kNNNNNNNNk.','.kkkkkkkkkk.'],
 giftbox:['...kk..kk...','..krrkkrrk..','...kkrrkk...','.kkkkrrkkkk.','.kYyyrryyyk.','.kkkkrrkkkk.','..kyyrryyk..','..kyyrryyk..','..kyyrryok..','..kooRRook..','..kkkkkkkk..'],
 detergent:['..kkkkkk....','..ksssssk...','...kkSkkSk..','....ksk.....','...kkkkk....','..kUUUUUk...','.kUwUUUUDk..','.kUxxxxxDk..','.kUxlexxDk..','.kUxxxxxDk..','.kUUUUUUDk..','..kkkkkkk...'],
 upcycle:['.kkkkkkkkkk.','.kyyyyyyyyk.','.kkkkkkkkkk.','.kBBBkrrrrk.','.kBwBkrrrRk.','.kBBBkrrrRk.','.kkkkkkkkkk.','.kllkpppppk.','.klekpppPPk.','.kkkkkkkkkk.'],
 soap:['.kk.....kk..','kwBk...kwBk.','.kk..kk.kk..','....kwBk....','.....kk.....','kkkkkkkkkkkk','kpwwpppppppk','kpwpppppPPPk','kppppppppPPk','kPPPPPPPPPPk','kkkkkkkkkkkk'],
 tumbler:['...kkkkkk...','..kwwwwwwk..','..kkkkkkkk..','..kGLGGGgk..','..kGLGGGgk..','..kLLLLLLk..','..kGLGlGgk..','..kGGlllgk..','..kGGGlGgk..','...kGGGgk...','...kkkkkk...'],
 honey:['....kkkk....','...kbbbbk...','..kkkkkkkk..','.kyyyyyyyyk.','kywwyyyyyyok','kywyyyyyyyok','kyyoyyyoyyok','kyyyyyyyyyok','kyyyyyyyyook','.kyyyyyyook.','..kkkkkkkk..'],
 toothbrush:['.........kk.','........kwwk','.......kwwk.','......kwwk..','.....kckk...','....kck.....','...kck......','..kCk.......','.kck........','kck.........','kk..........'],
 scrubber:['.....kk.....','....k..k....','...kkkkkk...','..kElElElk..','.klElElEllk.','.kElElElEek.','.klElElElek.','.kElElElEek.','..klElElek..','...kkkkkk...'],
 bread:['...kkkkkk...','..kcccccck..','.kctttctttk.','kcccccccccCk','kcccccccccCk','kCcccccccCCk','kCCCCCCCCCCk','.kkkkkkkkkk.'],
 coffee:['...kkkkkk...','..kddddddk..','..kkkkkkkk..','..kwwwwwwk..','..kwwwwwsk..','..kccccCCk..','..kcwccCCk..','..kccccCCk..','...kwwwsk...','...kwwwsk...','...kkkkkk...'],
 vase:['...kkkkkk...','....kBBk....','....kBBk....','...kBBBBk...','..kBUBBBDk..','.kBUBBBBBDk.','.kBwwwwwwDk.','.kBBBBBBBDk.','..kBwwwwDk..','...kBBBDk...','....kkkk....'],
 lotion:['....kkkk....','...kpppkk...','....kpk.....','...kkkkk....','..kxxxxxk...','..kxwxxxk...','..klllllk...','..klwlelk...','..klllllk...','..kxxxxNk...','..kkkkkkk...'],
 paperbag:['..kkkkkkkk..','..kcCcCcCk..','..kcccccck..','.kccccccCck.','.kccGGGcCck.','.kcGcccGcck.','.kccGGGcCck.','.kccccccCck.','.kCCCCCCCCk.','.kkkkkkkkkk.'],
 cookie:['...kkkkk...','..kcccccck.','.kcwdcccCck','kccccccdcCk','kcdcccccCCk','kcccccdcCCk','kcccdcccCCk','.kcccccCCk.','..kCCCCCk..','...kkkkk...'],
 beans:['..kkkkkkkk..','..kddddddk..','..kbbbbbbk..','.kbbbbbbbbk.','.kbxxxxxxbk.','.kbxdddxxbk.','.kbxdxdxxbk.','.kbxdddxxbk.','.kbxxxxxxbk.','.kbbbbbbbdk.','.kkkkkkkkkk.'],
 candle:['.....y.....','....yoy....','....yoy....','.....k.....','..kkkkkkk..','..knnnnnNk.','..knwnnnNk.','..krrrrrRk.','..knnnnnNk.','..kNNNNNNk.','..kkkkkkkk.'],
 mitten:['...kkkk.....','..krrrrk....','.krrwrrrk...','.krrrrrrkkk.','.krrrrrrkrrk','.krrrrrrrrk.','.krrrrrrrk..','..kxxxxxk...','..kxkxkxk...','..kkkkkkk...'],
 notebook:['.kkkkkkkkk','kkellllllk','.klwwwwwlk','kkllllllk.','.kllllllk.','kklllelllk','.kllleelk.','kkllllllk.','.kkkkkkkkk'],
 solar:['kkkkkkkkkkkk','kDBDBDBDBDBk','kBUBDBUBDBDk','kDBDBDBDBDBk','kBDBDBDBDBDk','kkkkkkkkkkkk','.....kk.....','.....kk.....','....kkkk....','...kSSSSk...','...kkkkkk...'],
 ecocup:['.......kk...','......kGk...','..kkkkkGkk..','..kLLLLLLk..','..kLwLLLLk..','..kGGGGGGk..','..kGlGGGgk..','..kGGGGGgk..','...kLLLLk...','...kLLLLk...','...kkkkkk...'],
 pickles:['..kkkkkkkk..','..kGGGGGGk..','.kkkkkkkkkk.','.kEEEEEEEEk.','.kEwlEElEEk.','.kElEEElEEk.','.kElEEElEEk.','.kEElEElEEk.','.kEEEEEEEEk.','..kkkkkkkk..'],
 recyclebag:['...kkkkkk...','..kk....kk..','.kkkkkkkkkk.','.kllllllllk.','.klllwwlllk.','.kllwlllwlk.','.klwllllwlk.','.kllwllwllk.','.klllwwlllk.','.keeeeeeeek.','.kkkkkkkkkk.'],
 sprout:['..kk....kk..','.klEk..kElk.','.kllek.kllk.','..kkekkekk..','.....kek....','.....kek....','..kkkkkkkk..','..kOOOOOOk..','...kOOOok...','...kOOook...','...kkkkkk...'],
 led:['...kkkk...','..kyyyyk..','.kywwyyyk.','.kwyyyyok.','.kyyyyyok.','..kyyyok..','...ksSk...','...kSSk...','...ksSk...','....kk....'],
 veggiebox:['..ll...e....','..le..lle...','.klek.kek...','.kOOk.krrk..','.kOOkkrrrrk.','kkkkkkkkkkkk','kbbbbbbbbbdk','kbcbcbcbcbdk','kbbbbbbbbbdk','kbcbcbcbcbdk','kkkkkkkkkkkk'],
 battery:['....kkkk....','...kkSSkk...','...kGGGGk...','...kGGyGk...','...kGyyGk...','...kyyyGk...','...kGyyGk...','...kGyGGk...','...kGGGGk...','...kGGGgk...','...kkkkkk...'],
 container:['.kkkkkkkkkk.','kDDDDDDDDDDk','kBBBBBBBBBDk','kkkkkkkkkkkk','.kUUUUUUUUk.','.kUwUUUlUUk.','.kUUUUlelUk.','.kUUUUUUUUk.','.kkkkkkkkkk.'],
 seeds:['.kkkkkkkkk..','.kxxxxxxxk..','.kxUUUUUxk..','.kxUlelUxk..','.kxUUeUUxk..','.kxUUeUUxk..','.kxxxxxxxk..','.kxdxdxdxk..','.kxxxxxxxk..','.kkkkkkkkk..'],
 /* ui sprites */
 magnifier:['..kkkk......','.kUUUUk.....','kUwUUUUk....','kUwUUUUk....','kUUUUUUk....','kUUUUUUk....','.kUUUUk.....','..kkkkkk....','......kOk...','.......kOk..','........kOk.','.........kk.'],
 clock:['...kkkkkk...','..kwwwwwwk..','.kwwwkwwwwk.','kwwwwkwwwwwk','kwwwwkwwwwwk','kwwwwkkkkwwk','kwwwwwwwwwwk','kwwwwwwwwwwk','.kwwwwwwwwk.','..kwwwwwwk..','...kkkkkk...'],
 hand:['....kk......','...kttk.....','...kttk.....','...kttkkk...','...kttkttkk.','.kkkttkttktk','kttkttttttk.','kttttttttttk','.kttttttttk.','..kttttttk..','...kkkkkk...'],
 star:['.....kk.....','....kyyk....','....kyyk....','kkkkkyykkkkk','kyyyyyyyyyok','.kyyyyyyyok.','..kyyyyyok..','..kyyyyyyk..','.kyyokkyyok.','.kook..kook.','.kk......kk.'],
 starOff:['.....kk.....','....kSSk....','....kSSk....','kkkkkSSkkkkk','kSSSSSSSSSSk','.kSSSSSSSSk.','..kSSSSSSk..','..kSSSSSSk..','.kSSSkkSSSk.','.kSSk..kSSk.','.kk......kk.'],
};
const NAMES={jam:'초코미 샌드',tote:'친환경 생활용품',giftbox:'수공예 제품',detergent:'삼각 초콜릿 2종 선물세트',upcycle:'업사이클링 제품',
 soap:'수제 비누',tumbler:'새싹품은 사과주스',honey:'제주밥씸약식누룽지',toothbrush:'아차산 할매니얼 카라멜',scrubber:'천연 수세미',
 bread:'지역 특산물 식품',coffee:'커피·음료 제품',vase:'공예 제품',lotion:'생활용품',paperbag:'업사이클링 종이가방',
 cookie:'수제 쿠키',beans:'원두 봉투',candle:'수제 캔들',mitten:'손뜨개 장갑',notebook:'재생지 노트',
 solar:'에너지 절감 제품',ecocup:'친환경 컵',pickles:'지역 농산물 가공식품',recyclebag:'재활용 소재 제품',sprout:'친환경 기술 서비스',
 led:'LED 전구',veggiebox:'유기농 채소 꾸러미',battery:'충전식 건전지',container:'다회용 도시락통',seeds:'토종 씨앗'};
const sprW=k=>Math.max(...SPR[k].map(r=>r.length)), sprH=k=>SPR[k].length;

/* ---------------- drawing toolkit (1 unit = 1 dot) ---------------- */
const W=240,H=150;
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function T(ctx,pal=P){
  const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  const D=(x,y,c)=>R(x,y,1,1,c);
  const circ=(cx,cy,r,c)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r+r*.8)D(cx+i,cy+j,c)};
  const box=(x,y,w,h,f,hi,sh)=>{R(x,y,w,h,K);R(x+1,y+1,w-2,h-2,f);if(hi)R(x+1,y+1,w-2,1,hi);if(sh)R(x+1,y+h-2,w-2,1,sh)};
  const spr=(a,x,y,map)=>a.forEach((row,j)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.')continue;const c=(map&&map[ch])||pal[ch];if(c)D(x+i,y+j,c)}});
  const line=(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++)D(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),c)};
  return{R,D,circ,box,spr,line,ctx};
}
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return seed/2147483647}}
const pick=(r,a)=>a[r()*a.length|0];
const GOODS=['#e8484a','#ffc63a','#ff8c2e','#6cc04a','#4fa3e0','#f27aa0','#8b6fd6','#2fae90'];

/* shared scenery pieces */
function sky(t,gy,bands){bands.forEach((c,i)=>{const y0=Math.round(gy*i/bands.length),y1=Math.round(gy*(i+1)/bands.length);t.R(0,y0,W,y1-y0,c);
  if(i<bands.length-1)for(let x=0;x<W;x+=2){t.D(x+(y1%2),y1-1,bands[i+1]);t.D(x+1-(y1%2),y1,c)}})}  // 띠 경계 디더링
function cloud(t,x,y,s=1){const parts=[[0,0,5],[6,-2,6],[13,0,5],[-6,2,3],[18,2,3]];
  parts.forEach(([dx,dy,r])=>t.circ(x+Math.round(dx*s),y+Math.round(dy*s)+1,Math.round(r*s),'#d6ecfb'));
  parts.forEach(([dx,dy,r])=>t.circ(x+Math.round(dx*s),y+Math.round(dy*s),Math.round(r*s),'#fff'))}
function hills(t,gy,c1,c2){for(let i=0;i<W;i++){const h=Math.round(11+6*Math.sin(i/15)+3*Math.sin(i/5.3));t.R(i,gy-h,1,h,c1)}
  for(let i=0;i<W;i++){const h=Math.round(5+4*Math.sin(i/9+2));t.R(i,gy-h,1,h,c2)}}
function tree(t,x,by,s=1){const tr=Math.round(14*s);t.R(x-2,by-tr,5,tr,K);t.R(x-1,by-tr,3,tr-1,'#8a5a3b');t.R(x-1,by-tr,1,tr-1,'#a87448');
  const cy=by-tr-Math.round(4*s),L=[[0,-5,9],[-7,0,6],[7,0,6]].map(([a,b,r])=>[x+Math.round(a*s),cy+Math.round(b*s),Math.round(r*s)]);
  L.forEach(([a,b,r])=>t.circ(a,b,r+1,K));L.forEach(([a,b,r])=>t.circ(a,b,r,'#3f9a2a'));
  L.forEach(([a,b,r])=>t.circ(a-1,b-2,Math.max(1,r-3),'#5cc23c'));t.circ(x-3,cy-9,Math.max(1,Math.round(2*s)),'#8fe06a')}
function bush(t,x,y,c='#3f9a2a'){t.circ(x,y,5,K);t.circ(x+6,y+1,4,K);t.circ(x,y,4,c);t.circ(x+6,y+1,3,c);t.D(x-2,y-2,'#8fe06a');t.D(x+5,y-1,'#8fe06a')}
function grass(t,gy,r){t.R(0,gy,W,3,'#5cc23c');t.R(0,gy+3,W,1,'#3f9a2a');for(let i=0;i<W;i+=2)if(r()<.5)t.D(i,gy-1,'#5cc23c')}
function crate(t,x,y){t.box(x,y,9,7,'#e2a65b','#f6d39b','#b97a35');t.R(x+4,y+1,1,5,'#b97a35')}
function basket(t,x,y,r){t.box(x,y+3,10,5,'#c08552','#e2a65b');for(let i=0;i<4;i++){const c=pick(r,GOODS);t.circ(x+2+i*2,y+2,1,K);t.D(x+2+i*2,y+2,c)}}
function bottle(t,x,y,c){t.R(x,y,4,8,K);t.R(x+1,y+1,2,6,c);t.R(x+1,y-2,2,2,K)}
function pot(t,x,y,r){t.box(x,y,8,6,'#c96a3b','#e8935a');const c=pick(r,['#e8484a','#ffc63a','#f27aa0','#fff']);t.R(x+3,y-4,1,4,'#3f8f2e');t.circ(x+1,y-4,1,'#5cc23c');t.circ(x+6,y-3,1,'#5cc23c');t.D(x+3,y-5,c);t.D(x+2,y-6,c);t.D(x+4,y-6,c)}
function sack(t,x,y,c='#d9c08f'){t.R(x+1,y,6,1,K);t.R(x,y+1,8,8,K);t.R(x+1,y+1,6,7,c);t.R(x+2,y+1,4,1,'#f2e6cf');t.D(x+3,y+4,'#8a5a3b');t.D(x+4,y+5,'#8a5a3b')}
function person(t,x,y,r){const m={h:pick(r,['#5c3a22','#2b2340','#a0693f','#e2a65b']),f:'#f6c9a0',s:pick(r,GOODS),p:pick(r,['#2c3e66','#5c6187','#3f3a52','#6b4a2b'])};
  t.spr(['..kkk..','.khhhk.','.kfffk.','.kfffk.','..kkk..','.ksssk.','kfsssfk','.ksssk.','.kpppk.','.kpkpk.','.kk.kk.'],x,y,m)}
function goodsRow(t,x0,x1,y,r){for(let x=x0;x<x1;){const k=r();if(k<.35){t.circ(x+2,y-2,2,K);t.circ(x+2,y-2,1,pick(r,GOODS));x+=5}else if(k<.6){bottle(t,x,y-8,pick(r,GOODS));x+=5}else if(k<.85){t.box(x,y-6,7,6,pick(r,GOODS),'rgba(255,255,255,.45)');x+=8}else{x+=3}}}
function bunting(t,x0,x1,y,sag){const n=Math.floor((x1-x0)/9);for(let i=0;i<=x1-x0;i++){const u=i/(x1-x0);t.D(x0+i,Math.round(y+sag*4*u*(1-u)),K)}
  for(let i=0;i<n;i++){const u=(i+.5)/n,cx=Math.round(x0+(x1-x0)*u),cy=Math.round(y+sag*4*u*(1-u))+1,c=GOODS[i%GOODS.length];
    for(let j=0;j<5;j++)t.R(cx-3+Math.ceil(j/2),cy+j,7-Math.ceil(j/2)*2,1,j===4?K:c);t.D(cx-3,cy,K);t.D(cx+3,cy,K)}}

/* ---------------- scenes ---------------- */
function drawMarket(t){const r=rng(31);
  sky(t,56,['#4aa6ec','#5fb2ef','#78c0f2','#93cef5','#b0dcf8']);
  cloud(t,30,14,1);cloud(t,120,8,.8);cloud(t,204,18,1.1);
  // 남산 + 타워
  for(let i=-30;i<=30;i++){const h=Math.round(Math.sqrt(900-i*i)*.6);t.R(118+i,56-h,1,h,'#6f8fc0')}for(let i=-30;i<=30;i+=3)t.D(118+i,56-Math.round(Math.sqrt(900-i*i)*.6),'#8aa6d6');
  t.R(117,14,2,8,K);t.R(115,22,6,4,K);t.R(116,23,4,2,'#fff3b0');t.R(117,26,2,13,K);t.R(116,36,4,2,K);
  // far bridge
  t.R(0,46,W,3,'#7f8fc4');[60,170].forEach(x=>{t.R(x,24,4,22,'#7f8fc4');for(let k=1;k<=4;k++){t.line(x+2,25,x+2-k*9,46,'#93a3d6');t.line(x+2,25,x+2+k*9,46,'#93a3d6')}});
  for(let x=4;x<W;x+=26)t.R(x,49,3,7,'#7f8fc4');
  // river
  t.R(0,56,W,18,'#3d8fd1');for(let n=0;n<40;n++){const x=r()*W|0,y=57+r()*16|0,w=3+(r()*4|0);t.R(x,y,w,1,'#9fd3f5');if(n%3===0)t.D(x+1,y,'#fff')}
  // bank + plaza
  t.R(0,74,W,4,'#5cc23c');t.R(0,77,W,1,'#3f9a2a');
  t.R(0,78,W,72,'#e8c08a');for(let y=84;y<H;y+=6){t.R(0,y,W,1,'#d4a670');for(let x=((y/6)%2?0:6);x<W;x+=12)t.R(x,y-5,1,5,'#d4a670')}
  tree(t,10,78,1);tree(t,230,78,1.1);bush(t,110,72);
  bunting(t,0,W,62,8);
  // stalls
  const awn=['#e8484a','#2fae90','#ffc63a','#4fa3e0'];
  [6,64,122,180].forEach((x,i)=>{const w=52;
    t.R(x,88,w,22,'#7a4a2c');t.R(x,98,w,1,'#5c3a22');goodsRow(t,x+2,x+w-6,98,r);
    t.R(x-1,88,3,24,K);t.R(x+w-2,88,3,24,K);t.R(x,88,1,22,'#c08552');t.R(x+w-1,88,1,22,'#c08552');
    t.R(x-4,80,w+8,10,K);for(let j=0;j<w+6;j++)t.R(x-3+j,81,1,7,Math.floor(j/4)%2?'#fff':awn[i]);
    for(let j=0;j<w+6;j+=2)t.D(x-3+j,88,Math.floor(j/4)%2?'#fff':awn[i]);
    t.box(x-2,110,w+4,14,'#c08552','#e2a65b','#8a5a3b');for(let j=6;j<w;j+=8)t.R(x+j,112,1,10,'#8a5a3b');
    goodsRow(t,x+1,x+w-4,110,r)});
  [58,116,174].forEach(x=>person(t,x,112,r));
  // front clutter
  for(let n=0;n<26;n++){const x=r()*228|0,y=127+(r()*14|0),k=r();if(k<.3)crate(t,x,y);else if(k<.55)basket(t,x,y,r);else if(k<.75)sack(t,x,y);else pot(t,x,y+3,r)}
}
function drawTown(t){const r=rng(57);
  sky(t,40,['#4aa6ec','#68b8f0','#8ccbf5','#b0dcf8']);cloud(t,40,10,.9);cloud(t,170,8,1);
  const B=[{x:0,top:26,wall:'#f2b880',trim:'#c96a3b',awn:'#e8484a',sign:'BAKERY'},{x:60,top:16,wall:'#9fdccb',trim:'#1f7d66',awn:'#2fae90'},
           {x:120,top:30,wall:'#c9b8f0',trim:'#5a48a6',awn:'#8b6fd6'},{x:180,top:20,wall:'#f6d39b',trim:'#a0693f',awn:'#4fa3e0'}];
  // 빵집 굴뚝 + 연기
  t.box(40,14,8,13,'#a0693f','#c08552');t.R(39,13,10,2,K);t.R(42,8,4,3,'rgba(255,255,255,.8)');t.R(45,3,5,3,'rgba(255,255,255,.65)');t.R(41,0,3,2,'rgba(255,255,255,.5)');
  B.forEach((b,i)=>{const w=60,x=b.x;t.box(x,b.top,w,104-b.top,b.wall);
    if(i===0)for(let y=b.top+6;y<102;y+=4){t.R(x+1,y,w-2,1,'#e0a06e');for(let bx=x+1+((y/4)%2?0:4);bx<x+w-1;bx+=8)t.R(bx,y+1,1,3,'#e0a06e')}   // 벽돌
    if(i===2)for(let y=b.top+6;y<102;y+=3)t.R(x+1,y,w-2,1,'#b8a5e6');                                                                     // 판자벽
    t.R(x,b.top,w,4,b.trim);t.R(x,b.top+4,w,1,K);
    for(let y=b.top+9;y<60;y+=16)[x+8,x+w-22].forEach((wx,j)=>{t.box(wx,y,14,12,'#bfe6f5','#fff');t.R(wx+7,y+1,1,10,K);t.R(wx+1,y+6,12,1,K);t.R(wx-1,y+12,16,2,b.trim);
      if((i+j)%2===1&&i!==3)for(let f=0;f<4;f++){t.D(wx+1+f*4,y+11,'#3f8f2e');t.D(wx+1+f*4,y+10,GOODS[(i+f)%4])}});   // 창가 꽃
    t.box(x+8,61,40,7,'#fff8e7');for(let k=0;k<6;k++)t.R(x+12+k*6,63,4,3,b.trim);
    t.R(x+4,69,w-8,7,K);for(let j=0;j<w-10;j++)t.R(x+5+j,70,1,5,Math.floor(j/4)%2?'#fff':b.awn);
    t.box(x+5,77,34,26,'#bfe6f5');t.R(x+6,89,32,1,'#8a5a3b');goodsRow(t,x+7,x+35,89,r);goodsRow(t,x+7,x+35,101,r);
    t.box(x+43,77,13,27,b.trim);t.D(x+53,90,'#ffc63a')});
  // sidewalk
  t.R(0,104,W,46,'#d6d9e4');for(let y=110;y<H;y+=8)t.R(0,y,W,1,'#b9bdcc');for(let y=104;y<H;y+=8)for(let x=(y/8)%2?0:8;x<W;x+=16)t.R(x,y,1,8,'#b9bdcc');
  t.R(0,104,W,2,'#8d94a3');
  [56,176].forEach(x=>{t.R(x-6,61,15,17,'rgba(255,243,176,.22)');t.R(x-4,63,11,13,'rgba(255,243,176,.25)');   // 불빛 번짐
    t.R(x,72,3,64,K);t.R(x+1,72,1,63,'#5c6187');t.box(x-3,66,9,7,'#fff3b0');t.R(x-2,67,7,5,'#ffe27a');t.R(x-2,135,7,2,K)});
  // 삼색 고양이
  t.spr(['k...k...','kwkwk...','kwwwk..k','.kwk..kO','.kOwwwOk','.kwOOwwk','.kk.kk..'],124,140,{w:'#fff',O:'#ff8c2e'});
  // benches & tables
  [[96,122],[200,118]].forEach(([x,y])=>{t.box(x,y,24,4,'#c08552','#e2a65b');t.R(x+2,y+4,2,6,K);t.R(x+20,y+4,2,6,K)});
  t.box(64,122,14,3,'#fff');t.R(70,125,2,8,K);
  for(let n=0;n<10;n++){const x=r()*228|0,y=112+(r()*30|0);r()<.6?pot(t,x,y,r):sack(t,x,y,'#cdb98f')}
  [[20,112],[140,116],[228,126]].forEach(([x,y])=>person(t,x,y,r));bush(t,8,108);bush(t,120,108);
}
function drawEco(t){const r=rng(83);
  sky(t,82,['#4aa6ec','#5fb2ef','#78c0f2','#93cef5','#b0dcf8']);
  t.circ(214,16,8,'#ffd23f');t.circ(212,14,5,'#fff3b0');for(let a=0;a<8;a++){const c=Math.cos(a*Math.PI/4),s=Math.sin(a*Math.PI/4);t.R(214+Math.round(c*12),16+Math.round(s*12),2,2,'#ffd23f')}
  cloud(t,28,14,.9);cloud(t,120,22,.7);
  for(let i=-40;i<=40;i++){const h=Math.round(Math.sqrt(1600-i*i)*.55);t.R(150+i,82-h,1,h,'#9cc3e6')}   // 먼 산
  [[132,14],[139,18],[146,14],[60,10],[66,13]].forEach(([x,y])=>{t.R(x,y,3,1,K);t.D(x+1,y-1,K);t.D(x-1,y-1,K);t.D(x+3,y-1,K)});   // 새
  hills(t,82,'#8fd17a','#6cbf5a');
  // wind turbine
  t.R(184,34,3,48,'#fff');t.R(184,34,1,48,'#c9ced6');t.circ(185,33,2,K);t.line(185,33,185,14,'#fff');t.line(185,33,201,42,'#fff');t.line(185,33,169,42,'#fff');t.D(185,33,'#fff');
  // houses with solar roofs
  [[14,60,'#fff8e7'],[100,56,'#f2b880']].forEach(([x,w,wall])=>{const top=38,eave=56;
    t.box(x+4,eave,w-8,34,wall);
    for(let j=0;j<=eave-top;j++){const inset=Math.round((eave-top-j)*0.9);t.R(x+inset,top+j,w-inset*2,1,j===0?K:'#a8303a');t.D(x+inset,top+j,K);t.D(x+w-inset-1,top+j,K)}
    for(let j=4;j<eave-top;j+=4)for(let i=x+Math.round((eave-top-j)*0.9)+3;i<x+w-Math.round((eave-top-j)*0.9)-6;i+=6){t.R(i,top+j,5,3,'#2c6fb0');t.D(i+1,top+j,'#bfe6f5')}
    t.R(x,eave,w,2,K);
    t.box(x+10,64,12,10,'#bfe6f5','#fff');t.box(x+w-24,64,12,10,'#bfe6f5','#fff');t.box(x+w/2-5,72,10,18,'#8a5a3b');t.D(x+w/2+2,81,'#ffc63a')});
  // field
  t.R(0,82,W,68,'#7cc45e');for(let n=0;n<170;n++)t.D(r()*W|0,85+(r()*65|0),r()<.5?'#5cc23c':'#a6e07f');grass(t,82,r);
  for(let x=0;x<W;x+=7){t.R(x,92,2,9,K);t.R(x,92,1,8,'#fff8e7')}t.R(0,95,W,1,K);t.R(0,99,W,1,K);
  [[8,104,84],[8,120,84],[150,112,80]].forEach(([x,y,w])=>{t.box(x,y,w,9,'#8a5a3b','#a87448');for(let i=x+3;i<x+w-3;i+=6){if(r()<.5){t.circ(i+1,y+2,2,'#3f8f2e');t.D(i+1,y+1,'#a6e07f')}else{t.R(i,y-2,1,4,'#5cc23c');t.R(i+2,y-1,1,3,'#5cc23c')}}});
  // barrels, bins, wheelbarrow
  [[100,104,'#4fa3e0'],[114,106,'#2fae90'],[200,100,'#6cc04a']].forEach(([x,y,c])=>{t.box(x,y,10,12,c,'rgba(255,255,255,.5)');t.R(x,y+4,10,1,K)});
  t.box(126,136,16,7,'#c9ced6','#fff');t.circ(130,145,2,K);
  for(let n=0;n<12;n++){const x=r()*228|0,y=126+(r()*18|0),k=r();k<.4?crate(t,x,y):k<.7?pot(t,x,y,r):basket(t,x,y,r)}
  [[70,126],[184,128]].forEach(([x,y])=>person(t,x,y,r));bush(t,228,86);tree(t,234,92,.8);
  // 빗물 저장통
  t.box(78,76,9,15,'#395d85','#5582b3');t.R(77,75,11,2,K);t.R(78,80,9,1,'#2c4a6e');t.R(78,86,9,1,'#2c4a6e');t.R(87,84,2,2,'#ffc63a');t.R(80,70,2,6,'#8d94a3');
  // 아래 들꽃
  [[4,145],[60,146],[174,146]].forEach(([x,y])=>{for(let i=0;i<10;i+=2){t.R(x+i,y-(i%4?1:2),1,4,'#3f9a2a')}t.D(x+1,y-3,'#ffc63a');t.D(x+5,y-3,'#fff');t.D(x+8,y-2,'#f7a8c8')});
}
const Illustrated=(()=>{
const R=(g,x,y,w,h,r,c)=>{g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=c;g.fill();g.stroke()};
const P=(g,p,c)=>{g.beginPath();p.forEach((q,i)=>g[i?'lineTo':'moveTo'](...q));g.closePath();g.fillStyle=c;g.fill();g.stroke()};
const E=(g,x,y,a,b,r,c)=>{g.beginPath();g.ellipse(x,y,a,b,r,0,7);g.fillStyle=c;g.fill();g.stroke()};
const L=(g,a,b,c,d)=>{g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke()};
const DR=[
g=>{R(g,-26,-16,52,54,10,'#c93346');R(g,-31,-30,62,16,7,'#fff');g.fillStyle='#d63c4b';[-22,-8,6,20].forEach(x=>g.fillRect(x,-26,8,8));R(g,-17,4,34,22,4,'#fff3e0');E(g,0,15,8,6,0,'#c93346');R(g,-21,-8,7,36,3,'rgba(255,255,255,.35)')},
g=>{R(g,-34,-4,68,26,4,'#f6f0dd');R(g,-30,-24,64,26,4,'#fff');g.strokeStyle='#4a7fc1';[-18,-10,-2,6,14,22].forEach(x=>L(g,x,-22,x,0));g.strokeStyle='#4a3426';R(g,-34,16,68,10,4,'#d9cfae')},
g=>{E(g,0,22,36,10,0,'#c88a44');P(g,[[-34,-6],[34,-6],[27,26],[-27,26]],'#d9a35f');g.strokeStyle='#a9783b';[2,12,20].forEach(y=>L(g,-30,y,30,y));[-18,-6,6,18].forEach(x=>L(g,x,-4,x,24));g.strokeStyle='#4a3426';R(g,-38,-14,76,11,5,'#b9803f');g.lineWidth=5;g.beginPath();g.arc(0,-14,28,Math.PI,0);g.stroke();g.lineWidth=3},
g=>{R(g,-22,-14,44,52,10,'#5ec4d6');R(g,-8,-26,16,14,3,'#fff');R(g,-8,-38,30,9,3,'#3a8aa0');R(g,-16,2,32,28,4,'#fff');E(g,0,16,9,5,.7,'#5aa05a');L(g,-6,22,6,10)},
g=>{g.lineWidth=5;g.beginPath();g.moveTo(-17,-12);g.bezierCurveTo(-17,-52,17,-52,17,-12);g.stroke();g.lineWidth=3;R(g,-30,-14,60,56,4,'#6f93c4');R(g,-20,2,24,20,2,'#f2c14e');g.setLineDash([4,4]);g.strokeRect(-17,5,18,14);g.setLineDash([]);E(g,12,26,8,8,0,'#e56b6f');L(g,-30,-4,30,-4)},
g=>{R(g,-36,-22,72,44,14,'#f4a6c0');R(g,-28,-14,56,28,9,'#f9c8d8');g.lineWidth=0;E(g,0,0,12,5,.6,'#7bbf6a');g.lineWidth=3;L(g,-8,5,9,-5)},
g=>{R(g,-22,-24,44,62,9,'#4fae8a');R(g,-26,-36,52,14,6,'#2f6f5a');R(g,-22,-4,44,16,0,'#f4f1e6');E(g,0,4,8,4,.5,'#4fae8a');R(g,-8,-48,6,14,3,'#e9c46a')},
g=>{R(g,-20,-40,40,12,4,'#b07a45');R(g,-28,-28,56,64,12,'#f2a81d');R(g,-20,-6,40,26,4,'#fff4d6');E(g,0,7,6,7,0,'#c97d0b');R(g,-23,-20,7,36,3,'rgba(255,255,255,.45)')},
g=>{g.rotate(-.6);R(g,-8,-46,16,70,8,'#e0b878');g.strokeStyle='#a9783b';L(g,-8,-22,8,-22);L(g,-8,-2,8,-2);g.strokeStyle='#4a3426';R(g,-10,22,20,20,4,'#e0b878');R(g,-9,40,18,10,2,'#fff');L(g,-3,42,-3,50);L(g,3,42,3,50)},
g=>{g.rotate(.4);E(g,0,0,38,22,0,'#cdb877');E(g,0,0,26,13,0,'#e3d398');g.strokeStyle='#9b8a4c';[-20,-8,4,16].forEach(x=>{g.beginPath();g.arc(x,0,10,.4,2.7);g.stroke()});g.strokeStyle='#4a3426'}];
const PRODUCT_ART=DR.map(draw=>{const raw=document.createElement('canvas');raw.width=180;raw.height=180;const c=raw.getContext('2d');c.translate(90,90);c.strokeStyle='#4a3426';c.lineWidth=3;c.lineJoin=c.lineCap='round';draw(c);const data=c.getImageData(0,0,180,180).data;let l=180,r=0,t=180,b=0;for(let y=0;y<180;y++)for(let x=0;x<180;x++)if(data[(y*180+x)*4+3]>8){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}return{raw,l,t,w:r-l+1,h:b-t+1}});
function item(g,t,x,y,s=1,rot=0){const a=PRODUCT_ART[t],fit=Math.min(72/a.w,72/a.h),w=a.w*fit*s,h=a.h*fit*s;g.save();g.translate(x,y);g.rotate(rot||0);g.fillStyle='rgba(68,57,36,.14)';g.beginPath();g.ellipse(0,36*s+1,w*.42,2.6*s,0,0,7);g.fill();g.drawImage(a.raw,a.l,a.t,a.w,a.h,-w/2,36*s-h,w,h);g.restore()}
const PAL=['#e76f51','#f4a261','#2a9d8f','#e9c46a','#6a8caf','#c77dff','#52b788','#f28482','#84a59d','#f2a81d'];
const D={
jar:(g,x,y,s,c)=>{R(g,x-14*s,y-34*s,28*s,34*s,6*s,c);R(g,x-16*s,y-42*s,32*s,10*s,3*s,'#e9d8a6')},
bottle:(g,x,y,s,c)=>{R(g,x-11*s,y-34*s,22*s,34*s,6*s,c);R(g,x-5*s,y-48*s,10*s,16*s,2*s,'#fff')},
mug:(g,x,y,s,c)=>{R(g,x-14*s,y-28*s,28*s,28*s,5*s,c);g.beginPath();g.arc(x+16*s,y-15*s,8*s,-1.5,1.5);g.stroke()},
plant:(g,x,y,s,c)=>{[-10,0,10].forEach(a=>E(g,x+a*s,y-44*s+Math.abs(a)*.3*s,8*s,18*s,a*.05,'#5cae55'));P(g,[[x-14*s,y-26*s],[x+14*s,y-26*s],[x+10*s,y],[x-10*s,y]],c)},
box:(g,x,y,s,c)=>{R(g,x-20*s,y-26*s,40*s,26*s,3*s,c);L(g,x,y-26*s,x,y)},
books:(g,x,y,s,c)=>{R(g,x-22*s,y-12*s,44*s,12*s,2*s,c);R(g,x-18*s,y-24*s,40*s,12*s,2*s,'#6a8caf');R(g,x-20*s,y-36*s,36*s,12*s,2*s,'#fff3e0')},
fruit:(g,x,y,s,c)=>{E(g,x-12*s,y-11*s,11*s,11*s,0,c);E(g,x+10*s,y-14*s,11*s,11*s,0,c)},
bag:(g,x,y,s,c)=>{g.beginPath();g.arc(x,y-34*s,10*s,Math.PI,0);g.stroke();R(g,x-18*s,y-32*s,36*s,32*s,4*s,c)},
cloth:(g,x,y,s,c)=>{R(g,x-22*s,y-10*s,44*s,10*s,2*s,c);R(g,x-20*s,y-20*s,40*s,10*s,2*s,'#fff')},
block:(g,x,y,s,c)=>{R(g,x-22*s,y-18*s,44*s,18*s,6*s,c);R(g,x-12*s,y-32*s,26*s,14*s,5*s,'#fff3e0')}};
const DK=Object.keys(D);
function detailedStock(g,kind,x,y,v,scale=.78){
 const ellipse=(x,y,rx,ry,col)=>E(g,x,y,rx,ry,0,col);
 const text=(str,x,y,size,col='#584638')=>{g.fillStyle=col;g.font=`700 ${size}px "Noto Sans CJK KR","Noto Sans KR","Malgun Gothic",sans-serif`;g.textAlign='center';g.fillText(str,x,y)};g.save();g.translate(x,y);g.scale(scale,scale);g.strokeStyle='#65503f';g.lineWidth=2.2;
  const colors=['#c76558','#699e8a','#d0a55e','#8ba6bc','#c49bad'],col=colors[v%5];
  const shine=(x,y,h)=>{g.strokeStyle='#ffffffb0';g.lineWidth=3;L(g,x,y,x,y+h);g.strokeStyle='#65503f';g.lineWidth=2.2};

  // Vary the stock silhouettes instead of repeating one generic object on every shelf.
  if((kind===0||kind===7)&&v%5===2){R(g,-13,-60,26,58,7,kind===7?'#cc9d4e':'#bc785a');R(g,-8,-68,16,9,2,'#d3c2a0');R(g,-11,-32,22,20,2,'#f7efd8');text(kind===7?'NECTAR':'SYRUP',0,-20,6);shine(-8,-52,36)}
  else if(kind===0&&v%5===1){R(g,-27,-24,54,24,3,'#c49c67');for(let j=0;j<4;j++){ellipse(j*12-18,-26,8,9,j%2?'#c97853':'#aeb46b');g.strokeStyle='#785d40';L(g,j*12-18,-34,j*12-15,-40)}g.strokeStyle='#967447';L(g,-23,-12,23,-12);L(g,-23,-5,23,-5)}
  else if(kind===1&&v%3===1){g.strokeStyle='#9c8460';g.beginPath();g.arc(0,-40,17,Math.PI,0);g.stroke();R(g,-26,-38,52,36,3,'#eadcc2');g.strokeStyle='#b7aa8b';for(let j=-18;j<22;j+=7)L(g,j,-33,j,-6);g.strokeStyle='#7c9b6c';ellipse(0,-19,10,5,'#a9c191')}
  else if(kind===2&&v%3===1){for(let j=0;j<3;j++){P(g,[[-29+j*4,-25-j*7],[29-j*4,-25-j*7],[23-j*4,-7-j*7],[-23+j*4,-7-j*7]],j%2?'#e6d7b6':col);g.strokeStyle='#f3e6c6';L(g,-20+j*3,-18-j*7,20-j*3,-18-j*7)}}
  else if(kind===3&&v%3===1){R(g,-15,-48,30,46,6,'#b4cbd1');R(g,-8,-56,16,10,2,'#8babad');P(g,[[-8,-61],[14,-61],[22,-53],[4,-53]],'#7c9ca2');R(g,-11,-33,22,22,3,'#f9f0da');text('CLEAN',0,-20,6);shine(-9,-43,28)}
  else if(kind===4&&v%3===1){for(let j=0;j<3;j++){R(g,-28+j*2,-13-j*12,56-j*4,12,4,j%2?'#e8bd91':col);g.setLineDash([2,3]);L(g,-21,-8-j*12,20,-8-j*12);g.setLineDash([])}R(g,-7,-40,14,39,1,'#eee3bf')}
  else if(kind===5&&v%3===1){R(g,-26,-37,52,35,5,'#c6b48d');R(g,-21,-32,42,25,4,'#e9d7ad');for(let j=-12;j<16;j+=13){ellipse(j,-20,6,8,'#b0b891');g.strokeStyle='#7c9865';L(g,j-2,-16,j+2,-25)}}
  else if(kind===6&&v%3===1){R(g,-23,-35,46,32,6,col);g.beginPath();g.arc(27,-20,10,-1.6,1.6);g.stroke();ellipse(0,-36,23,5,'#f6eed9');g.strokeStyle='#f3e8d1';L(g,-15,-22,14,-22);shine(-15,-28,14)}
  else if(kind===8&&v%3===1){R(g,-17,-64,34,61,3,'#e2d4b2');R(g,-10,-57,20,43,3,'#f5eddb');R(g,-3,-52,6,29,2,'#bca177');R(g,-5,-54,10,12,2,'#fff5de');text('ECO',0,-7,7)}
  else if(kind===9&&v%3===1){R(g,-27,-29,54,25,5,'#c3b488');R(g,-23,-24,46,15,3,'#e3d7ae');g.strokeStyle='#b3a16e';for(let j=-18;j<20;j+=6){L(g,j,-24,j+9,-10);L(g,j,-10,j+9,-24)}}
  else if(kind===0||kind===7){R(g,-17,-42,34,42,7,kind===7?'#dca858':col);R(g,-20,-49,40,10,3,'#ddcfac');R(g,-13,-29,26,18,3,'#fff3d8');text(kind===7?'HONEY':'LOCAL',0,-17,7);ellipse(0,-19,4,4,kind===7?'#c07b35':'#a85150');shine(-11,-37,26);if(v%2){g.strokeStyle='#b88150';L(g,17,-36,29,-44);R(g,24,-53,10,13,3,'#c58e54')}}
  else if(kind===1){for(let j=0;j<3;j++){R(g,-28+j*2,-12-j*12,56-j*4,12,3,j%2?'#f8efdb':col);g.strokeStyle='#b7a789';for(let x=-23;x<24;x+=7)L(g,x,-8-j*12,x+3,-8-j*12)}g.strokeStyle='#65503f';R(g,-12,-52,25,15,2,'#d3e1c8');L(g,-7,-44,8,-44)}
  else if(kind===2){g.beginPath();g.moveTo(-14,-43);g.bezierCurveTo(-14,-15,-31,-12,-22,-2);g.quadraticCurveTo(0,7,22,-2);g.bezierCurveTo(30,-15,12,-21,13,-43);g.closePath();g.fillStyle=col;g.fill();g.stroke();R(g,-15,-47,30,7,3,'#eadcc3');g.strokeStyle='#f2e3c8';for(let j=0;j<3;j++)L(g,-18,-13-j*8,18,-13-j*8);shine(-12,-34,17)}
  else if(kind===3){P(g,[[-21,-3],[-19,-40],[-10,-51],[12,-51],[22,-38],[20,-3]],v%2?'#cce1bb':'#e6d4a9');R(g,-11,-52,24,6,2,'#719d8b');R(g,-16,-31,32,21,3,'#fff6df');ellipse(0,-21,7,4,'#78a27c');shine(-13,-38,25);text('REFILL',0,-7,6)}
  else if(kind===4){R(g,-25,-35,50,33,6,col);R(g,-16,-48,32,13,4,'#cfb58d');R(g,-14,-27,21,17,2,'#f0dba8');g.setLineDash([3,3]);g.strokeRect(-21,-31,42,25);g.setLineDash([]);g.strokeStyle='#b96e68';L(g,-9,-22,2,-15);L(g,-9,-15,2,-22)}
  else if(kind===5){for(let j=0;j<2;j++){R(g,-26+j*4,-18-j*18,52-j*8,17,5,j?'#e7d8ad':'#ede5cc');R(g,-7,-35,14,34,1,col)}g.strokeStyle='#799361';L(g,17,-38,31,-58);ellipse(23,-49,5,3,'#8eae78');ellipse(29,-54,5,3,'#8eae78')}
  else if(kind===6){R(g,-17,-50,34,48,6,v%2?'#b7c7d2':'#d4d9c9');R(g,-20,-53,40,8,3,col);R(g,-18,-26,36,14,1,col);g.beginPath();g.arc(20,-27,11,-Math.PI/2,Math.PI/2);g.stroke();shine(-10,-42,29)}
  else if(kind===8){R(g,-21,-27,42,26,4,'#c7ab78');for(let j=0;j<4;j++){R(g,-15+j*9,-62+(j%2)*5,5,37,2,'#dcc59e');R(g,-16+j*9,-65+(j%2)*5,7,13,2,'#fff2d5');g.strokeStyle='#b4a58c';L(g,-14+j*9,-62+(j%2)*5,-14+j*9,-55+(j%2)*5)}text('BAMBOO',0,-10,6)}
  else if(kind===9){ellipse(0,-13,29,12,'#be9c65');ellipse(0,-17,29,12,'#eadcb8');g.strokeStyle='#b39c70';for(let j=-18;j<=18;j+=6){L(g,j,-25,j+9,-10);L(g,j,-10,j+9,-25)}g.strokeStyle='#65503f';L(g,23,-13,35,-34);R(g,31,-43,10,15,4,'#b99262')}
  else{D.plant(g,0,0,1,col);g.strokeStyle='#fff4d9';L(g,-6,-49,-2,-29);R(g,19,-34,23,33,2,'#efe1b9');text('SEEDS',30,-14,5)}
  // Small paper price tag with a string, a crease and handwritten lines.
  g.strokeStyle='#9a8167';L(g,15,-4,28,4);R(g,19,1,21,12,2,'#fff7e3');g.strokeStyle='#bf9e78';L(g,24,5,35,5);L(g,24,8,32,8);g.restore();
 }

// A detailed riverside market with mixed product displays.
function richMarket(){
 const make=()=>{const a=document.createElement('canvas');a.width=1920;a.height=1080;return a};
 const b=make(),f=make(),g=b.getContext('2d'),fg=f.getContext('2d'),s=[],booths=[];
 g.lineJoin=g.lineCap='round';g.lineWidth=3;g.strokeStyle='#604b3d';
 const ellipse=(x,y,rx,ry,col)=>E(g,x,y,rx,ry,0,col);
 const text=(str,x,y,size,col='#584638')=>{g.fillStyle=col;g.font=`700 ${size}px "Noto Sans CJK KR","Noto Sans KR","Malgun Gothic",sans-serif`;g.textAlign='center';g.fillText(str,x,y)};
 const gradient=g.createLinearGradient(0,0,0,500);gradient.addColorStop(0,'#ffe2ba');gradient.addColorStop(1,'#d2edf0');g.fillStyle=gradient;g.fillRect(0,0,1920,1080);
 g.save();g.strokeStyle='#ecb74b';g.lineWidth=5;for(let a=0;a<12;a++){const t=a*Math.PI/6;L(g,1580+Math.cos(t)*81,120+Math.sin(t)*81,1580+Math.cos(t)*98,120+Math.sin(t)*98)}g.strokeStyle='#e9b247';ellipse(1580,120,64,64,'#ffdc69');g.strokeStyle='#fff1b6';ellipse(1564,101,26,24,'#ffe994');g.restore();
 [[250,88],[810,65],[1300,116]].forEach(([x,y])=>{g.save();g.strokeStyle='#ffffff';[[0,0,38],[42,6,30],[-36,9,27]].forEach(([dx,dy,r])=>ellipse(x+dx,y+dy,r,r*.65,'#fffdf4'));g.restore()});
 for(let i=0;i<29;i++){const x=i*69,h=52+(i*37)%80,y=290-h;R(g,x,y,60,h,2,['#b5c9d8','#b9cdd9','#c5c9db'][i%3]);g.strokeStyle='#a0b9c8';for(let j=0;j<3;j++)for(let k=0;k<Math.floor(h/21);k++)R(g,x+8+j*17,y+8+k*21,8,11,1,(j+k)%3?'#eaf4ee':'#fff1bd');g.strokeStyle='#604b3d'}
 g.fillStyle='#80bed5';g.fillRect(0,290,1920,155);g.strokeStyle='#cfebee';g.lineWidth=2;for(let i=0;i<80;i++){const x=(i*163)%1920,y=310+(i*29)%115;L(g,x,y,x+18+(i%4)*7,y)}
 g.strokeStyle='#869baf';R(g,0,272,1920,16,0,'#d7d9d2');for(let x=55;x<1920;x+=245){R(g,x,288,15,72,1,'#adbcc2');g.beginPath();g.arc(x+110,331,105,Math.PI,0);g.stroke()}for(let x=0;x<1920;x+=25)L(g,x,256,x,273);L(g,0,256,1920,256);
 [[510,397],[1320,383]].forEach(([x,y],i)=>{g.save();g.translate(x,y);g.scale(i?.86:1,i?.86:1);g.strokeStyle='#779fab';g.lineWidth=2;for(let q=0;q<3;q++)L(g,-57-q*9,24+q*7,48+q*9,24+q*7);g.strokeStyle='#947f60';P(g,[[-57,0],[46,0],[36,21],[-42,21]],'#f3d087');ellipse(-5,-7,52,17,'#fff9e9');g.beginPath();g.moveTo(29,-6);g.bezierCurveTo(61,-17,26,-47,52,-59);g.bezierCurveTo(72,-68,86,-44,67,-34);g.lineTo(58,-27);g.lineTo(54,-5);g.fillStyle='#fff9e9';g.fill();g.stroke();P(g,[[71,-50],[92,-44],[72,-40]],'#eda75d');ellipse(68,-52,2,2,'#665848');R(g,-37,-38,56,26,9,'#b4c5ab');[-23,4].forEach((xx,j)=>{ellipse(xx,-31,7,8,'#edc6a0');R(g,xx-7,-23,14,15,5,j?'#d89d89':'#8aa0ad')});L(g,-40,-44,22,-44);g.restore()});
 g.strokeStyle='#73834b';g.fillStyle='#a8c77b';g.fillRect(0,435,1920,645);g.fillStyle='#edd7ac';g.beginPath();g.moveTo(0,704);g.bezierCurveTo(560,660,1340,715,1920,690);g.lineTo(1920,764);g.bezierCurveTo(1300,750,600,733,0,775);g.closePath();g.fill();
 for(let i=0;i<160;i++){const x=(i*137)%1920,y=450+(i*73)%630;g.strokeStyle=i%4?'#92af66':'#c9d79a';L(g,x,y,x+5,y-6);if(i%9===0){ellipse(x+3,y-7,3,3,'#fff5cf')}}

 // Korean red pine: a curved bark trunk, exposed spreading branches, and layered needle crowns.
 const tree=(x,y,z)=>{g.save();g.translate(x,y);g.scale(z,z);g.strokeStyle='#705c43';g.lineWidth=3;
  P(g,[[-10,4],[-6,-31],[3,-66],[0,-105],[8,-129],[14,-124],[10,-101],[14,-70],[5,-31],[7,4]],'#a07850');
  g.strokeStyle='#bc9564';g.lineWidth=2;L(g,-3,-5,0,-28);L(g,3,-42,7,-63);L(g,5,-80,4,-104);g.strokeStyle='#72543f';L(g,3,-9,6,-25);L(g,1,-42,3,-54);L(g,8,-82,7,-95);
  [[-46,-106,0,-64],[44,-128,7,-89],[-25,-147,7,-103],[17,-163,7,-119]].forEach(([a,b,c,d])=>{g.strokeStyle='#8b6949';g.lineWidth=6;g.beginPath();g.moveTo(c,d);g.quadraticCurveTo(a*.4,b+19,a,b);g.stroke();g.strokeStyle='#b08a59';g.lineWidth=2;g.beginPath();g.moveTo(c,d-2);g.quadraticCurveTo(a*.4,b+16,a,b-2);g.stroke()});
  const pads=[[-46,-113,39,19,'#3d6e52'],[42,-134,43,19,'#406f51'],[-24,-151,42,20,'#3d7554'],[16,-175,38,20,'#477e58']];
  pads.forEach(([cx,cy,rx,ry,col],n)=>{g.beginPath();for(let j=0;j<=28;j++){const a=j/28*Math.PI*2,f=1+.09*Math.sin(j*2.8+n);const xx=cx+Math.cos(a)*rx*f,yy=cy+Math.sin(a)*ry*f;g[j?'lineTo':'moveTo'](xx,yy)}g.closePath();g.fillStyle=col;g.fill();g.strokeStyle='#345943';g.lineWidth=2;g.stroke();
   for(let q=0;q<21;q++){const px=cx-rx*.78+((q*17+n*9)%(rx*1.55)),py=cy-ry*.6+((q*11+n*7)%(ry*1.15));g.strokeStyle=q%3?'#61906b':'#82a478';g.lineWidth=1.1;L(g,px,py,px-4,py-5);L(g,px,py,px,py-6);L(g,px,py,px+4,py-4)}
  });g.restore()};
 tree(35,490,1.05);tree(1870,492,1.1);tree(1010,448,.6);
 // Detailed decoys share the outline, labels, texture and highlights of the targets.
 const stock=(...args)=>detailedStock(g,...args);
 const titles=['로컬 라이프','우리 동네 공방','다정한 나눔상점','제로웨이스트 마켓','함께하는 생활상점'];
 const awnings=['#c56c64','#709d8b','#c4a063','#749bad','#ab879b'];
 for(let n=0;n<5;n++){
  const row=n<3?0:1,idx=row?n-3:n,x=row?380+idx*650:70+idx*630,y=row?910:650,w=400,top=y-184,col=awnings[n];
  booths.push({index:n,x,y,width:w,title:titles[n],targets:[n*2,n*2+1]});
  g.strokeStyle='#725945';ellipse(x+w/2,y+68,210,12,'#73915555');R(g,x+7,top+30,7,223,2,'#b88c5c');R(g,x+w-14,top+30,7,223,2,'#b88c5c');R(g,x+13,top+44,w-26,115,2,'#f4e4c4');
  for(let j=0;j<12;j++){const sw=w/12;P(g,[[x+j*sw-8,top],[x+(j+1)*sw-8,top],[x+(j+1)*sw+6,top+41],[x+j*sw+6,top+41]],j%2?'#fff3df':col);R(g,x+j*sw+6,top+41,sw,10,3,j%2?'#fff3df':col)}
  L(g,x+60,top+49,x+60,top+62);L(g,x+w-60,top+49,x+w-60,top+62);R(g,x+45,top+60,w-90,33,6,'#fff3d6');R(g,x+51,top+65,w-102,23,4,'#fff8e7');text(titles[n],x+w/2,top+83,20,'#634b39');
  R(g,x+14,y-43,w-28,8,2,'#b4885e');R(g,x+13,y+4,w-26,48,3,col);R(g,x+8,y,w-16,10,3,'#dfbc87');
  // Every shop mixes ceramics, textiles, refills, food, brushes and plants.
  for(let j=0;j<7;j++)stock((n*3+j*2)%11,x+35+j*55,y-47,(j+n)%5,.82);
  [45,175,240,370].forEach((dx,j)=>stock((n*5+j*3+4)%11,x+dx,y-4,j+2,.94));
  s.push([x+110,y-27],[x+305,y-27]);
  g.strokeStyle='#ffffff70';for(let q=x+20;q<x+w-15;q+=13)L(g,q,y+13,q,y+46);g.strokeStyle='#6a5943';R(g,x+15,y+17,40,25,3,'#415b50');text('LOCAL',x+35,y+32,7,'#fff1ce');
  R(g,x+w-55,y+18,36,24,2,'#e4cca0');g.setLineDash([2,3]);g.strokeRect(x+w-52,y+21,30,18);g.setLineDash([]);
  for(let q=0;q<3;q++){R(g,x+75+q*82,y+30,63,26,3,q%2?'#e2cca6':'#c5a06d');for(let j=0;j<4;j++)L(g,x+81+q*82+j*13,y+33,x+81+q*82+j*13,y+53)}
  fg.fillStyle='#d9b37e';[110,305].forEach(dx=>fg.fillRect(x+dx-21,y+3,43,4));
 }
 // Market welcome board and foreground picnic blankets.
 g.strokeStyle='#65513e';R(g,20,396,210,40,6,'#426f63');text('한강 플리마켓',125,424,23,'#fff4dd');L(g,48,436,48,471);L(g,199,436,199,471);
 [[280,1012,230,'#d69b8d'],[1250,1014,230,'#8eaaa2']].forEach(([x,y,w,col])=>{P(g,[[x+20,y-18],[x+w,y-18],[x+w-20,y+43],[x,y+43]],col);g.strokeStyle='#f0dfb9';for(let j=0;j<7;j++)L(g,x+20+j*29,y-18,x+j*29,y+43);g.strokeStyle='#65513e';D.bag(g,x+63,y+9,1.2,'#e8d4ac');stock(10,x+150,y+16,2,.8)});
 function person(x,y,col,child=false){g.save();g.translate(x,y);g.scale(child?.76:1,child?.76:1);g.strokeStyle='#65503f';R(g,-18,-66,36,45,11,col);R(g,-13,-22,10,27,4,'#53677a');R(g,3,-22,10,27,4,'#53677a');ellipse(0,-84,16,18,'#f1c9a5');ellipse(-3,-96,17,9,'#66503e');ellipse(-5,-84,1.4,1.8,'#574337');ellipse(6,-84,1.4,1.8,'#574337');g.beginPath();g.arc(1,-79,4,.2,2.8);g.stroke();L(g,-17,-54,-30,-38);L(g,17,-54,30,-37);g.restore()}
 person(74,733,'#d49f76');person(1490,721,'#89a5b0');person(1190,1001,'#9b94aa');
 // Families seated on picnic mats, with bent legs, baskets, food and cups.
 [[110,914,'#d9b393'],[1580,942,'#9db6ac']].forEach(([x,y,col],i)=>{g.strokeStyle='#8f8661';P(g,[[x-55,y+18],[x+150,y+10],[x+174,y+89],[x-76,y+93]],col);g.strokeStyle='#f1dfb8';for(let j=0;j<7;j++)L(g,x-44+j*29,y+18,x-55+j*32,y+90);g.strokeStyle='#65503f';
  [0,88].forEach((dx,j)=>{R(g,x+dx-15,y-12,31,38,10,j?'#95a5b0':'#cb9989');ellipse(x+dx,y-29,14,16,'#edc5a1');ellipse(x+dx-2,y-40,15,7,'#6d5740');P(g,[[x+dx-12,y+22],[x+dx+13,y+22],[x+dx+32,y+40],[x+dx+20,y+48],[x+dx,y+34],[x+dx-22,y+44],[x+dx-29,y+36]],'#7d8a96');L(g,x+dx+13,y-4,x+dx+33,y+20)});
  stock(0,x+43,y+48,1,.7);stock(6,x+110,y+67,1,.5);stock(2,x-32,y+60,1,.65);D.bag(g,x+154,y+46,.85,'#e4d1ab')});
 for(let i=0;i<36;i++){const x=25+(i*53)%1850,y=1028+(i%4)*10;g.strokeStyle=i%2?'#6a914e':'#86a35d';g.lineWidth=2;L(g,x,y,x-5,y-18);L(g,x,y,x+2,y-24);L(g,x,y,x+8,y-15)}
 // A child visibly holds the single balloon; there are no floating sky balloons.
 person(1820,990,'#d7988f',true);g.strokeStyle='#8c7364';g.lineWidth=2;g.beginPath();g.moveTo(1842,963);g.bezierCurveTo(1854,922,1833,879,1848,842);g.stroke();g.strokeStyle='#80685a';ellipse(1848,810,22,30,'#e5b66e');ellipse(1841,800,5,11,'#fff0c2');P(g,[[1844,839],[1852,839],[1850,847]],'#d4a15d');
 person(859,1039,'#d3a36e');ellipse(881,1003,24,29,'#c49358');ellipse(870,978,19,22,'#d8ad70');R(g,873,923,9,72,3,'#98693e');ellipse(875,990,7,7,'#69513b');g.strokeStyle='#f2d5a4';L(g,877,931,879,1020);g.strokeStyle='#65513e';R(g,945,1014,50,29,5,'#69798b');L(g,954,1014,954,946);ellipse(954,944,7,4,'#69798b');
 ellipse(1625,1030,30,16,'#e7c99f');ellipse(1651,1013,16,18,'#e7c99f');ellipse(1640,1010,6,14,'#b48963');L(g,1598,1027,1587,1015);L(g,1611,1041,1611,1054);L(g,1634,1041,1634,1054);ellipse(1656,1012,2,2,'#604733');
 return {b,f,s,booths};
}

function naturalTree(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#71563e';c.lineWidth=3;P(c,[[-10,2],[-7,-45],[-15,-85],[-6,-111],[4,-108],[1,-79],[13,-45],[10,2]],'#a18158');c.strokeStyle='#bb9a6b';L(c,-3,-3,-1,-41);L(c,-7,-66,-8,-87);c.strokeStyle='#866748';c.lineWidth=6;[[-43,-104],[-19,-139],[34,-120],[51,-92]].forEach(([a,b])=>{c.beginPath();c.moveTo(0,-58);c.quadraticCurveTo(a*.4,-99,a,b);c.stroke()});
 [[-42,-113,39,35],[2,-150,48,41],[43,-117,44,36],[-9,-108,49,35]].forEach(([cx,cy,rx,ry],n)=>{c.beginPath();for(let j=0;j<=26;j++){const a=j/26*Math.PI*2,r=1+.08*Math.sin(j*3.3+n);c[j?'lineTo':'moveTo'](cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r)}c.closePath();c.fillStyle=['#659568','#6e9e6c','#689b67','#78a970'][n];c.fill();c.strokeStyle='#507c55';c.lineWidth=2;c.stroke();for(let j=0;j<15;j++){const dx=cx-rx*.65+(j*17)%(rx*1.3),dy=cy-ry*.65+(j*13)%(ry*1.3);c.strokeStyle=j%3?'#93b57f':'#537c53';c.lineWidth=2;L(c,dx,dy,dx+5,dy-3);L(c,dx+1,dy+5,dx+7,dy+3)}});c.restore()}
function gardenFlowers(c,x,y,tulip=false){c.save();c.strokeStyle='#698446';c.lineWidth=3;for(let j=0;j<3;j++){const xx=x+j*17,yy=y-(j%2)*9;L(c,xx,yy,xx,yy-57);E(c,xx-7,yy-23,11,4,-.6,'#799d54');E(c,xx+7,yy-32,11,4,.5,'#90aa5b');if(tulip){P(c,[[xx-9,yy-68],[xx-3,yy-62],[xx+2,yy-71],[xx+6,yy-63],[xx+10,yy-69],[xx+8,yy-55],[xx,yy-51],[xx-8,yy-56]],j%2?'#e6b176':'#cf8192')}else{for(let q=0;q<9;q++){const a=q/9*Math.PI*2;E(c,xx+Math.cos(a)*10,yy-61+Math.sin(a)*10,6,4,a,'#edc35c')}E(c,xx,yy-61,7,7,0,'#987548');c.strokeStyle='#6f573c';L(c,xx-2,yy-63,xx+2,yy-59);c.strokeStyle='#698446'}}c.restore()}

// Products are assigned to explicit support surfaces; decorations never overlap target slots.
function orderedScene(kind){
 const make=()=>{const a=document.createElement('canvas');a.width=1920;a.height=1080;return a};
 const b=make(),f=make(),c=b.getContext('2d'),s=[],surfaces=[];c.lineJoin=c.lineCap='round';c.lineWidth=3;c.strokeStyle='#6b5948';
 const text=(str,x,y,size=26,col='#66513e')=>{c.fillStyle=col;c.font=`700 ${size}px "Noto Sans CJK KR","Noto Sans KR","Malgun Gothic",sans-serif`;c.textAlign='center';c.fillText(str,x,y)};
 const target=(x,shelf)=>{s.push([x,shelf-31.68]);surfaces.push({x,y:shelf})};
 const shelf=(x,y,w)=>{c.strokeStyle='#8c7051';R(c,x,y,w,9,2,'#c3a177');c.strokeStyle='#ebd4ad';L(c,x+3,y+2,x+w-3,y+2);c.strokeStyle='#6b5948'};
 const stock=(type,x,y,v=0,scale=.87)=>detailedStock(c,type,x,y,v,scale);
 const person=(x,y,col,seated=false)=>{c.save();c.translate(x,y);c.strokeStyle='#78604a';R(c,-17,-69,34,43,10,col);E(c,0,-86,16,18,0,'#edc6a2');E(c,-3,-99,16,7,0,'#6d5844');if(seated){P(c,[[-14,-27],[14,-27],[37,-8],[26,1],[1,-14],[-23,1],[-36,-7]],'#8395a0')}else{R(c,-12,-27,10,30,3,'#78899a');R(c,3,-27,10,30,3,'#78899a')}L(c,-17,-56,-29,-32);L(c,17,-56,29,-32);c.restore()};
 const bench=(x,y,w)=>{c.strokeStyle='#8b7455';for(let j=0;j<3;j++)R(c,x,y-65+j*16,w,12,3,'#b69a70');R(c,x-5,y-5,w+10,12,3,'#c4a77e');R(c,x+17,y+8,11,43,2,'#816e54');R(c,x+w-29,y+8,11,43,2,'#816e54');shelf(x-5,y,w+10)};
 const clearSky=()=>{const gr=c.createLinearGradient(0,0,0,600);gr.addColorStop(0,'#cde8ed');gr.addColorStop(1,'#eff0d8');c.fillStyle=gr;c.fillRect(0,0,1920,1080);c.strokeStyle='#fff9ee';[[270,110],[950,80],[1550,145]].forEach(([x,y])=>{E(c,x,y,62,25,0,'#fff9ee');E(c,x+44,y+5,45,22,0,'#fff9ee')})};
 if(kind===1){
  clearSky();c.fillStyle='#a7bf88';c.beginPath();c.moveTo(0,470);c.bezierCurveTo(460,330,700,445,1000,420);c.bezierCurveTo(1400,340,1600,360,1920,480);c.lineTo(1920,1080);c.lineTo(0,1080);c.fill();
  c.fillStyle='#bed099';c.fillRect(0,490,1920,590);c.strokeStyle='#ede0bd';c.lineWidth=82;c.beginPath();c.moveTo(30,1020);c.bezierCurveTo(780,1050,640,480,1190,570);c.bezierCurveTo(1460,630,1620,820,1950,830);c.stroke();c.lineWidth=3;
  [[145,565,.95],[785,500,.72],[1320,490,.8],[1780,645,1.05]].forEach(([x,y,z])=>naturalTree(c,x,y,z));
  // One clear pond, bounded by natural stones and small reeds.
  c.strokeStyle='#78999c';E(c,400,800,285,135,-.04,'#8fc1c9');E(c,390,785,257,110,-.04,'#9ecbd0');
  c.strokeStyle='#8c8978';for(let i=0;i<25;i++){const a=i/25*Math.PI*2,x=400+Math.cos(a)*290,y=800+Math.sin(a)*139;E(c,x,y,11+i%4*3,7+i%3,.2*Math.sin(i),['#b1afa1','#c4beaa','#aaa99b'][i%3]);c.strokeStyle='#ddd3bd';L(c,x-5,y-3,x+6,y-4);c.strokeStyle='#8c8978'}
  c.strokeStyle='#d0e7e3';[[-120,15],[35,-30],[-25,55]].forEach(([x,y])=>L(c,400+x,800+y,460+x,800+y));
  [[300,756],[459,838],[520,737]].forEach(([x,y])=>{c.strokeStyle='#658e65';E(c,x,y,23,8,.12,'#8ba971')});
  c.strokeStyle='#729060';for(let j=0;j<9;j++){const x=140+j*9,y=815+(j%3)*7;L(c,x,y,x-4,y-36);L(c,x,y,x+8,y-32)}
  // Products rest on benches, a picnic table, a mat and a basket lid.
  bench(180,590,250);target(245,590);target(365,590);stock(1,417,589,1,.45);
  bench(1460,665,255);target(1515,665);target(1645,665);
  R(c,1150,812,260,46,4,'#d4bb90');R(c,1172,855,13,65,3,'#998366');R(c,1377,855,13,65,3,'#998366');shelf(1140,810,280);target(1210,810);target(1340,810);
  c.strokeStyle='#ae9580';P(c,[[740,898],[1035,898],[1080,1000],[705,1000]],'#d5b5a2');c.strokeStyle='#ead8bc';for(let j=0;j<8;j++)L(c,747+j*39,899,715+j*49,998);
  target(786,965);target(886,965);target(986,965);person(782,913,'#ab9283',true);person(993,913,'#829aa5',true);
  c.strokeStyle='#987f5e';R(c,574,925,100,36,5,'#c5ab80');for(let j=0;j<6;j++)L(c,580+j*16,930,580+j*16,956);shelf(572,930,104);target(623,930);
  // Park furniture and planting stay beside paths and water.
  c.strokeStyle='#8d795c';R(c,897,535,155,77,7,'#f4e5c4');R(c,923,612,9,42,2,'#a58b65');R(c,1015,612,9,42,2,'#a58b65');text('공원 안내',974,559,17);R(c,911,570,126,28,2,'#c2d1a9');c.strokeStyle='#fff5d8';L(c,920,586,969,576);L(c,969,576,1026,589);
  [[76,618,false],[715,1040,true],[1760,915,false]].forEach(([x,y,t])=>gardenFlowers(c,x,y,t));
  person(1130,636,'#aa9e85');person(1690,852,'#b5a38e');
  c.strokeStyle='#8da16a';for(let i=0;i<30;i++){const x=40+(i*127)%1830,y=1005+(i%4)*14;if(x>680&&x<1100)continue;L(c,x,y,x-4,y-12);L(c,x,y,x+5,y-9)}
 }
 if(kind===2){
  clearSky();c.fillStyle='#aabd98';c.fillRect(0,265,1920,815);c.fillStyle='#e7dccc';c.fillRect(0,675,1920,405);c.strokeStyle='#ccbfab';for(let y=730;y<1080;y+=65)L(c,0,y,1920,y);for(let x=0;x<1920;x+=90)L(c,x,681,x+70,1080);
  const names=['동네 빵집','꽃과 정원','마을 책방','손길 공방','우리 마을카페'];
  for(let i=0;i<5;i++){const x=30+i*377,w=350,col=['#e8c7a4','#cbd7c3','#c9d3dc','#d9c7c1','#e5d8b1'][i];c.strokeStyle='#92765c';R(c,x,339,w,341,5,col);P(c,[[x-9,339],[x+w+9,339],[x+w-18,284],[x+18,284]],'#ab7963');for(let y=299;y<334;y+=12)for(let q=20;q<330;q+=38)L(c,x+q,y,x+q+25,y);
   R(c,x+42,359,w-84,40,5,'#fff0d6');text(names[i],x+w/2,387,24);R(c,x+22,435,w-44,230,5,'#f7edda');
   for(let j=0;j<8;j++){const sw=(w-32)/8;P(c,[[x+16+j*sw,412],[x+16+(j+1)*sw,412],[x+20+(j+1)*sw,442],[x+20+j*sw,442]],j%2?'#f9eddb':['#af7e70','#7c9a82','#8196a2','#a99098','#ad9f76'][i])}
   shelf(x+23,565,w-46);shelf(x+23,655,w-46);
   // Keep a full product width between each slot; all bases touch the shelf.
   [65,235,295].forEach((dx,j)=>stock((i*2+j*3)%11,x+dx,564,j,.76));
   [65,125,190].forEach((dx,j)=>stock((i*3+j*2+4)%11,x+dx,654,j+1,.76));
   target(x+140,565);target(x+278,655);
   c.strokeStyle='#ab9677';R(c,x+9,678,55,24,3,'#bea788');gardenFlowers(c,x+17,679,i%2===0);
  }
  // A small street market leaves a clear walkway in front of the permanent shops.
  [100,755,1410].forEach((x,i)=>{const y=888,w=360;c.strokeStyle='#987e5e';R(c,x+9,y-95,7,142,2,'#b89d78');R(c,x+w-16,y-95,7,142,2,'#b89d78');for(let j=0;j<8;j++)P(c,[[x+j*45,y-126],[x+(j+1)*45,y-126],[x+(j+1)*45+5,y-93],[x+j*45+5,y-93]],j%2?'#f4ebda':['#a78b7b','#899c8d','#8e9faa'][i]);R(c,x,y+8,w,43,3,'#b9a485');shelf(x-3,y,w+6);for(let j=0;j<5;j++)stock((i*3+j*2)%11,x+38+j*70,y-1,j,.88)});
  person(600,832,'#9ca991');person(1215,950,'#aa9586');person(1800,956,'#8a9ba0');
  c.strokeStyle='#8b7157';R(c,520,840,95,54,4,'#536e60');text('마을 장터',567,874,16,'#fff0d7');L(c,533,894,527,924);L(c,601,894,607,924);
  R(c,1860,836,42,70,6,'#ad7770');R(c,1853,829,56,12,3,'#c49185');R(c,1869,851,24,4,1,'#6c564a');L(c,1880,906,1880,942);
  // Cafe terrace and a parked bicycle stay outside the display area.
  R(c,1078,966,74,10,3,'#bca780');L(c,1115,976,1115,1024);[1040,1180].forEach(x=>{R(c,x,951,35,34,4,'#c8b38d');R(c,x-3,987,41,7,2,'#af9772');L(c,x+3,994,x,1020);L(c,x+29,994,x+34,1020)});
 }
 if(kind===3){
  c.fillStyle='#e3e7ed';c.fillRect(0,0,1920,1080);c.strokeStyle='#b6c1cd';c.lineWidth=4;for(let x=-100;x<1920;x+=180){L(c,x,0,x+90,110);L(c,x+90,110,x+180,0)}L(c,0,114,1920,114);c.lineWidth=2;for(let x=80;x<1920;x+=160){E(c,x,142,9,6,0,'#fff3c9')}
  // One long banner, drawn once, with no separate side panels.
  c.strokeStyle='#506f82';R(c,120,185,1680,105,6,'#50798a');text('사회연대경제 박람회',960,254,46,'#fff4dc');
  c.fillStyle='#d7dce1';c.fillRect(0,700,1920,380);c.strokeStyle='#c0c8cf';for(let y=750;y<1080;y+=75)L(c,0,y,1920,y);for(let x=-200;x<2100;x+=160)L(c,x,700,960+(x-960)*1.4,1080);
  const names=['협동조합','사회적기업','마을기업','공정무역','소셜벤처'];
  for(let i=0;i<5;i++){const x=60+i*370,w=320,col=['#9aafa3','#bea68e','#8fa8b6','#b49ba5','#a9ad86'][i];c.strokeStyle='#87939a';R(c,x,360,w,327,3,'#f7f4eb');R(c,x,360,w,48,3,col);text(names[i],x+w/2,394,26,'#fffaf0');
   shelf(x+13,523,w-26);shelf(x+13,641,w-26);
   [55,226,280].forEach((dx,j)=>stock((i*2+j*3)%11,x+dx,522,j,.78));[46,103,165].forEach((dx,j)=>stock((i*3+j*2+5)%11,x+dx,640,j,.78));
   target(x+141,523);target(x+260,641);
   R(c,x,653,w,34,2,col);text('SOCIAL ECONOMY',x+w/2,676,12,'#fffaf1');
  }
  // Low demonstration counters stand well below the main shelves.
  [125,695,1265].forEach((x,i)=>{c.strokeStyle='#969d9d';R(c,x,834,475,61,4,['#b2b9a7','#c5b299','#a4b5bd'][i]);shelf(x-5,832,485);for(let j=0;j<6;j++)stock((i*4+j*2)%11,x+43+j*77,831,j,.85)});
  c.strokeStyle='#7d929c';R(c,764,985,390,61,6,'#7194a3');text('안내 · 접수',959,1023,26,'#fff4df');person(820,971,'#b09c86');person(1080,971,'#91a4aa');
  [60,1810].forEach((x,i)=>{R(c,x,863,66,144,3,i?'#c5ae8e':'#91a9a7');text('EXPO',x+33,903,14,'#fff6e7');R(c,x-8,1007,82,7,3,'#88989b')});
  person(403,1002,'#b3a38c');person(1350,1016,'#9aabab');person(1620,975,'#b79991');
 }
 return {b,f,s,surfaces,ordered:true};
}

function mk(k){return k===0?richMarket():orderedScene(k)}

return {mk,item};})();

const IKEYS=['jam','tote','giftbox','detergent','upcycle','soap','tumbler','honey','toothbrush','scrubber'];
// Each rectangle identifies an object painted directly into its scene, not a sticker overlay.
const BAKED_TARGETS={
 market:[[767,378,76,54],[409,393,76,48],[535,449,66,64],[1475,443,62,66],[1098,452,53,56],[237,524,39,27],[748,731,44,65],[1090,647,55,57],[1270,789,78,74],[1038,405,64,39]],
 park:[[221,260,69,49],[1034,646,82,50],[282,198,75,67],[910,483,62,65],[61,547,72,79],[348,650,64,39],[1557,151,46,73],[1355,649,51,52],[604,752,70,66],[1144,850,68,41]],
 town:[[118.07,656,71.04,47],[979.62,491,66.04,43],[1007.64,678,62.04,64],[309,704,56,59],[1432.9,570,60.04,68],[1254.79,586,62.04,37],[872,802,49,76],[855,535,48,50],[208.13,599,63.04,61],[1201,539,51,31]],
 kintex:[[81.95,738,82.95,58],[1392.17,388,110.93,47],[1040,329,68,68],[281,328,46,47],[1528,467,55,65],[450.73,493,65.96,37],[1439.14,732,63.96,85],[102,474,54,56],[1191,326,73,71],[503,361,63,37]]
};
const SCENE_PIXELS={"market":[1672,941],"park":[1672,941],"town":[1586,992],"kintex":[1670,941]};
const SCENES={};
['market','park','town','kintex'].forEach((key,i)=>{const [sw,sh]=SCENE_PIXELS[key],targets=BAKED_TARGETS[key];SCENES[key]={key,title:['한강 플리마켓','공원','마을','킨텍스'][i],desc:['강변 장터와 피크닉 풍경을 살펴봐요.','연못과 소풍 공간의 생활용품을 찾아봐요.','공원과 상점이 이어진 작은 마을을 둘러봐요.','선반에 전시된 사회연대경제 제품을 찾아봐요.'][i],pixels:[sw,sh],targets,items:targets.map(([x,y,w,h],n)=>[IKEYS[n],x/sw*240,y/sh*150])}});

/* ---------------- 숨기기: ③바닥 그림자 · ②상자 · ①앞쪽 가림 ---------------- */
const SHADOW='rgba(15,12,28,.38)';
// ③ 바닥 그림자: 스프라이트 맨 아랫줄 실제 폭만큼 아래 2줄
function shadow(t,k,x,y){const rows=SPR[k],last=rows[rows.length-1];let l=last.search(/[^.]/),r=last.length-1-[...last].reverse().join('').search(/[^.]/);
  if(l<0){l=0;r=last.length-1}t.R(x+l-1,y+rows.length-1,r-l+3,2,SHADOW)}
// ② 닫힌 상자 / 열린 상자
const QM=['.kkk.','k...k','...k.','..k..','.....','..k..'];
function crateClosed(t,x,y){const w=14,h=13,X=x-1,Y=y-1;
  t.R(X+1,Y+h,w,2,SHADOW);
  t.box(X,Y,w,h,'#e2a65b','#f6d39b','#b97a35');t.R(X,Y+4,w,1,K);           // 뚜껑 경계
  t.R(X+1,Y+1,w-2,3,'#c08552');t.R(X+1,Y+1,w-2,1,'#e2a65b');
  for(let i=X+3;i<X+w-2;i+=4)t.R(i,Y+5,1,h-6,'#b97a35');                 // 판자 이음
  t.box(X+4,Y+5,6,7,'#fff3b0');t.spr(QM.map(r=>r.replace(/k/g,'o')),X+5,Y+6) // 물음표 표
}
function crateBack(t,x,y,k){const w=14,X=x-1,ih=SPR[k].length;             // 열린 상자: 젖힌 뚜껑 + 안쪽
  t.R(X+1,y+ih+1,w,2,SHADOW);t.box(X,y-5,w,4,'#c08552','#e2a65b');t.R(X,y-1,w,ih-3,'#7a4a2c');t.R(X,y-1,1,ih-3,K);t.R(X+w-1,y-1,1,ih-3,K)}
function crateFront(t,x,y,k){const w=14,X=x-1,ih=SPR[k].length,Y=y+ih-5;     // 아래 5줄만 가리는 앞판
  t.box(X,Y,w,6,'#e2a65b','#f6d39b','#b97a35');for(let i=X+3;i<X+w-2;i+=4)t.R(i,Y+1,1,4,'#b97a35')}

// ① 장면별 앞쪽 가림 물건 + 상자 지정
const HIDE={
  market:{crate:'honey',fg(t){
    // 잼: 앞에 놓인 곡물 자루
    sack(t,27,104,'#d9c08f');
    // 선물세트: 좌판 앞 기둥
    t.R(88,90,4,24,K);t.R(89,90,2,23,'#c08552');t.R(89,90,1,23,'#e2a65b');
    // 텀블러: 앞에 걸린 가랜드(깃발 줄) 다시 그리기
    bunting(t,0,W,62,8);
    // 대나무 칫솔: 앞에 놓인 나무 상자
    crate(t,95,137);
  }},
  town:{crate:'mitten',fg(t){
    // 빵: 빵집 진열창 창살
    t.R(21,77,2,27,K);t.R(22,78,1,25,'#fff');
    // 커피: 창가 화분
    pot(t,88,96,rng(5));
    // 원두: 카페 앞 칠판 입간판
    t.R(59,112,10,14,K);t.R(60,113,8,12,'#2f3b33');t.R(61,115,5,1,'#fff3b0');t.R(61,118,6,1,'#fff3b0');t.R(61,121,4,1,'#fff3b0');
    t.R(59,126,2,5,K);t.R(67,126,2,5,K);
    // 로션: 자전거 앞 바구니에 쏙
    t.circ(25,142,5,K);t.circ(25,142,3,'#d6d9e4');t.circ(49,142,5,K);t.circ(49,142,3,'#d6d9e4');
    t.line(25,142,37,141,'#2c6fb0');t.line(37,141,49,142,'#2c6fb0');t.line(25,142,29,140,'#2c6fb0');
    t.box(28,136,13,6,'#c08552','#e2a65b','#8a5a3b');for(let i=30;i<40;i+=3)t.R(i,137,1,4,'#8a5a3b');
  }},
  eco:{crate:'veggiebox',fg(t){
    // 태양광 패널: 지붕 위 굴뚝
    t.box(44,30,5,14,'#c96a3b','#e8935a');t.R(43,29,7,2,K);
    // 새싹 키트: 앞 울타리 말뚝 다시 그리기
    for(let x=0;x<70;x+=7){t.R(x,92,2,9,K);t.R(x,92,1,8,'#fff8e7')}t.R(0,95,70,1,K);t.R(0,99,70,1,K);
    // 친환경 컵: 앞 덤불
    bush(t,28,90);
    // 다회용 도시락통: 외바퀴 수레 안에
    t.box(126,131,17,7,'#c9ced6','#fff','#8d94a3');t.R(128,138,2,4,K);t.R(139,138,2,4,K);t.circ(134,144,2,K);t.D(134,144,'#c9ced6');
  }},
};

Object.keys(SCENES).forEach(k=>HIDE[k]={crate:null,fg(){}});
const PRODUCT_ATLAS_RECTS=[[53,109,301,219],[431,120,328,212],[830,52,315,309],[1240,77,297,281],[1639,48,291,314],[47,502,317,209],[505,425,203,332],[846,450,288,290],[1229,439,319,302],[1616,505,324,190]];
const sceneCache={};
const ART_IMAGES={};let artPromise=null;
function readArtworkImage(path){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('그림을 불러오지 못했어요.'));im.src=path})}
async function loadArtwork(){if(artPromise)return artPromise;artPromise=(async()=>{const names=['title','market','park','town','kintex','products'];const images=await Promise.all(names.map(k=>ART_IMAGES[k]||readArtworkImage(k==='products'?'assets/products-shared.png?v=20261118-scene-adjustments':'assets/'+k+'-art.png?v=20261118-scene-adjustments')));names.forEach((k,i)=>ART_IMAGES[k]=images[i]);paintTitle();Object.keys(sceneCache).forEach(k=>delete sceneCache[k]);return true})().catch(e=>{artPromise=null;throw e});return artPromise}
function sharedProductRect(scene,i){const[x,y,w,h]=scene.targets[i],[,,aw,ah]=PRODUCT_ATLAS_RECTS[i],fit=Math.min(w/aw,h/ah);return[x+(w-aw*fit)/2,y+h-ah*fit,aw*fit,ah*fit]}
function drawSharedProduct(ctx,i,x,y,w,h){const atlas=ART_IMAGES.products;if(!atlas)throw Error('제품 이미지를 준비하고 있어요.');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(atlas,...PRODUCT_ATLAS_RECTS[i],x,y,w,h)}
function sceneCanvas(key,withItems){if(sceneCache[key])return sceneCache[key];const bg=ART_IMAGES[key];if(!bg)throw Error('그림을 준비하고 있어요.');const c=mkCanvas(bg.naturalWidth||bg.width,bg.naturalHeight||bg.height),ctx=c.getContext('2d'),scene=SCENES[key];ctx.drawImage(bg,0,0);scene.targets.forEach((_,i)=>{const[x,y,w,h]=sharedProductRect(scene,i),dx=x/scene.pixels[0]*c.width,dy=y/scene.pixels[1]*c.height,dw=w/scene.pixels[0]*c.width,dh=h/scene.pixels[1]*c.height;ctx.save();ctx.fillStyle='rgba(53,35,22,.16)';ctx.beginPath();ctx.ellipse(dx+dw/2,dy+dh-1,dw*.35,Math.max(1.2,dh*.025),0,0,Math.PI*2);ctx.fill();ctx.restore();drawSharedProduct(ctx,i,dx,dy,dw,dh)});return sceneCache[key]=c}
function productBounds(scene,i){const[x,y,w,h]=sharedProductRect(scene,i),[sw,sh]=scene.pixels;return{k:IKEYS[i],x:x/sw*240,y:y/sh*150,w:w/sw*240,h:h/sh*150}}
function sprCanvas(el,k){if(!IKEYS.includes(k)){el.width=12;el.height=12;const t=T(el.getContext('2d'));t.spr(SPR[k],Math.floor((12-sprW(k))/2),Math.floor((12-sprH(k))/2));return}el.width=128;el.height=128;const i=IKEYS.indexOf(k),[,,w,h]=PRODUCT_ATLAS_RECTS[i],fit=Math.min(114/w,114/h);drawSharedProduct(el.getContext('2d'),i,(128-w*fit)/2,(128-h*fit)/2,w*fit,h*fit)}

/* ---------------- sound ---------------- */
let actx=null,soundOn=store.get('expo_sound',true);
function tone(seq){if(!soundOn)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const t0=actx.currentTime;seq.forEach(([f,d,st,type])=>{const o=actx.createOscillator(),g=actx.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(.0001,t0+st);g.gain.exponentialRampToValueAtTime(.12,t0+st+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+st+d);o.connect(g).connect(actx.destination);o.start(t0+st);o.stop(t0+st+d+.05)})}catch(e){}}
const sOk=()=>tone([[523,.08,0,'triangle'],[659,.08,.07,'triangle'],[784,.12,.14],[1046,.22,.21]]),sBad=()=>tone([[180,.15,0,'sawtooth'],[130,.2,.1,'sawtooth']]),sHint=()=>tone([[880,.1,0,'sine'],[1175,.22,.09,'sine']]),sWin=()=>tone([[523,.15,0],[659,.15,.12],[784,.15,.24],[1046,.4,.36]]),sBeep=h=>tone([[h?880:440,.12,0]]),sOpen=()=>tone([[330,.06,0,'sine'],[440,.1,.05,'sine']]);

/* ---------------- records (Google Sheet + local backup) ---------------- */
const RANK_ROUND='20261113-followup-2';
const RANK_STORAGE='expo_scores_'+RANK_ROUND;
const previousRankRound=store.get('expo_rank_round',null);
if(previousRankRound!==RANK_ROUND){try{localStorage.removeItem('expo_local_scores');if(previousRankRound)localStorage.removeItem('expo_scores_'+previousRankRound)}catch(e){}store.set('expo_rank_round',RANK_ROUND)}
const device=(()=>{const q=new URLSearchParams(location.search).get('device');if(q){store.set('expo_device',q);return q}let d=store.get('expo_device',null);if(!d){d='T-'+Math.random().toString(36).slice(2,6).toUpperCase();store.set('expo_device',d)}return d})();
const PENDING_STORAGE='expo_pending_event_20261127';
let pending=store.get(PENDING_STORAGE,[]);
const queuedParticipations=new Set(pending.map(r=>r.participationId).filter(Boolean));
function saveLocalScore(rec){const all=store.get(RANK_STORAGE,{});(all[rec.date]=all[rec.date]||[]).push({name:rec.name,score:rec.score,scene:rec.scene,sec:rec.sec,found:rec.found,total:rec.total});store.set(RANK_STORAGE,all)}
function localTop(date){const list=(store.get(RANK_STORAGE,{})[date]||[]);const best={};list.forEach(e=>{if(!best[e.name]||e.score>best[e.name].score)best[e.name]=e});return Object.values(best).sort((a,b)=>b.score-a.score)}
function queueRecord(rec){saveLocalScore(rec);if(!queuedParticipations.has(rec.participationId)){queuedParticipations.add(rec.participationId);pending.push(rec);store.set(PENDING_STORAGE,pending)}return flush()}
let flushing=null;
async function flush(){if(!CONFIG.SHEET_URL||!pending.length)return !pending.length;if(flushing)return flushing;
  flushing=(async()=>{for(const rec of [...pending]){try{
      const response=await withTimeout(fetch(CONFIG.SHEET_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(rec)}),15000);const ack=await response.json();if(!response.ok||ack.ok!==true)throw new Error('서버 저장 확인 실패');
      pending=pending.filter(p=>p.id!==rec.id);store.set(PENDING_STORAGE,pending)}catch(e){break}}
    flushing=null;return !pending.length})();return flushing}
const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);
setInterval(flush,30000);window.addEventListener('online',flush);
let rankInFlight=null;
function fetchRank(){if(rankInFlight)return rankInFlight;rankInFlight=new Promise(resolve=>{const callback='sseRank_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');let timer;const done=result=>{clearTimeout(timer);delete window[callback];script.remove();resolve(result)};window[callback]=data=>{if(!data||data.ok!==true||!Array.isArray(data.top)){done({src:'error',top:[],rank:null});return}done({src:'shared',top:data.top,day:data.day,rank:null})};script.onerror=()=>done({src:'error',top:[],rank:null});timer=setTimeout(()=>done({src:'error',top:[],rank:null}),15000);script.src=CONFIG.SHEET_URL+'?action=rank&callback='+callback+'&_='+Date.now();document.head.appendChild(script)}).finally(()=>{rankInFlight=null});return rankInFlight}


/* ---------------- screens ---------------- */
const SCREENS=['s-title','s-entry','s-pick','game','s-result'];
let cur='s-title',player='',phoneLast4='',participationId='';
function show(id){cur=id;SCREENS.forEach(s=>$('#'+s).hidden=s!==id);$('#bg').hidden=id==='game'||id==='s-result';closeModal()}
function goTitle(){stopGame();player='';phoneLast4='';participationId='';$('#name-in').value='';$('#phone-last4').value='';show('s-title');loadRank()}

// title
$('#t-host').textContent=CONFIG.HOST;$('#t-event').textContent=CONFIG.EVENT_NAME;
$('#t-game').innerHTML='우리 일상 속 숨은 <span class="hl">사회연대경제</span> 제품 찾기';$('#t-game').setAttribute('aria-label',CONFIG.GAME_NAME);
document.title=CONFIG.GAME_NAME;
// Cover artwork has its own clear title area; no pixel scenery or floating sprites.
const coverCanvas=$('#bg');coverCanvas.width=1600;coverCanvas.height=1000;
function paintTitle(){const c=$('#bg');if(ART_IMAGES.title){c.width=ART_IMAGES.title.naturalWidth||ART_IMAGES.title.width;c.height=ART_IMAGES.title.naturalHeight||ART_IMAGES.title.height}const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);if(ART_IMAGES.title){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(ART_IMAGES.title,0,0,c.width,c.height)}}
paintTitle();
function enrichRankEntry(entry,date){
 const saved=store.get(RANK_STORAGE,{})[date]||[];
 const exact=[...saved,...pending].find(r=>r.name===entry.name&&Number(r.score)===Number(entry.score)&&r.scene===entry.scene&&validRankNumber(r.sec)&&validRankNumber(r.found));
 return exact?{...exact,...entry,sec:entry.sec??exact.sec,found:entry.found??exact.found}:entry;
}
function validRankNumber(n){return n!==null&&n!==undefined&&n!==''&&Number.isFinite(Number(n))&&Number(n)>=0}
function rankResult(entry){
 const seconds=entry.sec??entry.seconds??entry.elapsedSeconds;
 const found=entry.found??entry.foundCount;
 const secText=validRankNumber(seconds)?Number(seconds).toFixed(1).replace(/\.0$/,'')+'초':'시간 미기록';
 const foundText=validRankNumber(found)?Number(found)+'개':'개수 미기록';
 return secText+' · '+foundText;
}
async function loadRank(){const {src,top}=await fetchRank();const ol=$('#rank-list');
 if(src!=='shared'){ol.innerHTML='<li class="empty" style="display:block">전체 순위를 불러오지 못했어요.</li>';$('#rank-note').textContent='※ 인터넷 연결 또는 순위 서비스 설정을 확인해주세요.';return}
 ol.innerHTML=top.length?top.slice(0,10).map((e,i)=>`<li><span class="no">${i+1}</span><span class="rank-name" title="${esc(e.name)}">${esc(e.name)}</span><span class="rank-result">${esc(rankResult(e))}</span></li>`).join(''):'<li class="empty" style="display:block">아직 오늘의 기록이 없어요. 첫 주인공이 되어 보세요!</li>';
 $('#rank-note').textContent='※ 오늘 전체 참여자 · 점수순 · 하루 첫 게임 기준';
}
setInterval(()=>{if(cur==='s-title')loadRank()},CONFIG.RANK_REFRESH_SEC*1000);
$('#btn-start').onclick=async()=>{const b=$('#btn-start'),old=b.innerHTML;b.disabled=true;b.textContent='그림 준비 중…';try{await loadArtwork();sBeep(1);show('s-entry');setTimeout(()=>$('#name-in').focus(),50);$('#art-notice')?.remove()}catch(e){let note=$('#art-notice');if(!note){note=document.createElement('p');note.id='art-notice';note.setAttribute('role','status');note.style.cssText='color:#fff;background:#2b2340cc;padding:6px 10px;font-size:14px';b.after(note)}note.textContent='그림을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시작해 주세요.'}finally{b.disabled=false;b.innerHTML=old}};
$('#btn-fs').onclick=()=>{const d=document.documentElement;if(document.fullscreenElement)document.exitFullscreen?.();else (d.requestFullscreen||d.webkitRequestFullscreen)?.call(d)};

// entry
document.querySelectorAll('canvas[data-spr]').forEach(c=>sprCanvas(c,c.dataset.spr));
$('#entry-form').onsubmit=e=>{e.preventDefault();const v=$('#name-in').value.replace(/\s+/g,' ').trim();
  if(!v){$('#name-err').textContent='이름을 입력해 주세요.';$('#name-in').focus();return}
  const digits=$('#phone-last4').value;if(!/^[0-9]{4}$/.test(digits)){$('#name-err').textContent='전화번호 뒤 네 자리를 숫자로 입력해 주세요.';$('#phone-last4').focus();return}
  phoneLast4=digits;player=v.slice(0,12);participationId=uid();$('#name-err').textContent='';$('#name-in').blur();sBeep(1);openPick()};
$('#phone-last4').oninput=()=>{$('#phone-last4').value=$('#phone-last4').value.replace(/[^0-9]/g,'').slice(0,4);$('#name-err').textContent=''};
$('#name-in').oninput=()=>{$('#name-err').textContent=''};
$('#btn-entry-back').onclick=goTitle;

// pick
function openPick(){$('#pick-title').textContent=`${player}님, 장면을 골라요`;
  $('#cards').innerHTML=Object.entries(SCENES).map(([k,s])=>`<button class="card" data-scene="${k}"><canvas width="640" height="400" data-thumb="${k}"></canvas><div class="cb"><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p><span class="go">시작 ▶</span></div></button>`).join('');
  document.querySelectorAll('[data-thumb]').forEach(c=>c.getContext('2d').drawImage(sceneCanvas(c.dataset.thumb,false),0,0,c.width,c.height));
  show('s-pick')}
$('#cards').onclick=e=>{const b=e.target.closest('[data-scene]');if(b)startGame(b.dataset.scene)};
$('#btn-pick-back').onclick=()=>{show('s-entry');$('#name-in').focus()};

/* ---------------- game ---------------- */
const G={key:null,items:[],found:new Set(),wrong:0,t0:0,sec:0,timer:null,done:true,running:false,vb:{x:0,y:0,w:W,h:H},misses:[],reveal:false,opened:new Set(),hint:null,hintUsed:0};
const view=$('#view'),stage=$('#stage'),vctx=view.getContext('2d');
let base=null;
function startGame(key){
  const s=SCENES[key];Object.assign(G,{key,items:s.items.map((_,i)=>productBounds(s,i)),found:new Set(),opened:new Set(),hint:null,hintUsed:0,wrong:0,sec:0,done:false,running:false,misses:[],reveal:false});
  base=sceneCanvas(key,true);G.vb={x:0,y:0,w:W,h:H};$('#btn-hint').disabled=false;document.querySelectorAll('.pop').forEach(e=>e.remove());
  $('#g-name').textContent=player+' 님';$('#g-scene').textContent=s.title;
  $('#tray').innerHTML=G.items.map((it,i)=>`<li data-k="${i}"><canvas data-tray="${it.k}"></canvas><span class="product-label">${['honey','jam','tumbler','detergent','toothbrush'].includes(it.k)?'<span class="food-badge">#먹거리으뜸경연대회</span>':''}<span>${it.k==='detergent'?'삼각 초콜릿 2종<br>선물세트':it.k==='toothbrush'?'아차산 할매니얼<br>카라멜':esc(NAMES[it.k])}</span></span>${it.k===HIDE[key].crate?'<small>상자 속</small>':''}</li>`).join('');
  document.querySelectorAll('[data-tray]').forEach(c=>sprCanvas(c,c.dataset.tray));
  $('#g-time').textContent=fmt(CONFIG.TIME_LIMIT);$('#g-timebox').classList.remove('warn');updateStats();show('game');resize();
  // READY 3-2-1
  const rd=$('#ready');let n=3;rd.hidden=false;rd.textContent='READY';sBeep(0);
  clearInterval(G.timer);G.timer=setInterval(()=>{if(cur!=='game'){clearInterval(G.timer);return}
    if(n>0){rd.textContent=n;sBeep(0);n--}else{rd.textContent='GO!';sBeep(1);clearInterval(G.timer);
      setTimeout(()=>{rd.hidden=true},400);G.running=true;G.t0=performance.now();G.timer=setInterval(tick,200)}},600);
}
function stopGame(){clearInterval(G.timer);G.done=true;G.running=false}
function tick(){if(G.done)return;G.sec=(performance.now()-G.t0)/1000;const rem=Math.max(0,CONFIG.TIME_LIMIT-G.sec);
  $('#g-time').textContent=fmt(Math.ceil(rem));$('#g-timebox').classList.toggle('warn',rem<=10&&rem>0);if(rem<=0)end(false)}
const score=()=>Math.max(0,G.found.size*100-G.wrong*20-G.hintUsed*30);
function updateStats(){$('#g-count').textContent=`${G.found.size}/${G.items.length}`;$('#g-score').textContent=score()}

/* render: nearest-neighbour blit of the dot scene + dot-space marks */
let marks=mkCanvas(W,H),mt=T(marks.getContext('2d'));
function ring(cx,cy,r,c,dash){const pts=new Set();for(let a=0;a<360;a+=2){const x=Math.round(cx+r*Math.cos(a*Math.PI/180)),y=Math.round(cy+r*Math.sin(a*Math.PI/180));pts.add(x+','+y)}
  let i=0;pts.forEach(p=>{const [x,y]=p.split(',').map(Number);if(!dash||(i++%4)<2)mt.D(x,y,c)})}
function drawMarks(){mt.ctx.clearRect(0,0,W,H);const now=performance.now();
  G.items.forEach((it,i)=>{if(it.k!==HIDE[G.key].crate)return;
    if(!G.opened.has(i)&&!G.reveal)crateClosed(mt,it.x,it.y);else{crateBack(mt,it.x,it.y,it.k);mt.spr(SPR[it.k],it.x,it.y);crateFront(mt,it.x,it.y,it.k)}});
  G.items.forEach((it,i)=>{const cx=it.x+it.w/2-.5,cy=it.y+it.h/2-.5,r=Math.max(it.w,it.h)/2+2;
    if(G.found.has(i)){ring(cx,cy,r+1,'#fff');ring(cx,cy,r,'#ff2a4a');ring(cx,cy,r-.6,'#ff2a4a')}
    else if(G.reveal){ring(cx,cy,r,'#ffd23f',true);ring(cx,cy,r+1,K,true)}});
  if(G.hint&&!G.found.has(G.hint.i)&&now-G.hint.t<2600){const it=G.items[G.hint.i],cx=it.x+it.w/2-.5,cy=it.y+it.h/2-.5,base=Math.max(it.w,it.h)/2+3,ph=Math.floor((now-G.hint.t)/110)%5;
    ring(cx,cy,base+ph+1,K);ring(cx,cy,base+ph,'#ffd23f');ring(cx,cy,base+ph-.6,'#ffd23f')}
  G.misses=G.misses.filter(m=>now-m.t<800);G.misses.forEach(m=>{for(let d=-2;d<=2;d++){mt.D(m.x+d,m.y+d,'#ff2a4a');mt.D(m.x+d,m.y-d,'#ff2a4a')}})}
function render(){const v=G.vb;vctx.imageSmoothingEnabled=true;vctx.imageSmoothingQuality='high';vctx.clearRect(0,0,view.width,view.height);
  if(!base)return;const bg=ART_IMAGES[G.key];vctx.drawImage(bg,v.x/W*bg.width,v.y/H*bg.height,v.w/W*bg.width,v.h/H*bg.height,0,0,view.width,view.height);G.items.forEach((it,i)=>{const x=(it.x-v.x)/v.w*view.width,y=(it.y-v.y)/v.h*view.height,w=it.w/v.w*view.width,h=it.h/v.h*view.height;vctx.save();vctx.fillStyle='rgba(53,35,22,.16)';vctx.beginPath();vctx.ellipse(x+w/2,y+h-1,w*.35,Math.max(1.2,h*.025),0,0,Math.PI*2);vctx.fill();vctx.restore();drawSharedProduct(vctx,i,x,y,w,h)});drawMarks();vctx.drawImage(marks,v.x,v.y,v.w,v.h,0,0,view.width,view.height)}
function resize(){const r=stage.getBoundingClientRect(),dpr=window.devicePixelRatio||1;view.width=Math.max(1,Math.round(r.width*dpr));view.height=Math.max(1,Math.round(r.height*dpr));render()}
window.addEventListener('resize',()=>{if(cur==='game')resize()});
function setVB(v){const w=clamp(v.w,W/5,W),h=w*H/W;G.vb={x:clamp(v.x,0,W-w),y:clamp(v.y,0,H-h),w,h};render()}
function toDot(cx,cy,vb=G.vb){const r=view.getBoundingClientRect();return{x:vb.x+(cx-r.left)/r.width*vb.w,y:vb.y+(cy-r.top)/r.height*vb.h}}
function zoomAt(newW,anchor,baseVB,curPt){const r=view.getBoundingClientRect();const a=toDot(anchor.x,anchor.y,baseVB);const w=clamp(newW,W/5,W),h=w*H/W;setVB({x:a.x-(curPt.x-r.left)/r.width*w,y:a.y-(curPt.y-r.top)/r.height*h,w,h})}
function zoomBtn(f){const r=view.getBoundingClientRect();const c={x:r.left+r.width/2,y:r.top+r.height/2};zoomAt(G.vb.w*f,c,{...G.vb},c)}
$('#z-in').onclick=()=>zoomBtn(1/1.5);$('#z-out').onclick=()=>zoomBtn(1.5);$('#z-reset').onclick=()=>setVB({x:0,y:0,w:W,h:H});
(function(){const pts=new Map();let moved=false,pinch=null,pan=null;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  view.addEventListener('pointerdown',e=>{try{view.setPointerCapture(e.pointerId)}catch(_){}pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){moved=false;pan={x:e.clientX,y:e.clientY,vb:{...G.vb}}}
    else if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:dist(a,b)||1,vb:{...G.vb},m:mid(a,b)};moved=true;pan=null}});
  view.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2&&pinch){const [a,b]=[...pts.values()];zoomAt(pinch.vb.w*pinch.d/(dist(a,b)||1),pinch.m,pinch.vb,mid(a,b))}
    else if(pts.size===1&&pan){const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(Math.hypot(dx,dy)>10)moved=true;if(moved){const k=pan.vb.w/view.getBoundingClientRect().width;setVB({...pan.vb,x:pan.vb.x-dx*k,y:pan.vb.y-dy*k})}}});
  const end=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
    if(pts.size===0){if(!moved&&e.type==='pointerup')guess(e.clientX,e.clientY);pinch=null;pan=null}
    else if(pts.size===1){pinch=null;const [p]=[...pts.values()];pan={x:p.x,y:p.y,vb:{...G.vb}}}};
  view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
  view.addEventListener('wheel',e=>{e.preventDefault();const c={x:e.clientX,y:e.clientY};zoomAt(G.vb.w*(e.deltaY>0?1.15:1/1.15),c,{...G.vb},c)},{passive:false});
})();
function guess(cx,cy){if(G.done||!G.running)return;const p=toDot(cx,cy);const tol=12*G.vb.w/view.getBoundingClientRect().width;
  let hit=-1,bd=1e9;G.items.forEach((it,i)=>{const d=Math.hypot(it.x+it.w/2-p.x,it.y+it.h/2-p.y);if(p.x>=it.x-tol&&p.x<=it.x+it.w+tol&&p.y>=it.y-tol&&p.y<=it.y+it.h+tol&&d<bd){bd=d;hit=i}});
  if(hit>=0&&G.items[hit].k===HIDE[G.key].crate&&!G.opened.has(hit)){G.opened.add(hit);sOpen();pop(cx,cy,'상자 열림! 한 번 더','box');render();return} // 상자: 먼저 열기(감점 없음)
  if(hit>=0){if(G.found.has(hit))return;G.found.add(hit);const li=$(`#tray li[data-k="${hit}"]`);if(li){li.classList.add('found');li.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})}
    sOk();pop(cx,cy,`+100<small>${esc(NAMES[G.items[hit].k])}</small>`,'ok');updateStats();render();if(G.found.size===G.items.length)end(true)}
  else{G.wrong++;G.misses.push({x:Math.round(p.x),y:Math.round(p.y),t:performance.now()});sBad();pop(cx,cy,'-20','bad');updateStats();render();setTimeout(render,820)}}

/* 떠오르는 점수 글씨 */
function pop(cx,cy,html,cls){const st=$('#stage').getBoundingClientRect(),el=document.createElement('div');el.className='pop '+cls;el.innerHTML=html;
  el.style.left=clamp(cx-st.left,60,st.width-60)+'px';el.style.top=clamp(cy-st.top-8,40,st.height)+'px';$('#stage').appendChild(el);setTimeout(()=>el.remove(),850)}
/* 힌트 1회 (-30점) */
$('#btn-hint').onclick=()=>{if(!G.running||G.done||G.hintUsed)return;const left=G.items.map((_,i)=>i).filter(i=>!G.found.has(i));if(!left.length)return;
  G.hintUsed=1;$('#btn-hint').disabled=true;G.hint={i:left[Math.random()*left.length|0],t:performance.now()};sHint();updateStats();
  const st=$('#stage').getBoundingClientRect();pop(st.left+st.width/2,st.top+56,'힌트! -30','box');
  (function loop(){render();if(G.hint&&performance.now()-G.hint.t<2700)requestAnimationFrame(loop)})()};
function end(cleared){if(G.done)return;G.done=true;G.running=false;clearInterval(G.timer);G.sec=Math.min(CONFIG.TIME_LIMIT,(performance.now()-G.t0)/1000);
  const rem=Math.max(0,CONFIG.TIME_LIMIT-G.sec),bonus=cleared?Math.ceil(rem)*10:0,total=score()+bonus;$('#g-timebox').classList.remove('warn');$('#g-score').textContent=total;
  if(!cleared){$('#g-time').textContent='0:00';G.reveal=true;render();sBad()}else{$('#g-time').textContent=fmt(Math.ceil(rem))}
  const rec={id:uid(),participationId,hintUsed:G.hintUsed,date:today(),time:new Date().toISOString(),name:player,phoneLast4,scene:SCENES[G.key].title,result:cleared?'완료':'시간끝',
    found:G.found.size,total:G.items.length,wrong:G.wrong,sec:Math.round(G.sec*10)/10,score:total,device};
  const best=store.get('expo_best',{});const isBest=!best[G.key]||total>best[G.key];if(isBest){best[G.key]=total;store.set('expo_best',best)}
  setTimeout(()=>{if(cleared)sWin();
    openModal(`<h2>${cleared?'STAGE CLEAR!':'TIME UP!'}</h2>
      <p style="margin:0;font-size:20px">${esc(player)}님, ${cleared?'모두 찾았어요!':`${G.items.length}개 중 <span>${G.found.size}개</span>를 찾았어요`}</p>
      <div class="res"><div class="stat"><b>${cleared?fmt(G.sec):G.found.size+'/'+G.items.length}</b><small>${cleared?'걸린 시간':'찾은 개수'}</small></div><div class="stat"><b>${G.wrong}</b><small>틀린 횟수</small></div><div class="stat"><b>${total}</b><small>점수${bonus?` (+${bonus})`:''}</small></div></div>
      <button class="pbtn coral small" data-m="download">참여 결과 이미지 저장</button><div class="result-qr-grid">${[
 ['work-together','함께일하는재단','인스타그램','https://www.instagram.com/work_together_foundation/'],
 ['shinhan','신한금융희망재단','인스타그램','https://www.instagram.com/shinhanfoundation/'],
 ['newsletter','함께일하는재단','뉴스레터 구독','https://hamkke.org/#stb_subscribe']
].map(([id,org,label,url])=>`<a class="qr-card" href="${url}" target="_blank" rel="noopener noreferrer"><span>${org}</span><b>${label}</b><img src="assets/qr-${id}.svg" width="176" height="176" alt="${org} ${label} QR 코드"></a>`).join('')}</div><div id="result-image"></div><p class="save wait" id="save-msg">기록 저장 중…</p>
      <div class="prize-note"><p>숨은그림찾기 참여 후 SNS 팔로우 혹은 재단 뉴스레터 구독 시,</p><p class="prize-claim">경품 뽑기 참여 가능!</p></div>
      <div class="row">${cleared?'':'<button class="pbtn small" data-m="look">정답 보기</button>'}<button class="pbtn small" data-m="again">다시 하기</button><button class="pbtn small coral" data-m="home">처음으로</button></div>`,
      act=>{if(act==='download'){saveResultImage(rec);return}if(act==='look')show('game');else if(act==='again'){closeModal();openPick()}else if(act==='home')goTitle()});
    queueRecord(rec).then(async ok=>{const m=$('#save-msg');if(!m)return;
      const {rank,src}=await fetchRank(total);const rk=rank?` · 오늘 ${rank}위`:'';
      if(!CONFIG.SHEET_URL){m.className='save ok';m.textContent='이 기기에 기록했어요'+rk}
      else if(ok){m.className='save ok';m.textContent='기록 저장 완료'+rk}
      else{m.className='save err';m.textContent='서버 저장 미확인 · 이 기기에 보관 후 자동 재시도'+rk}});
  },cleared?500:900)}
$('#btn-quit').onclick=()=>{stopGame();openPick()};
const sb=$('#btn-sound');const syncSound=()=>{sb.textContent=soundOn?'소리 켬':'소리 끔';sb.setAttribute('aria-pressed',soundOn)};syncSound();
sb.onclick=()=>{soundOn=!soundOn;store.set('expo_sound',soundOn);syncSound()};

/* ---------------- modal ---------------- */
let modalCb=null;
function openModal(html,cb){show('s-result');$('#sheet').innerHTML=html;modalCb=cb;$('#sheet').focus();$('#s-result').scrollTop=0}
function closeModal(){$('#sheet').innerHTML='';modalCb=null}
$('#s-result').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b&&modalCb)modalCb(b.dataset.m)});

/* ---------------- kiosk: idle reset, no context menu ---------------- */
let lastAct=Date.now();['pointerdown','keydown','wheel'].forEach(ev=>window.addEventListener(ev,()=>{lastAct=Date.now()},{passive:true,capture:true}));
setInterval(()=>{if(cur!=='s-title'&&!G.running&&Date.now()-lastAct>CONFIG.IDLE_SEC*1000)goTitle()},3000);
window.addEventListener('contextmenu',e=>{if(!e.target.closest('#result-image'))e.preventDefault()});
document.addEventListener('gesturestart',e=>e.preventDefault());

goTitle();flush();

async function saveResultImage(rec){
 try{await document.fonts.ready;const c=mkCanvas(1080,1350),x=c.getContext('2d');x.fillStyle='#fff8e7';x.fillRect(0,0,1080,1350);x.fillStyle='#2b2340';x.fillRect(0,0,1080,210);x.textAlign='center';x.fillStyle='#ffc63a';x.font='800 38px GameTitleSans,sans-serif';x.fillText('우리 일상 속 숨은',540,63);x.fillText('사회연대경제 제품 찾기',540,112);x.fillStyle='#fff';x.font='28px sans-serif';x.fillText('지역에서 시작된 변화, 당신의 일상으로',540,151);
 const key=Object.keys(SCENES).find(k=>SCENES[k].title===rec.scene);x.drawImage(sceneCanvas(key,true),50,250,980,552);x.fillStyle='#2b2340';x.font='bold 44px sans-serif';x.fillText(rec.name+'님의 참여 기록',540,886,980);x.font='32px sans-serif';x.fillText(rec.scene+' · '+rec.result,540,951);x.font='bold 57px sans-serif';x.fillStyle='#dc5d43';x.fillText(rec.found+' / '+rec.total+'개 발견',540,1042);x.fillStyle='#2b2340';x.font='30px sans-serif';x.fillText(rec.score+'점  ·  '+rec.sec+'초  ·  오답 '+rec.wrong+'회',540,1112);x.font='24px sans-serif';x.fillText('신한금융희망재단 × 함께일하는재단',540,1210);x.fillText(rec.date+'  #숨은사회연대경제찾기',540,1260);
 const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw Error('PNG 생성 실패');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='숨은그림찾기_참여결과_'+rec.date+'.png';document.body.append(a);a.click();a.remove();const holder=$('#result-image');if(holder){holder.innerHTML='';const im=document.createElement('img');im.src=url;im.alt='참여 결과 이미지 — 길게 눌러 사진에 저장할 수 있어요';im.className='result-preview';holder.append(im);const note=document.createElement('p');note.textContent='저장이 안 되면 이미지를 길게 눌러 사진에 저장해 주세요.';note.style.fontSize='13px';holder.append(note)}setTimeout(()=>URL.revokeObjectURL(url),300000);
 }catch(e){const m=$('#save-msg');if(m)m.textContent='이미지 저장에 실패했어요. 다시 눌러주세요.'}}
loadArtwork().then(()=>document.querySelectorAll('canvas[data-tray]').forEach(c=>sprCanvas(c,c.dataset.tray))).catch(()=>{});
