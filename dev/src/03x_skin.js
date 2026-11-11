/* skin shading: per-channel wrapped diffuse so light bleeds red past the terminator (cheap subsurface look) */
function skinPatch(m,wrap){const w=wrap||[.45,.2,.12];const prev=m.onBeforeCompile;
  m.onBeforeCompile=(s,r)=>{if(prev)prev(s,r);s.fragmentShader=s.fragmentShader.replace('#include <lights_physical_pars_fragment>',THREE.ShaderChunk.lights_physical_pars_fragment.replace(
    'reflectedLight.directDiffuse += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );',
    `float nlS=dot(geometry.normal,directLight.direction);vec3 wS=vec3(${w.map(x=>x.toFixed(3)).join(',')});
     vec3 dS=clamp((vec3(nlS)+wS)/(1.0+wS),0.0,1.0);dS=pow(dS,vec3(1.0)+wS*.6);
     vec3 irS=dS*directLight.color;
     #ifndef PHYSICALLY_CORRECT_LIGHTS
     irS*=PI;
     #endif
     reflectedLight.directDiffuse += ( 1.0 - clearcoatDHR ) * irS * BRDF_Diffuse_Lambert( material.diffuseColor );
     /* translucency: light that enters thin skin (ears, nostril wings, fingers, eyelids) scatters through and comes out
        red on the shaded side; thick regions pass almost none */
     {float tT=clamp(exp(-vThick*420.0),0.,.6);vec3 Ht=normalize(directLight.direction+geometry.normal*.3);
      float bk=pow(clamp(dot(geometry.viewDir,-Ht),0.,1.),3.)+clamp(-nlS,0.,1.)*.12;
      reflectedLight.directDiffuse+=bk*tT*directLight.color*material.diffuseColor*vec3(1.0,.42,.26)*.85;}`));
    s.vertexShader='attribute float thick;varying float vThick;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvThick=thick;');
    s.fragmentShader='varying float vThick;\n'+s.fragmentShader;
    /* baked facial occlusion (detail map blue): keeps sky / ambient fill out of the sockets, nose and jaw shadows */
    s.fragmentShader=s.fragmentShader.replace('#include <aomap_fragment>','#include <aomap_fragment>\n#ifdef USE_BUMPMAP\nfloat skAO=texture2D(bumpMap,vUv).b;reflectedLight.indirectDiffuse*=skAO;reflectedLight.indirectSpecular*=mix(1.0,skAO,0.85);\n#endif');};
  m.customProgramCacheKey=()=>'skinao2'+w.join();return m;}
/* the face, per person, in bind space round their own eyes (P = position - eye centre: x right, y up, z forward):
   blood under the skin where there is more of it (cheeks, nose, ears, lips' edge), the thin bluish skin under the eyes,
   a yellower forehead; pores and fine mottling; an oilier T-zone; a soldier's clipper-cut hair on the scalp and a day or
   two of beard where they have no hair mesh of their own. o: {hair:bool (buzzcut), beard:0..1, hc:[r,g,b]} */
