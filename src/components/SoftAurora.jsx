import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './SoftAurora.css';

function hexToVec3(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255];
}

const vert = `attribute vec2 uv,position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0,1);}`;

const frag = `precision highp float;
uniform float uTime,uSpeed,uScale,uBrightness,uNoiseFreq,uNoiseAmp,uBandHeight,uBandSpread,uOctaveDecay,uLayerOffset,uColorSpeed,uMouseInfluence;
uniform vec3 uResolution,uColor1,uColor2;uniform vec2 uMouse;uniform bool uEnableMouse;
#define TAU 6.28318
vec3 gHash(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,234.6)),dot(p,vec3(269.5,183.3,198.3)),dot(p,vec3(169.5,283.3,156.9)));vec3 h=fract(sin(p)*43758.5453123);float phi=acos(2.0*h.x-1.0),theta=TAU*h.y;return vec3(cos(theta)*sin(phi),sin(theta)*cos(phi),cos(phi));}
float qSmooth(float t){float t2=t*t,t3=t*t2;return 6.0*t3*t2-15.0*t2*t2+10.0*t3;}
vec3 cosGrad(float t,vec3 a,vec3 b,vec3 c,vec3 d){return a+b*cos(TAU*(c*t+d));}
float perlin(float amp,float freq,float px,float py,float pz){float x=px*freq,y=py*freq;float fx=floor(x),fy=floor(y),fz=floor(pz),cx=ceil(x),cy=ceil(y),cz=ceil(pz);float d000=dot(gHash(vec3(fx,fy,fz)),vec3(x-fx,y-fy,pz-fz));float d100=dot(gHash(vec3(cx,fy,fz)),vec3(x-cx,y-fy,pz-fz));float d010=dot(gHash(vec3(fx,cy,fz)),vec3(x-fx,y-cy,pz-fz));float d110=dot(gHash(vec3(cx,cy,fz)),vec3(x-cx,y-cy,pz-fz));float d001=dot(gHash(vec3(fx,fy,cz)),vec3(x-fx,y-fy,pz-cz));float d101=dot(gHash(vec3(cx,fy,cz)),vec3(x-cx,y-fy,pz-cz));float d011=dot(gHash(vec3(fx,cy,cz)),vec3(x-fx,y-cy,pz-cz));float d111=dot(gHash(vec3(cx,cy,cz)),vec3(x-cx,y-cy,pz-cz));float sx=qSmooth(x-fx),sy=qSmooth(y-fy),sz=qSmooth(pz-fz);return amp*mix(mix(mix(d000,d100,sx),mix(d010,d110,sx),sy),mix(mix(d001,d101,sx),mix(d011,d111,sx),sy),sz);}
float aurora(float t,vec2 sh){vec2 uv=gl_FragCoord.xy/uResolution.y+sh;float n=0.0,freq=uNoiseFreq,amp=uNoiseAmp;vec2 sp=uv*uScale;for(float i=0.0;i<3.0;i++){n+=perlin(amp,freq,sp.x,sp.y,t);amp*=uOctaveDecay;freq*=2.0;}float yb=uv.y*10.0-uBandHeight*10.0;return 0.3*max(exp(uBandSpread*(1.0-1.1*abs(n+yb))),0.0);}
void main(){vec2 uv=gl_FragCoord.xy/uResolution.xy;float t=uSpeed*0.4*uTime;vec2 sh=uEnableMouse?(uMouse-0.5)*uMouseInfluence:vec2(0.0);vec3 col=0.99*aurora(t,sh)*cosGrad(uv.x+uTime*uSpeed*0.2*uColorSpeed,vec3(0.5),vec3(0.5),vec3(1.0),vec3(0.3,0.2,0.2))*uColor1;col+=0.99*aurora(t+uLayerOffset,sh)*cosGrad(uv.x+uTime*uSpeed*0.1*uColorSpeed,vec3(0.5),vec3(0.5),vec3(2.0,1.0,0.0),vec3(0.5,0.2,0.25))*uColor2;col*=uBrightness;gl_FragColor=vec4(col,clamp(length(col),0.0,1.0));}`;

export default function SoftAurora({ speed=0.35, scale=1.8, brightness=1.2, color1='#00D4FF', color2='#5A189A', noiseFrequency=2.0, noiseAmplitude=0.9, bandHeight=0.45, bandSpread=0.85, octaveDecay=0.15, layerOffset=1.2, colorSpeed=0.6, enableMouseInteraction=true, mouseInfluence=0.18 }) {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0,0,0,0);
    let program, cur=[0.5,0.5], tar=[0.5,0.5];
    const onMove = e => { const r=gl.canvas.getBoundingClientRect(); tar=[(e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height]; };
    const onLeave = () => { tar=[0.5,0.5]; };
    const resize = () => { renderer.setSize(container.offsetWidth,container.offsetHeight); if(program) program.uniforms.uResolution.value=[gl.canvas.width,gl.canvas.height,gl.canvas.width/gl.canvas.height]; };
    window.addEventListener('resize', resize);
    resize();
    const geo = new Triangle(gl);
    program = new Program(gl, { vertex: vert, fragment: frag, uniforms: { uTime:{value:0}, uResolution:{value:[gl.canvas.width,gl.canvas.height,1]}, uSpeed:{value:speed}, uScale:{value:scale}, uBrightness:{value:brightness}, uColor1:{value:hexToVec3(color1)}, uColor2:{value:hexToVec3(color2)}, uNoiseFreq:{value:noiseFrequency}, uNoiseAmp:{value:noiseAmplitude}, uBandHeight:{value:bandHeight}, uBandSpread:{value:bandSpread}, uOctaveDecay:{value:octaveDecay}, uLayerOffset:{value:layerOffset}, uColorSpeed:{value:colorSpeed}, uMouse:{value:new Float32Array([0.5,0.5])}, uMouseInfluence:{value:mouseInfluence}, uEnableMouse:{value:enableMouseInteraction} }});
    const mesh = new Mesh(gl, { geometry:geo, program });
    container.appendChild(gl.canvas);
    if(enableMouseInteraction){ gl.canvas.addEventListener('mousemove',onMove); gl.canvas.addEventListener('mouseleave',onLeave); }
    let raf;
    const tick = t => { raf=requestAnimationFrame(tick); program.uniforms.uTime.value=t*0.001; if(enableMouseInteraction){ cur[0]+=0.05*(tar[0]-cur[0]); cur[1]+=0.05*(tar[1]-cur[1]); program.uniforms.uMouse.value[0]=cur[0]; program.uniforms.uMouse.value[1]=cur[1]; } renderer.render({scene:mesh}); };
    raf=requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize); if(enableMouseInteraction){ gl.canvas.removeEventListener('mousemove',onMove); gl.canvas.removeEventListener('mouseleave',onLeave); } if(container.contains(gl.canvas)) container.removeChild(gl.canvas); gl.getExtension('WEBGL_lose_context')?.loseContext(); };
  }, [speed,scale,brightness,color1,color2,noiseFrequency,noiseAmplitude,bandHeight,bandSpread,octaveDecay,layerOffset,colorSpeed,enableMouseInteraction,mouseInfluence]);
  return <div ref={ref} className="soft-aurora-container" />;
}
