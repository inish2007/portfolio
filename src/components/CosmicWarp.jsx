    import { useEffect, useRef } from 'react';

    /**
     * CosmicWarp — transparent warp-tunnel canvas overlay.
     * Renders over the BootSequence canvas (no background fill).
     *
     * Props
     *   speed     – animation speed multiplier (default 1)
     *   intensity – 0-1 depth of warp effects (default 0.85)
     *   className – extra CSS classes on wrapper div
     *   style     – extra inline styles on wrapper div
     *
     * Bugs fixed vs v1:
     *   • Spiral built after resize() so W/H are real values
     *   • initParticles guards against re-init on every resize
     *   • First-frame dt spike neutralised (lastNow sentinel = -1)
     *   • lineCap / ctx state reset after each streak draw pass
     *   • globalAlpha explicitly reset after every composite section
     */

    // ── Desaturated "premium space" palette ──────────────────────────────────────
    // Original vivid values pulled ~12% toward neutral grey.
    // Formula: channel = Math.round(vivid * 0.88 + 128 * 0.12)
    // Applied per-channel so hue is preserved but chroma is quieter.

    const PAL = {
    // cyan:    [0,220,255] → [15,210,240]
    cyan:    [15,  210, 240],
    // violet:  [160,60,255] → [156,68,240]
    violet:  [156,  68, 240],
    // magenta: [220,40,180] → [209,51,174]
    magenta: [209,  51, 174],
    // blue:    [0,180,255]  → [15,174,240]
    blueCyan:[15,  174, 240],
    // white: stays white (no hue to desaturate)
    white:   [240, 240, 248],
    // sky:     [80,200,255] → [86,192,240]
    sky:     [86,  192, 240],
    // lavender:[200,100,255]→ [192,103,240]
    lavender:[192, 103, 240],
    // mist violet: [120,30,200] → [130,41,192]
    mistV:   [130,  41, 192],
    // mist cyan:   [0,200,255]  → [15,192,240]
    mistC:   [15,  192, 240],
    // mist magenta:[200,40,160] → [192,51,155]
    mistM:   [192,  51, 155],
    // mist blue:   [60,80,220]  → [68,86,210]
    mistB:   [68,   86, 210],
    // mist purple: [180,60,255] → [174,68,240]
    mistP:   [174,  68, 240],
    };

    const STREAK_COLORS = [
    PAL.cyan, PAL.violet, PAL.magenta,
    PAL.blueCyan, PAL.white, PAL.sky, PAL.lavender,
    ];

    const MIST_COLORS = [
    PAL.mistV, PAL.mistC, PAL.mistM, PAL.mistB, PAL.mistP,
    ];

    const RING_COLORS = [
    PAL.cyan, PAL.violet, PAL.magenta, PAL.blueCyan,
    ];

    // ── Helpers ───────────────────────────────────────────────────────────────────
    function rgb(c, a) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    }

    export default function CosmicWarp({ speed = 1, intensity = 0.85, className = '', style = {} }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // alpha:true — clearRect produces real transparency over the boot canvas
        const ctx = canvas.getContext('2d', { alpha: true });
        let raf;
        let W = 0, H = 0, CX = 0, CY = 0;
        let initialised = false;

        // ── Streaks ───────────────────────────────────────────────────────────────
        const STREAK_COUNT = 200; // reduced from 220 — fewer but cleaner
        const streaks = [];

        function randStreak() {
        const dist = 1 + Math.random() * Math.min(W, H) * 0.50;
        return {
            angle:  Math.random() * Math.PI * 2,
            dist,
            speed:  (0.5 + Math.random() * 1.4) * speed,
            color:  STREAK_COLORS[Math.floor(Math.random() * STREAK_COLORS.length)],
            // max alpha capped at 0.82 — avoids blown-out white streaks
            alpha:  0.12 + Math.random() * 0.70,
            thick:  0.35 + Math.random() * 1.2,
        };
        }

        function initStreaks() {
        streaks.length = 0;
        for (let i = 0; i < STREAK_COUNT; i++) {
            const s = randStreak();
            // scatter initial depths so they don't all arrive at once
            s.dist = Math.random() * Math.min(W, H) * 0.50;
            streaks.push(s);
        }
        }

        // ── Mist ─────────────────────────────────────────────────────────────────
        const MIST_COUNT = 70; // reduced from 90
        const mists = [];

        function randMist() {
        return {
            x:     CX + (Math.random() - 0.5) * W * 1.2,
            y:     CY + (Math.random() - 0.5) * H * 1.2,
            r:     8  + Math.random() * 24,
            // alpha ceiling lowered to 0.10 — mist is atmosphere, not foreground
            alpha: 0.03 + Math.random() * 0.07,
            vx:    (Math.random() - 0.5) * 0.35 * speed,
            vy:    (Math.random() - 0.5) * 0.35 * speed,
            color: MIST_COLORS[Math.floor(Math.random() * MIST_COLORS.length)],
            life:  Math.random(),
            grow:  0.00015 + Math.random() * 0.0006,
        };
        }

        function initMists() {
        mists.length = 0;
        for (let i = 0; i < MIST_COUNT; i++) mists.push(randMist());
        }

        // ── Rings ─────────────────────────────────────────────────────────────────
        const rings = [];
        let nextRing = 0; // ms elapsed, not performance.now

        function spawnRing(elapsed) {
        const interval = 340 / speed;
        if (elapsed < nextRing) return;
        nextRing = elapsed + interval;
        rings.push({
            r:     0,
            maxR:  Math.max(W, H) * 0.70,
            // ring alpha capped at 0.55 — was 0.75, now subtler
            alpha: 0.55,
            color: RING_COLORS[Math.floor(Math.random() * RING_COLORS.length)],
            thick: 1.0 + Math.random() * 1.5,
            spd:   (3.2 + Math.random() * 2.8) * speed,
        });
        }

        // ── Spiral (built after W/H are known) ────────────────────────────────────
        // Bug fix: was built before resize() so W=H=0, making all radii = 0.
        let spiralBase = [];
        let spiralAngle = 0;

        function buildSpiral() {
        spiralBase = [];
        const PTS = 380;
        const maxR = Math.min(W, H) * 0.42;
        for (let i = 0; i < PTS; i++) {
            const t     = i / PTS;
            const arm   = i % 3;
            const theta = t * Math.PI * 6 + (arm * Math.PI * 2) / 3;
            const r     = t * maxR + Math.random() * 12;
            const col   = MIST_COLORS[Math.floor(Math.random() * MIST_COLORS.length)];
            // alpha proportional to radius so arms fade from center out
            spiralBase.push({
            bx:    Math.cos(theta) * r,
            by:    Math.sin(theta) * r,
            r:     0.5 + Math.random() * 1.5,
            // max alpha 0.22 — spiral is subtle background texture
            a:     0.04 + t * 0.18 * intensity,
            color: col,
            });
        }
        }

        // ── Resize ────────────────────────────────────────────────────────────────
        const resize = () => {
        W  = canvas.offsetWidth  || window.innerWidth;
        H  = canvas.offsetHeight || window.innerHeight;
        CX = W / 2;
        CY = H / 2;
        canvas.width  = W;
        canvas.height = H;

        if (!initialised) {
            // Only build particle systems once — avoids pop on resize
            buildSpiral();
            initStreaks();
            initMists();
            initialised = true;
        } else {
            // On resize just rebuild spiral so it fits new dimensions
            buildSpiral();
        }
        };

        // ── Draw loop ─────────────────────────────────────────────────────────────
        // Bug fix: sentinel -1 so first frame dt = 0, not now (~5000ms on slow mount)
        let lastNow = -1;
        let elapsed = 0;

        function draw(now) {
        const dt = lastNow < 0 ? 0 : Math.min(now - lastNow, 40);
        lastNow = now;
        elapsed += dt;

        // Clear to fully transparent — we overlay the boot canvas
        ctx.clearRect(0, 0, W, H);

        // ── 1. Galaxy spiral ─────────────────────────────────────────────────
        spiralAngle += 0.00015 * speed;
        const cosA = Math.cos(spiralAngle);
        const sinA = Math.sin(spiralAngle);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        for (const p of spiralBase) {
            const sx = CX + p.bx * cosA - p.by * sinA;
            const sy = CY + p.bx * sinA + p.by * cosA;
            ctx.beginPath();
            ctx.arc(sx, sy, p.r, 0, Math.PI * 2);
            ctx.fillStyle = rgb(p.color, p.a);
            ctx.fill();
        }

        // ── 2. Nebula mist ───────────────────────────────────────────────────
        ctx.globalCompositeOperation = 'lighter';
        for (const m of mists) {
            m.x    += m.vx;
            m.y    += m.vy;
            m.life += m.grow;
            // Recycle when life expires or mist drifts off-screen
            if (
            m.life > 1 ||
            m.x < -(m.r * 2) || m.x > W + m.r * 2 ||
            m.y < -(m.r * 2) || m.y > H + m.r * 2
            ) {
            const fresh = randMist();
            // Respawn at a random edge so mist flows in from outside
            const edge = Math.floor(Math.random() * 4);
            fresh.x = edge === 0 ? -fresh.r : edge === 1 ? W + fresh.r
                    : CX + (Math.random() - 0.5) * W * 1.4;
            fresh.y = edge === 2 ? -fresh.r : edge === 3 ? H + fresh.r
                    : CY + (Math.random() - 0.5) * H * 1.4;
            fresh.life = 0;
            Object.assign(m, fresh);
            }
            const pulse  = 0.72 + 0.28 * Math.sin(m.life * Math.PI);
            const radius = m.r * (1 + m.life * 0.35);
            const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, radius);
            g.addColorStop(0, rgb(m.color, m.alpha * pulse));
            g.addColorStop(1, rgb(m.color, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(m.x, m.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // ── 3. Warp star-streaks ─────────────────────────────────────────────
        ctx.lineCap = 'round';
        const halfMin = Math.min(W, H) * 0.5;
        const scale   = Math.min(W, H) / 2;
        const proj    = scale * scale * 0.1; // constant part of projection

        for (const s of streaks) {
            const prevDist = s.dist;
            s.dist = Math.max(0.08, s.dist - dt * s.speed * 0.065);

            // Simple perspective projection from vanishing point
            const cosS = Math.cos(s.angle);
            const sinS = Math.sin(s.angle);
            const curX  = CX + cosS * proj / s.dist;
            const curY  = CY + sinS * proj / s.dist;
            const prevX = CX + cosS * proj / prevDist;
            const prevY = CY + sinS * proj / prevDist;

            const progress = 1 - s.dist / halfMin;
            // alpha ramp: fade in from center, cap below 1 for premium feel
            const alpha = Math.min(s.alpha, progress * 1.6) * 0.9;
            const thick = s.thick * (1 + progress * 2.2);

            if (alpha < 0.01) {
            if (s.dist <= 0.5) Object.assign(s, randStreak());
            continue;
            }

            // Core streak
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(curX, curY);
            ctx.strokeStyle = rgb(s.color, alpha);
            ctx.lineWidth   = thick;
            ctx.stroke();

            // Soft glow halo — only for the brighter streaks, kept subtle
            if (alpha > 0.45) {
            ctx.lineWidth   = thick * 2.5;
            ctx.strokeStyle = rgb(s.color, alpha * 0.10);
            ctx.stroke();
            }

            if (s.dist <= 0.5) Object.assign(s, randStreak());
        }

        // ── 4. Energy rings ──────────────────────────────────────────────────
        spawnRing(elapsed);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = rings.length - 1; i >= 0; i--) {
            const ring = rings[i];
            ring.r     += ring.spd;
            ring.alpha *= 0.972; // slightly faster fade — 0.975→0.972

            if (ring.r > ring.maxR || ring.alpha < 0.006) {
            rings.splice(i, 1);
            continue;
            }

            ctx.lineWidth   = ring.thick;
            ctx.strokeStyle = rgb(ring.color, ring.alpha);
            ctx.beginPath();
            ctx.arc(CX, CY, ring.r, 0, Math.PI * 2);
            ctx.stroke();

            // Bloom — kept very subtle at 0.09 (was 0.12)
            ctx.lineWidth   = ring.thick * 5;
            ctx.strokeStyle = rgb(ring.color, ring.alpha * 0.09);
            ctx.beginPath();
            ctx.arc(CX, CY, ring.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // ── 5. Central tunnel mouth ───────────────────────────────────────────
        // Cyan-only, no white — avoids any white flash
        const tunnelR = Math.min(W, H) * (0.08 + 0.035 * Math.sin(elapsed * 0.0008 * speed));
        const tg = ctx.createRadialGradient(CX, CY, 0, CX, CY, tunnelR * 3.2);
        tg.addColorStop(0,    rgb(PAL.cyan,    0.14 * intensity));
        tg.addColorStop(0.18, rgb(PAL.blueCyan,0.10 * intensity));
        tg.addColorStop(0.42, rgb(PAL.violet,  0.07 * intensity));
        tg.addColorStop(0.65, rgb(PAL.magenta, 0.04 * intensity));
        tg.addColorStop(1,    rgb(PAL.cyan,    0));
        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.arc(CX, CY, tunnelR * 3.2, 0, Math.PI * 2);
        ctx.fill();

        // ── 6. Edge vignette ─────────────────────────────────────────────────
        // Darkens edges toward the boot canvas background colour (#020108)
        const innerR = Math.min(W, H) * 0.30;
        const outerR = Math.max(W, H) * 0.80;
        const vig = ctx.createRadialGradient(CX, CY, innerR, CX, CY, outerR);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, `rgba(2,1,8,${0.68 * intensity})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        raf = requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', resize);
        raf = requestAnimationFrame(draw);

        return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speed, intensity]);

    return (
        <div
        className={className}
        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
        >
        <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: '100%' }}
        />
        </div>
    );
    }