function faceDetail(m,fit,o,key){const e=fit.eye,f=v=>(+v).toFixed(4),prev=m.onBeforeCompile,pk=m.customProgramCacheKey?m.customProgramCacheKey():'';
  const hc=o.hc.map(x=>Math.pow(x,1.0));
  m.onBeforeCompile=(s,r)=>{if(prev)prev(s,r);
    if(!/varying vec3 vFP;/.test(s.vertexShader)){s.vertexShader='varying vec3 vFP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFP=position;');}
    let fs='varying vec3 vFP;\n'+s.fragmentShader;
    fs=fs.replace('void main() {',`float fH(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float fN(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(fH(i),fH(i+vec3(1,0,0)),f.x),mix(fH(i+vec3(0,1,0)),fH(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(fH(i+vec3(0,0,1)),fH(i+vec3(1,0,1)),f.x),mix(fH(i+vec3(0,1,1)),fH(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float fB(vec3 c,vec3 r,vec3 p){vec3 d=(p-c)/r;return 1.-smoothstep(.35,1.,length(d));}
      void main() {`);
    fs=fs.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      {vec3 P=vFP-vec3(0.,${f(e[1])},${f(e[2])});float ax=abs(P.x);
       float head=step(-.17,P.y)*step(ax,.135)*step(-.2,P.z);
       if(head>0.){
        /* colour: blood in the cheeks, nose tip and ears, cooler and darker under the eyes, a yellower forehead */
        float chk=fB(vec3(.042,-.045,-.01),vec3(.03,.028,.03),vec3(ax,P.y,P.z));float nos=fB(vec3(0.,-.045,.03),vec3(.016,.022,.02),P);
        float ear=fB(vec3(.075,-.02,-.075),vec3(.02,.035,.03),vec3(ax,P.y,P.z));float und=fB(vec3(.032,-.016,-.006),vec3(.02,.009,.02),vec3(ax,P.y,P.z));
        float frh=fB(vec3(0.,.05,-.01),vec3(.07,.03,.05),P);
        float lip=fB(vec3(0.,-.073,.014),vec3(.03,.014,.045),P);
        vec3 col=diffuseColor.rgb;float l=dot(col,vec3(.3,.59,.11));col=mix(vec3(l),col,.92);col*=mix(vec3(1.),vec3(1.08,.8,.8),lip*.5);
        col*=mix(vec3(1.),vec3(1.08,.88,.86),chk*.7+nos*.6+ear*.5);col*=mix(vec3(1.),vec3(.86,.84,.92),und*.55);col*=mix(vec3(1.),vec3(1.02,1.,.93),frh*.5);
        /* mottling and pores */
        float mt=fN(vFP*90.)*.6+fN(vFP*260.)*.4;col*=.93+mt*.12;float pore=smoothstep(.72,.82,fN(vFP*1400.));col*=1.-pore*.12*(1.-und);
        roughnessFactor=clamp(roughnessFactor*mix(1.,.72,nos*.8+frh*.5)+pore*.12-(1.-chk)*.02,.32,.95);
        ${o.hair?`/* clipper-cut hair: the hairline across the forehead, receding at the temples, down in front of the ears, low on the nape */
        float hl=mix(.064,.05,smoothstep(.02,.055,ax));hl=mix(hl,.03,smoothstep(-.02,-.05,P.z));
        hl=mix(hl,-.03,smoothstep(.052,.066,ax)*smoothstep(-.03,-.045,P.z));
        float earm=smoothstep(.058,.07,ax)*smoothstep(-.045,-.056,P.z)*(1.-smoothstep(-.098,-.11,P.z));hl=mix(hl,.012,earm);
        hl=mix(hl,-.09,smoothstep(-.1,-.125,P.z));
        float hm=smoothstep(hl-.004,hl+.008+fN(vFP*300.)*.006,P.y+(fN(vFP*80.)-.5)*.006)*step(-.14,P.y);
        float strand=smoothstep(.3,.8,fN(vFP*700.));
        vec3 hcol=vec3(${hc.map(f).join(',')});col=mix(col,mix(col*.4,hcol*(.5+strand*.1),.92),hm*.95);roughnessFactor=mix(roughnessFactor,.78,hm);`:''}
        ${o.beard?`/* a couple of days of beard: below a line from under the nose along the cheek to the jaw angle, down to under the
           chin; the moustache line over the upper lip; never on the lips */
        float yb=-.052-ax*.42;float bm=smoothstep(yb+.006,yb-.012,P.y)*smoothstep(-.162,-.138,P.y)*smoothstep(-.115,-.085,P.z)*(1.-smoothstep(.074,.088,ax));
        bm=max(bm,fB(vec3(0.,-.06,.016),vec3(.03,.009,.03),P));bm*=1.-lip;
        float st=smoothstep(.5,.78,fN(vFP*2600.))*(.7+.3*fN(vFP*120.));col=mix(col,col*mix(vec3(1.),vec3(${hc.map(x=>f(x*1.5+.1)).join(',')}),.9),bm*${f(o.beard)}*(.35+st*.65));`:''}
        diffuseColor.rgb=col;}}`);
    s.fragmentShader=fs;};
  m.customProgramCacheKey=()=>pk+'|face'+key;m.needsUpdate=true;return m;}
