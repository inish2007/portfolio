import { useEffect, useRef } from 'react';
import { useApp } from '../contexts/useApp';

export default function StarField() {
  const { lowPowerMode } = useApp();
  const canvasRef = useRef(null);
  const starsRef = useRef(null);
  const nebulaeRef = useRef(null);
  const dustRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId = null;
    let isRunning = !document.hidden;
    let mouse = { x: 0, y: 0 };

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e) => {
      mouse.x = (e.clientX / W - 0.5);
      mouse.y = (e.clientY / H - 0.5);
    };
    window.addEventListener('mousemove', onMouse);

    // ─── STARS ────────────────────────────────────────────────────────────────
    const STAR_COUNT = W < 768 ? 700 : 1400;
    const COLORS = ['#ffffff', '#ffffff', '#ffffff', '#b8d4ff', '#ffd6a5', '#c8e8ff'];

    if (!starsRef.current) {
      starsRef.current = Array.from({ length: STAR_COUNT }, () => {
        const z = Math.random() * 0.85 + 0.15;
        const isGiant = Math.random() > 0.985;
        const isMid = !isGiant && Math.random() > 0.92;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          z,
          r: isGiant
            ? Math.random() * 1.2 + 1.6
            : isMid
              ? Math.random() * 0.5 + 0.7
              : Math.random() * 0.35 + 0.15,
          isGiant,
          isMid,
          alpha: Math.random() * 0.45 + 0.55,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.018 + 0.004,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.008 + 0.002,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          mouseP: z * 12,
        };
      });
    }
    const stars = starsRef.current;

    // ─── DUST LANES (dark ISM extinction bands) ────────────────────────────────
    const dustLanes = [
      { angle: -0.28, y: 0.42, thickness: 0.05, alpha: 0.18 },
      { angle: -0.22, y: 0.55, thickness: 0.03, alpha: 0.12 },
      { angle: -0.32, y: 0.35, thickness: 0.025, alpha: 0.09 },
    ];

    // ─── SPACE DUST PARTICLES ─────────────────────────────────────────────────
    const DUST_COUNT = W < 768 ? 180 : 400;
    if (!dustRef.current) {
      dustRef.current = Array.from({ length: DUST_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        alpha: Math.random() * 0.12 + 0.03,
        z: Math.random() * 0.12 + 0.03,
      }));
    }
    const dust = dustRef.current;

    // ─── NEBULAE ──────────────────────────────────────────────────────────────
    // Hero safe zone: avoid center 40% width × 35% height
    const safeX = (x) => {
      const cx = W / 2, margin = W * 0.2;
      return x < cx - margin || x > cx + margin;
    };
    const safeY = (y) => {
      const cy = H / 2, margin = H * 0.18;
      return y < cy - margin || y > cy + margin;
    };
    const randSafeX = () => {
      let x;
      do { x = Math.random() * W; } while (!safeX(x));
      return x;
    };
    const randSafeY = () => {
      let y;
      do { y = Math.random() * H; } while (!safeY(y));
      return y;
    };

    const nebulaPalette = [
      '90, 24, 154',    // deep violet
      '138, 43, 226',   // medium violet
      '0, 140, 200',    // cyan
      '0, 80, 160',     // deep blue
      '180, 30, 120',   // magenta
      '60, 0, 100',     // dark purple
    ];

    if (!nebulaeRef.current) {
      nebulaeRef.current = Array.from({ length: 7 }, (_, i) => ({
        x: randSafeX(),
        y: randSafeY(),
        baseR: Math.random() * 200 + 140,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.001 + 0.0003,
        color: nebulaPalette[i % nebulaPalette.length],
        alpha: Math.random() * 0.025 + 0.012,
        driftX: (Math.random() - 0.5) * 0.025,
        driftY: (Math.random() - 0.5) * 0.025,
        mouseP: Math.random() * 6 + 2,
      }));
    }
    const nebulae = nebulaeRef.current;

    // ─── GALAXIES ─────────────────────────────────────────────────────────────
    const galaxies = [
      { rx: 0.18, ry: 0.25, r: 220, color: '130, 40, 210', mouseP: 4 },
      { rx: 0.82, ry: 0.72, r: 175, color: '0, 180, 230', mouseP: 3 },
      { rx: 0.5, ry: 0.88, r: 130, color: '80, 20, 140', mouseP: 2 },
    ];

    // ─── SHOOTING STARS ───────────────────────────────────────────────────────
    let shootingStars = [];
    let lastShoot = 0;

    const spawnShootingStar = (now) => {
      if (shootingStars.length < 3 && now - lastShoot > 4000 && Math.random() < 0.008) {
        shootingStars.push({
          x: Math.random() * W * 0.8,
          y: Math.random() * H * 0.35,
          len: Math.random() * 130 + 90,
          speed: Math.random() * 10 + 7,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.15,
          alpha: 1,
          life: 0,
          maxLife: 45,
        });
        lastShoot = now;
      }
    };

    // ─── SUPERNOVAE ───────────────────────────────────────────────────────────
    let supernovae = [];
    let lastNova = 0;

    const spawnSupernova = (now) => {
      if (supernovae.length < 1 && now - lastNova > 30000 && Math.random() < 0.003) {
        supernovae.push({
          x: Math.random() * W * 0.8 + W * 0.1,
          y: Math.random() * H * 0.8 + H * 0.1,
          r: 0,
          maxR: Math.random() * 80 + 60,
          alpha: 1,
          life: 0,
          maxLife: 120,
          color: Math.random() > 0.5 ? '0, 212, 255' : '255, 200, 100',
        });
        lastNova = now;
      }
    };

    // ─── TRIPLE MILKY WAY BANDS ───────────────────────────────────────────────
    const milkyWayBands = [
      { angle: -0.22, opacity: 0.055, hMult: 0.48, color: '255, 255, 255', scrollMult: 0.04 },
      { angle: -0.18, opacity: 0.030, hMult: 0.32, color: '90, 24, 154', scrollMult: 0.05 },
      { angle: -0.28, opacity: 0.022, hMult: 0.22, color: '0, 160, 220', scrollMult: 0.03 },
    ];

    // ─── DRAW ─────────────────────────────────────────────────────────────────
    const draw = (ts) => {
      animId = null;
      if (!isRunning) return;
      if (lowPowerMode) {
        // Draw a single frame with a beautiful static background and return
        ctx.fillStyle = '#04060f';
        ctx.fillRect(0, 0, W, H);

        // Add static gradient glows for galaxies
        galaxies.forEach(g => {
          const px = g.rx * W;
          const py = g.ry * H;
          const grad = ctx.createRadialGradient(px, py, 0, px, py, g.r);
          grad.addColorStop(0, 'rgba(255,255,255,0.03)');
          grad.addColorStop(0.2, `rgba(${g.color},0.015)`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, g.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Add static nebulae
        nebulae.forEach(n => {
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.baseR);
          grad.addColorStop(0, `rgba(${n.color},${n.alpha * 0.4})`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.baseR, 0, Math.PI * 2);
          ctx.fill();
        });

        // Add static stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        stars.slice(0, 300).forEach(s => {
          ctx.fillRect(s.x, s.y, s.r > 1 ? 1.5 : 1, s.r > 1 ? 1.5 : 1);
        });

        return; // Stops requesting new frames
      }

      ctx.fillStyle = '#04060f';
      ctx.fillRect(0, 0, W, H);

      const scroll = window.scrollY;
      const mx = mouse.x;
      const my = mouse.y;

      // 1. Triple Milky Way
      milkyWayBands.forEach(b => {
        const grad = ctx.createLinearGradient(W * 0.05, 0, W * 0.95, H);
        grad.addColorStop(0, 'rgba(4,6,15,0)');
        grad.addColorStop(0.45, `rgba(${b.color},${b.opacity})`);
        grad.addColorStop(0.55, `rgba(${b.color},${b.opacity * 1.4})`);
        grad.addColorStop(1, 'rgba(4,6,15,0)');
        ctx.save();
        ctx.translate(W / 2, H / 2 - scroll * b.scrollMult);
        ctx.rotate(b.angle);
        ctx.fillStyle = grad;
        ctx.fillRect(-W * 1.6, -H * b.hMult, W * 3.2, H * b.hMult * 2);
        ctx.restore();
      });

      // 2. Dust lanes (dark bands crossing the MW)
      ctx.globalCompositeOperation = 'multiply';
      dustLanes.forEach(dl => {
        const grad = ctx.createLinearGradient(0, H * dl.y - H * dl.thickness, 0, H * dl.y + H * dl.thickness);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, `rgba(0,0,0,${dl.alpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(dl.angle);
        ctx.fillStyle = grad;
        ctx.fillRect(-W * 1.5, -H * 0.6, W * 3, H * 1.2);
        ctx.restore();
      });
      ctx.globalCompositeOperation = 'source-over';

      ctx.globalCompositeOperation = 'lighter';

      // 3. Galaxies
      galaxies.forEach(g => {
        const px = g.rx * W + mx * g.mouseP;
        const py = ((g.ry * H - scroll * 0.07 + my * g.mouseP + H) % H);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, g.r);
        grad.addColorStop(0, 'rgba(255,255,255,0.06)');
        grad.addColorStop(0.2, `rgba(${g.color},0.04)`);
        grad.addColorStop(0.6, `rgba(${g.color},0.012)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, g.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Nebulae
      nebulae.forEach(n => {
        n.phase += n.phaseSpeed;
        n.x += n.driftX;
        n.y += n.driftY;
        if (n.x < -n.baseR) n.x = W + n.baseR;
        if (n.x > W + n.baseR) n.x = -n.baseR;
        if (n.y < -n.baseR) n.y = H + n.baseR;
        if (n.y > H + n.baseR) n.y = -n.baseR;

        const nx = n.x + mx * n.mouseP;
        const ny = (n.y - scroll * 0.1 + my * n.mouseP + H) % H;
        const dr = n.baseR + Math.sin(n.phase) * 30;

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, dr);
        grad.addColorStop(0, `rgba(${n.color},${n.alpha})`);
        grad.addColorStop(0.4, `rgba(${n.color},${n.alpha * 0.4})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, dr, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Space dust particles
      dust.forEach(d => {
        const dy = (d.y - scroll * d.z + H) % H;
        const dx = d.x + mx * d.z * 8;
        ctx.fillStyle = `rgba(200,220,255,${d.alpha})`;
        ctx.fillRect(dx, dy, 1, 1);
      });

      // 6. Stars — crisp tiny glowy points
      stars.forEach(s => {
        s.twinkle += s.twinkleSpeed;
        s.pulse += s.pulseSpeed;

        const sx = ((s.x + mx * s.mouseP + W) % W);
        const sy = ((s.y - scroll * s.z * 0.6 + my * s.mouseP + H) % H);

        const twinkleFactor = 0.6 + 0.4 * Math.sin(s.twinkle);
        const pulseFactor = 1 + Math.sin(s.pulse) * 0.25;
        const a = Math.min(s.alpha * twinkleFactor * pulseFactor, 1);

        ctx.globalAlpha = Math.max(0.05, a);

        if (s.r < 0.6) {
          // Tiny: single pixel rect, fastest path
          ctx.fillStyle = s.color;
          ctx.fillRect(sx, sy, 1, 1);
        } else if (s.r < 1.1 && !s.isGiant) {
          // Small: crisp dot + very faint inner glow
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.fill();

          if (s.isMid) {
            const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3.5);
            glow.addColorStop(0, s.color === '#ffffff' ? 'rgba(160,200,255,0.18)' : `${s.color}25`);
            glow.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(sx, sy, s.r * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
          }
        } else {
          // Giant: bright core + multi-stop glow halo
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          const haloR = s.r * 5.5;
          const halo = ctx.createRadialGradient(sx, sy, s.r * 0.5, sx, sy, haloR);
          const hc = s.color === '#ffd6a5' ? '255,200,120' : '120,180,255';
          halo.addColorStop(0, `rgba(${hc},0.30)`);
          halo.addColorStop(0.3, `rgba(${hc},0.10)`);
          halo.addColorStop(0.7, `rgba(${hc},0.03)`);
          halo.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();

          // Diffraction cross spike
          ctx.globalAlpha = Math.max(0, a * 0.25);
          ctx.strokeStyle = s.color === '#ffd6a5' ? 'rgba(255,210,140,0.5)' : 'rgba(160,210,255,0.5)';
          ctx.lineWidth = 0.5;
          const spikeLen = s.r * 8;
          ctx.beginPath();
          ctx.moveTo(sx - spikeLen, sy);
          ctx.lineTo(sx + spikeLen, sy);
          ctx.moveTo(sx, sy - spikeLen);
          ctx.lineTo(sx, sy + spikeLen);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // 7. Shooting stars
      spawnShootingStar(ts);
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life++;
        ss.alpha = 1 - ss.life / ss.maxLife;
        if (ss.life >= ss.maxLife || ss.x > W || ss.y > H) {
          shootingStars.splice(i, 1);
          continue;
        }
        const tx = ss.x - Math.cos(ss.angle) * ss.len;
        const ty = ss.y - Math.sin(ss.angle) * ss.len;
        const sg = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
        sg.addColorStop(0, 'transparent');
        sg.addColorStop(0.3, `rgba(100,50,200,${ss.alpha * 0.3})`);
        sg.addColorStop(1, `rgba(200,240,255,${ss.alpha})`);
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }

      // 8. Supernovae
      spawnSupernova(ts);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = supernovae.length - 1; i >= 0; i--) {
        const sn = supernovae[i];
        sn.life++;
        sn.r = (sn.life / sn.maxLife) * sn.maxR;
        sn.alpha = sn.life < sn.maxLife * 0.2
          ? sn.life / (sn.maxLife * 0.2)
          : 1 - (sn.life - sn.maxLife * 0.2) / (sn.maxLife * 0.8);
        if (sn.life >= sn.maxLife) { supernovae.splice(i, 1); continue; }

        const ng = ctx.createRadialGradient(sn.x, sn.y, 0, sn.x, sn.y, sn.r);
        ng.addColorStop(0, `rgba(255,255,255,${sn.alpha})`);
        ng.addColorStop(0.15, `rgba(${sn.color},${sn.alpha * 0.6})`);
        ng.addColorStop(0.5, `rgba(${sn.color},${sn.alpha * 0.15})`);
        ng.addColorStop(1, 'transparent');
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(sn.x, sn.y, sn.r, 0, Math.PI * 2);
        ctx.fill();

        // Supernova cross spike
        ctx.globalAlpha = sn.alpha * 0.4;
        ctx.strokeStyle = `rgba(255,255,255,0.7)`;
        ctx.lineWidth = 1;
        const sl = sn.r * 1.8;
        ctx.beginPath();
        ctx.moveTo(sn.x - sl, sn.y); ctx.lineTo(sn.x + sl, sn.y);
        ctx.moveTo(sn.x, sn.y - sl); ctx.lineTo(sn.x, sn.y + sl);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = 'source-over';

      animId = requestAnimationFrame(draw);
    };

    const onVisibilityChange = () => {
      isRunning = !document.hidden;
      if (!isRunning && animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      } else if (isRunning && animId === null) {
        animId = requestAnimationFrame(draw);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    if (isRunning) animId = requestAnimationFrame(draw);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [lowPowerMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 h-full w-full pointer-events-none z-0"
    />
  );
}
