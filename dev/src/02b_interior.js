/* ---------- indoors is darker than outdoors. The sky light (the hemisphere and the environment reflections) reaches a
   room only through its windows and door, so every surface inside a house's walls gets a fraction of it; the sun still
   comes in where the shadow map lets it - a patch on the floor under a window. The rooms are fixed boxes (the houses
   never move), written into the shared shader chunks before anything is compiled: a per-vertex test against each box
   (cheap: a dozen compares per vertex, nothing per pixel). The eye adapts a little when you step inside (see the frame
   loop's exposure). ---------- */
const INTERIORS=[];
(function interiors(){const LR=.125,ok=hd=>!hd.ruin&&!hd.burnt&&hd.id!=='s1';
  for(const hd of VILL.houses){if(!ok(hd))continue;const r=villRect(hd,-hd.W/2+LR*.4,hd.W/2-LR*.4,-hd.D/2+LR*.4,hd.D/2-LR*.4);INTERIORS.push([r.x1,r.x2,r.z1,r.z2,3.05]);}
  /* the farmhouse in the sector */INTERIORS.push([HX-3.38,HX+3.38,HZ-2.88,HZ+2.88,3.0]);
  const f=v=>v.toFixed(3);let body='';for(const b of INTERIORS)body+=`vIntK=max(vIntK,intK(fogWP.xyz,vec4(${f(b[0])},${f(b[1])},${f(b[2])},${f(b[3])}),${f(b[4])}));\n`;
  const fn='float intK(vec3 p,vec4 b,float y1){float e=min(min(p.x-b.x,b.y-p.x),min(p.z-b.z,b.w-p.z));return smoothstep(-.02,.06,e)*step(p.y,y1);}\n';
  T.ShaderChunk.fog_pars_vertex=T.ShaderChunk.fog_pars_vertex.replace('varying vec3 vFogV;','varying vec3 vFogV;\nvarying float vIntK;\n'+fn);
  T.ShaderChunk.fog_vertex=T.ShaderChunk.fog_vertex.replace('vFogV=fogWP.xyz-cameraPosition;','vFogV=fogWP.xyz-cameraPosition;\nvIntK=0.;\n'+body);
  T.ShaderChunk.fog_pars_fragment=T.ShaderChunk.fog_pars_fragment.replace('varying vec3 vFogV;','varying vec3 vFogV;\nvarying float vIntK;');
  T.ShaderChunk.lights_fragment_end='#if defined(USE_FOG)&&defined(RE_IndirectDiffuse)\n{float ik=1.-.66*vIntK;irradiance*=ik;iblIrradiance*=ik;\n#if defined(RE_IndirectSpecular)\nradiance*=1.-.8*vIntK;\n#endif\n}\n#endif\n'+T.ShaderChunk.lights_fragment_end;
  window.__interiors=INTERIORS;})();
