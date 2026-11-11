/* ---------- the family photographs on the walls: real photographs of the people of this world. Each one is the game's
   own characters - the old man in his quilted jacket, the man in the check shirt, a son in uniform, the soldiers -
   stood in a studio and photographed: built, posed, lit with a key light, a fill and a rim, rendered off screen,
   read back, and printed: black and white or sepia, the tones stretched like a print's, the soft focus of an old
   lens, film grain, the oval vignette of a studio portrait, then the card mount, foxing and a crease or two.
   A frame on the wall gets its texture at once (blank photographic paper) and the picture is printed onto it a few
   frames after the game starts, once the characters' own textures have loaded. ---------- */
const PORTRAIT=(()=>{const W=256,Hh=320,cache={},queue=[];let sc=null,cam=null,rt=null,lights=null,done=0;
  /* who is in which photograph: [char, outfit, vest, helmet, turn]; one, two or three sitters */
  /* (most of them in their own clothes - a quilted jacket, a check shirt; a son or two in uniform) */
  const SPECS=[[['oldman','telogreika',0,0,.22]],[['guard3','plaid',0,0,-.2]],[['guard2','ratnik',0,0,.15]],[['guard4','telogreika',0,0,-.12]],
    [['oldman','telogreika',0,0,.12],['plaid','plaid',0,0,-.12]],[['driver','plaid',0,0,.1]],[['guard1','ratnik',0,0,-.18]],
    [['guard5','plaid',0,0,.08],['oldman','telogreika',0,0,0],['guard3','ratnik',0,0,-.1]],[['patrol','telogreika',0,0,.2]],[['plaid','plaid',0,0,-.25]]];
  const setup=()=>{sc=new T.Scene();sc.background=null;if(typeof ENV!=='undefined')sc.environment=ENV;
    const key=new T.DirectionalLight(0xfff4e6,3.0);key.position.set(-1.4,1.8,2.4);const fill=new T.HemisphereLight(0xe8e4dc,0x48443e,.75);const rim=new T.DirectionalLight(0xffffff,1.4);rim.position.set(1.6,1.4,-2.2);
    sc.add(key,key.target,fill,rim);lights=[key,fill,rim];cam=new T.PerspectiveCamera(22,W/Hh,.1,30);
    rt=new T.WebGLRenderTarget(W,Hh,{depthBuffer:true});};
  /* the print: luminance, stretched between its own 2% and 98% points, a gentle S-curve; soft focus, grain; toned to
     sepia or left grey; the oval vignette fading into the card; foxing; the white deckled border */
  const print=(px,c,seed,sepia,oval)=>{const q=rng(seed*13+7),im=c.createImageData(W,Hh),d=im.data,L=new Float32Array(W*Hh),hist=new Uint32Array(256);
    const A=new Float32Array(W*Hh);for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const s=((Hh-1-y)*W+x)*4,a=px[s+3]/255,l=a>.02?(px[s]*.3+px[s+1]*.59+px[s+2]*.11)/a:0;L[y*W+x]=l;A[y*W+x]=a;if(a>.5)hist[Math.min(255,l|0)]++;}
    let tot=0;for(let i=0;i<256;i++)tot+=hist[i];tot=Math.max(1,tot);
    let lo=0,hi=255,acc=0;for(let i=0;i<256;i++){acc+=hist[i];if(acc<tot*.01)lo=i;if(acc<tot*.992)hi=i;}hi=Math.max(hi,lo+30);
    const pap=sepia?[232,216,188]:[226,224,216],ink=sepia?[38,24,14]:[22,22,24];const ox=W/2,oy=Hh*.46,rx=W*.42,ry=Hh*.44;
    /* the studio backdrop: a painted cloth, light behind the sitter's head and darkening to the edges, mottled */
    for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=y*W+x;let t=clamp((L[i]-lo)/(hi-lo),0,1);t=t*t*(3-2*t)*.45+t*.55;t=Math.pow(t,.95)*.92+.04;
      const bd=.62-.38*Math.min(1,Math.hypot((x-W*.5)/(W*.6),(y-Hh*.32)/(Hh*.7)))+(fbmT(x/W+seed*.07,y/Hh,4,3)-.5)*.18;t=t*A[i]+bd*(1-A[i]);
      t+=(vnP(x*.7+seed,y*.7,W*.7)-.5)*.07+(hash(x+seed*31,y)-.5)*.035;
      let v=1;if(oval){const e=Math.hypot((x-ox)/rx,(y-oy)/ry);v=1-sstep(.82,1.04,e);}
      const k=clamp(t,0,1);for(let ch=0;ch<3;ch++){const col=ink[ch]+(pap[ch]-ink[ch])*k;d[i*4+ch]=col*v+pap[ch]*(1-v);}d[i*4+3]=255;}
    c.putImageData(im,0,0);
    /* the old lens: a touch of softness, a little halation round the lights */
    try{c.filter='blur(.6px)';c.globalAlpha=.55;c.drawImage(c.canvas,0,0);c.filter='none';c.globalAlpha=1;}catch(_){}
    /* age: foxing spots, a faint crease, the silver going at the edges */
    for(let i=0;i<14;i++){const x=q()*W,y=q()*Hh,r=1+q()*5,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(120,80,40,.35)');g.addColorStop(1,'rgba(120,80,40,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
    if(q()<.6){c.strokeStyle='rgba(255,250,240,.28)';c.lineWidth=1;c.beginPath();const y0=q()*Hh;c.moveTo(0,y0);c.bezierCurveTo(W*.3,y0+q()*30-15,W*.7,y0+q()*30-15,W,y0+q()*40-20);c.stroke();}
    const eg=c.createRadialGradient(W/2,Hh/2,Math.min(W,Hh)*.35,W/2,Hh/2,Math.max(W,Hh)*.7);eg.addColorStop(0,'rgba(90,60,30,0)');eg.addColorStop(1,'rgba(90,60,30,.25)');c.fillStyle=eg;c.fillRect(0,0,W,Hh);
    /* the card border */c.strokeStyle=sepia?'#efe4cc':'#ecebe6';c.lineWidth=14;c.strokeRect(0,0,W,Hh);c.strokeStyle='rgba(60,40,20,.25)';c.lineWidth=1;c.strokeRect(7.5,7.5,W-15,Hh-15);};
  const shoot=(k)=>{if(cache[k])return cache[k];const spec=SPECS[k];const hs=[],n=spec.length;
    spec.forEach(([ch,out,vest,helm,turn],i)=>{/* (a soldier's portrait in plain service khaki, as they were taken - not the field camouflage, which prints as a blotch) */const h=buildHuman({char:ch,outfit:out,vest:!!vest,helmet:!!helm,matMap:{emr:'khaki',velcro:'khaki'},drop:['pad','padhard'],bala:false});pose(h,POSE.doll);const x=(i-(n-1)/2)*.5;h.root.position.set(x,i===1&&n===3?.0:0,n===3&&i===1?-.12:0);h.root.rotation.y=turn;sc.add(h.root);hs.push(h);});
    sc.updateMatrixWorld(true);const hp=V3(),c=V3();hs.forEach(h=>{h.P.head.getWorldPosition(hp);c.add(hp);});c.multiplyScalar(1/n);
    const dist=n===1?1.32:n===2?2.2:2.9;cam.position.set(c.x+.04,c.y-.02,c.z+dist);cam.lookAt(c.x,c.y-(n===1?.1:.16),c.z);cam.updateMatrixWorld(true);
    const prev=renderer.getRenderTarget(),pc=renderer.getClearColor(new T.Color()),pa=renderer.getClearAlpha();renderer.setClearColor(0x000000,0);renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);renderer.setClearColor(pc,pa);const px=new Uint8Array(W*Hh*4);renderer.readRenderTargetPixels(rt,0,0,W,Hh,px);renderer.setRenderTarget(prev);
    hs.forEach(h=>sc.remove(h.root));return cache[k]=px;};
  /* a frame's photograph: its own paper now, the print later */
  const photo=seed=>{const cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const c=cv.getContext('2d');c.fillStyle='#e6dcc4';c.fillRect(0,0,W,Hh);
    const t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;t.anisotropy=8;queue.push({t,c,seed});return t;};
  /* (one print a frame, after the characters' textures are in, so nothing hitches) */
  const ready=()=>typeof CTEX!=='undefined'&&CTEX.every(t=>t.image&&t.image.complete&&t.image.naturalWidth>0);
  const tick=()=>{if(!queue.length)return;if(!ready())return;if(!sc)setup();const j=queue.shift();const k=(j.seed*7+3)%SPECS.length;
    try{const px=shoot(k);print(px,j.c,j.seed,j.seed%3!==1,SPECS[k].length===1&&j.seed%2===0);j.t.needsUpdate=true;}catch(e){console.warn('portrait',e);}
    if(!queue.length&&rt){rt.dispose();rt=null;sc=null;}};
  return{photo,tick,get pending(){return queue.length;}};})();
