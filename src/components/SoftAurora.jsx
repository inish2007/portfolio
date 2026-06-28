import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './SoftAurora.css';

function hexToVec3(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}

const vertex = `
  attribute vec2 uv, position;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `
  precision highp float;
  uniform float uTime, uSpeed, uScale, uBrightness, uNoiseFreq, uNoiseAmp;
  uniform float uBandHeight, uBandSpread, uOctaveDecay, uLayerOffset, uColorSpeed, uMouseInfluence;
  uniform vec3 uResolution, uColor1, uColor2;
  uniform vec2 uMouse;
  uniform bool uEnableMouse;
  varying vec2 vUv;
  #define TAU 6.28318

  vec3 gHash(vec3 p) {
    p = vec3(dot(p,vec3(127.1,311.7,234.6)), dot(p,vec3(269.5,183.3,198.3)), dot(p,vec3(169.5,283.3,156.9)));
    vec3 h = fract(sin(p) * 43758.5453123);
    float phi = acos(2.0 * h.x - 1.0), theta = TAU * h.y;
    return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
  }

  float qSmooth(float t) {
    float t2 = t*t, t3 = t*t2;
    return 6.0*t3*t2 - 15.0*t2*t2 + 10.0*t3;
  }

  vec3 cosGrad(float t, vec3 a, vec3 b, vec3 c, vec3 d) { return a + b*cos(TAU*(c*t+d)); }

  float perlin(float amp, float freq, float px, float py, float pz) {
    float x=px*freq, y=py*freq, fx=floor(x), fy=floor(y), fz=floor(pz), cx=ceil(x), cy=ceil(y), cz=ceil(pz);
    float d000=dot(gHash(vec3(fx,fy,fz)),vec3(x-fx,y-fy,pz-fz));
    float d100=dot(gHash(vec3(cx,fy,fz)),vec3(x-cx,y-fy,pz-fz));
    float d010=dot(gHash(vec3(fx,cy,fz)),vec3(x-fx,y-cy,pz-fz));
    float d110=dot(gHash(vec3(cx,cy,fz)),vec3(x-cx,y-cy,pz-fz));
    float d001=dot(gHash(vec3(fx,fy,cz)),vec3(x-fx,y-fy,pz-cz));
    float d101=dot(gHash(vec3(cx,fy,cz)),vec3(x-cx,y-fy,pz-cz));
    float d011=dot(gHash(vec3(fx,cy,cz)),vec3(x-fx,y-cy,pz-cz));
    float d111=dot(gHash(vec3(cx,cy,cz)),vec3(x-cx,y-cy,pz-cz));
    float sx=qSmooth(x-fx), sy=qSmooth(y-fy), sz=qSmooth(pz-fz);
    return amp*mix(mix(mix(d000,d100,sx),mix(d010,d110,sx),sy),mix(mix(d001,d101,sx),mix(d011,d111,sx),sy),sz);
  }

  // Shared band shape, used by the large- and medium-scale layers (3 octaves
  // each, same as the original two-layer version). Returns a soft, two-part
  // falloff: a tight bright core blended with a wider, gentler glow — this is
  // the cheap analytic stand-in for "light diffusing into surrounding
  // pixels" without any real blur/convolution pass.
  float aurora(float t, vec2 shift, float freqMul) {
    vec2 uv=gl_FragCoord.xy/uResolution.y+shift, samplePoint=uv*uScale*freqMul;
    float n=0.0, freq=uNoiseFreq, amp=uNoiseAmp;
    for(float i=0.0;i<3.0;i++){ n+=perlin(amp,freq,samplePoint.x,samplePoint.y,t); amp*=uOctaveDecay; freq*=2.0; }
    float band=uv.y*10.0-uBandHeight*10.0;
    float dist=abs(n+band);

    float core=exp(uBandSpread*(1.0-1.35*dist));
    float glow=exp(uBandSpread*0.4*(1.0-1.35*dist));
    return 0.3*max(core*0.55+glow*0.45,0.0);
  }

  // Cheap single-octave variant for the fine-detail layer — small, fast-moving
  // structure doesn't need a fractal stack, so this skips the octave loop and
  // the dual-falloff blend to keep the extra layer nearly free.
  float auroraDetail(float t, vec2 shift, float freqMul) {
    vec2 uv=gl_FragCoord.xy/uResolution.y+shift, samplePoint=uv*uScale*freqMul;
    float n=perlin(uNoiseAmp*0.8, uNoiseFreq*2.0, samplePoint.x, samplePoint.y, t);
    float band=uv.y*10.0-uBandHeight*10.0;
    float dist=abs(n+band);
    return 0.3*max(exp(uBandSpread*(1.0-1.5*dist)),0.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.y;
    float t = uTime * uSpeed;

    vec2 mouseShift = vec2(0.0);
    if (uEnableMouse) {
      mouseShift = (uMouse - 0.5) * uMouseInfluence;
    }

    // Three depth layers, each with its own scale/speed/opacity/parallax
    // weight: large (slow, broad, barely reacts to mouse), medium (the
    // original behaviour, unchanged), fine (fast, small, subtle, reacts most
    // — nearest layer). Combined weights stay close to the original 2-layer
    // total so brightness doesn't creep up just from adding depth.
    float aLarge = aurora(t * 0.55, mouseShift * 0.5, 0.55);
    float aMid   = aurora(t + uLayerOffset, mouseShift * 0.8, 1.0);
    float aFine  = auroraDetail(t * 1.5 + uLayerOffset * 1.6, mouseShift * 1.15, 2.4);

    // Vertical atmospheric fade — strongest low in the frame, thinning out
    // toward the top, the way a real aurora's glow tapers into clear sky.
    float verticalFade = 1.0 - smoothstep(0.2, 1.05, uv.y);

    float total = (aLarge * 0.7 + aMid * 0.9 + aFine * 0.35) * uBrightness * verticalFade;

    // Horizontal + slow temporal color drift: position along the width of
    // the screen sets most of the hue, time slowly slides that mapping along
    // — so different regions show different colors at once (cyan/purple/blue
    // across the frame) instead of the whole aurora tinting in lockstep.
    float colorT = fract(uv.x * 0.2 + uTime * uColorSpeed * 0.035);
    vec3 col = cosGrad(colorT,
      (uColor1 + uColor2) * 0.5,
      (uColor1 - uColor2) * 0.5,
      vec3(1.0),
      vec3(0.0, 0.33, 0.67)
    );

    // Smooth alpha ramp instead of a direct linear multiply — removes the
    // hard edge where the band's exponential falloff would otherwise read as
    // a cutoff, while keeping the same peak alpha (0.85) as before.
    float alpha = smoothstep(0.0, 0.8, total) * 0.85;

    gl_FragColor = vec4(col * total, alpha);
  }
`;

export default function SoftAurora({
  speed = 0.45, scale = 1.8, brightness = 1.2, color1 = '#00D4FF', color2 = '#5A189A',
  noiseFrequency = 2, noiseAmplitude = 0.9, bandHeight = 0.45, bandSpread = 0.85,
  octaveDecay = 0.15, layerOffset = 1.2, colorSpeed = 1.0,
  enableMouseInteraction = true, mouseInfluence = 0.188,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const constrainedDevice = (navigator.hardwareConcurrency || 8) <= 4;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetFps = reduceMotion ? 20 : constrainedDevice ? 30 : 45;
    const frameInterval = 1000 / targetFps;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: 1 });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let program, raf = null, resizeTimer = null, lastFrame = 0;
    let isRunning = !document.hidden;
    const currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    const applySize = () => {
      const width = Math.max(1, container.offsetWidth), height = Math.max(1, container.offsetHeight);
      renderer.setSize(width, height);
      if (program) program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
    };
    const resize = () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(applySize, 100); };
    const onMove = event => {
      const bounds = gl.canvas.getBoundingClientRect();
      targetMouse = [(event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top) / bounds.height];
    };
    const onLeave = () => { targetMouse = [0.5, 0.5]; };

    window.addEventListener('resize', resize, { passive: true });
    applySize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex, fragment, uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
        uSpeed: { value: speed }, uScale: { value: scale }, uBrightness: { value: brightness },
        uColor1: { value: hexToVec3(color1) }, uColor2: { value: hexToVec3(color2) },
        uNoiseFreq: { value: noiseFrequency }, uNoiseAmp: { value: noiseAmplitude },
        uBandHeight: { value: bandHeight }, uBandSpread: { value: bandSpread },
        uOctaveDecay: { value: octaveDecay }, uLayerOffset: { value: layerOffset },
        uColorSpeed: { value: colorSpeed },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseInfluence: { value: mouseInfluence },
        uEnableMouse: { value: enableMouseInteraction },
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    if (enableMouseInteraction) {
      gl.canvas.addEventListener('mousemove', onMove, { passive: true });
      gl.canvas.addEventListener('mouseleave', onLeave);
    }

    const tick = time => {
      raf = null;
      if (!isRunning) return;
      if (time - lastFrame >= frameInterval) {
        program.uniforms.uTime.value = time * 0.001;
        if (enableMouseInteraction) {
          currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
          currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
          program.uniforms.uMouse.value[0] = currentMouse[0];
          program.uniforms.uMouse.value[1] = currentMouse[1];
        }
        renderer.render({ scene: mesh });
        lastFrame = time - ((time - lastFrame) % frameInterval);
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibilityChange = () => {
      isRunning = !document.hidden;
      if (!isRunning && raf !== null) { cancelAnimationFrame(raf); raf = null; }
      else if (isRunning && raf === null) { lastFrame = performance.now(); raf = requestAnimationFrame(tick); }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    if (isRunning) raf = requestAnimationFrame(tick);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', resize);
      if (enableMouseInteraction) {
        gl.canvas.removeEventListener('mousemove', onMove);
        gl.canvas.removeEventListener('mouseleave', onLeave);
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [speed, scale, brightness, color1, color2, noiseFrequency, noiseAmplitude, bandHeight, bandSpread, octaveDecay, layerOffset, colorSpeed, enableMouseInteraction, mouseInfluence]);

  return <div ref={containerRef} className="soft-aurora-container" aria-hidden="true" />;
}

