import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, RefreshCcw } from 'lucide-react';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';

/* ── Three.js: spinning ball that slowly drifts off-screen ─────── */
const BallScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const W = canvas.clientWidth  || 500;
        const H = canvas.clientHeight || 500;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
        camera.position.set(0, 0, 5);

        // Lighting
        scene.add(new THREE.AmbientLight(0x111111, 4));
        const key = new THREE.DirectionalLight(0x00e676, 6);
        key.position.set(3, 5, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x4488ff, 3);
        rim.position.set(-4, 2, -3);
        scene.add(rim);
        const fill = new THREE.PointLight(0x00e676, 2, 12);
        fill.position.set(0, -2, 3);
        scene.add(fill);

        // ── Ball group ──────────────────────────────────────────────
        const ballGroup = new THREE.Group();

        // Main sphere
        const ballMat = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.3,
            metalness: 0.1,
            emissive: 0xffffff,
            emissiveIntensity: 0.03,
        });
        const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), ballMat);
        ballGroup.add(ballMesh);

        // Pentagon patches
        const patchMat = new THREE.MeshStandardMaterial({ color: 0x050a0a, roughness: 0.7 });
        const patchPositions: [number, number, number][] = [
            [0, 1, 0], [0, -1, 0],
            [0.95, 0.3, 0.1], [-0.95, 0.3, 0.1],
            [0.58, -0.8, 0.76], [-0.58, -0.8, 0.76],
            [0, 0.45, 0.9],  [0.86, 0.5, -0.1],
        ];
        patchPositions.forEach(([x, y, z]) => {
            const patch = new THREE.Mesh(new THREE.CircleGeometry(0.32, 5), patchMat);
            const dir = new THREE.Vector3(x, y, z).normalize();
            patch.position.copy(dir.clone().multiplyScalar(1.01));
            patch.lookAt(dir.clone().multiplyScalar(3));
            ballGroup.add(patch);
        });

        // Outer glow ring (wireframe)
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x00e676, wireframe: true, transparent: true, opacity: 0.08,
        });
        ballGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.04, 18, 18), glowMat));

        scene.add(ballGroup);

        // ── Floating particles around the ball ─────────────────────
        const particleCount = 60;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const r = 1.8 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos(2 * Math.random() - 1);
            positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x00e676, size: 0.04, transparent: true, opacity: 0.6,
        });
        scene.add(new THREE.Points(particleGeo, particleMat));

        // ── Orbit ring ─────────────────────────────────────────────
        const orbitRing = new THREE.Mesh(
            new THREE.TorusGeometry(1.5, 0.008, 8, 80),
            new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.25 }),
        );
        orbitRing.rotation.x = Math.PI / 2.5;
        scene.add(orbitRing);

        // ── Animation ──────────────────────────────────────────────
        let running = true, rafId = 0, t = 0;
        const tick = () => {
            if (!running) return;
            rafId = requestAnimationFrame(tick);
            t += 0.016;

            // Ball spin + slow drift off to the right
            ballGroup.rotation.x += 0.012;
            ballGroup.rotation.y += 0.018;
            ballGroup.rotation.z += 0.005;
            ballGroup.position.x = Math.sin(t * 0.3) * 0.4;
            ballGroup.position.y = Math.cos(t * 0.4) * 0.25 + Math.sin(t * 0.8) * 0.1;

            // Orbit ring spin
            orbitRing.rotation.z += 0.008;
            orbitRing.rotation.y += 0.004;

            // Camera subtle bob
            camera.position.x = Math.sin(t * 0.2) * 0.3;
            camera.position.y = Math.cos(t * 0.25) * 0.15;
            camera.lookAt(ballGroup.position);

            // Particle breathe
            particleMat.opacity = 0.4 + Math.sin(t * 1.5) * 0.25;
            fill.intensity = 1.5 + Math.sin(t * 2) * 0.8;

            renderer.render(scene, camera);
        };
        tick();

        const ro = new ResizeObserver(() => {
            const nw = canvas.clientWidth;
            const nh = canvas.clientHeight;
            renderer.setSize(nw, nh, false);
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
        });
        ro.observe(canvas);

        return () => {
            running = false;
            cancelAnimationFrame(rafId);
            ro.disconnect();
            renderer.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ background: 'transparent' }}
        />
    );
};

/* ── Glitch text animation ─────────────────────────────────────── */
const GlitchText = ({ text }: { text: string }) => (
    <div className="relative inline-block select-none">
        <span
            className="font-display font-black text-[clamp(6rem,18vw,14rem)] leading-none tracking-tight text-foreground"
            style={{ WebkitTextStroke: '1px rgba(0,230,118,0.15)' }}
        >
            {text}
        </span>
        {/* Red glitch layer */}
        <motion.span
            className="absolute inset-0 font-display font-black text-[clamp(6rem,18vw,14rem)] leading-none tracking-tight text-red-500/30 pointer-events-none"
            animate={{ x: [-3, 3, -1, 0], opacity: [0, 1, 0, 0] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.8 }}
            aria-hidden
        >
            {text}
        </motion.span>
        {/* Green glitch layer */}
        <motion.span
            className="absolute inset-0 font-display font-black text-[clamp(6rem,18vw,14rem)] leading-none tracking-tight text-primary/40 pointer-events-none"
            animate={{ x: [2, -2, 1, 0], opacity: [0, 1, 0, 0] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.8, delay: 0.05 }}
            aria-hidden
        >
            {text}
        </motion.span>
    </div>
);

/* ── 404 Page ──────────────────────────────────────────────────── */
const NotFound = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">

            {/* Radial glow at top-center */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
            {/* Bottom glow */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-[100px]" />

            {/* Dot grid */}
            <div className="dot-grid absolute inset-0 pointer-events-none" />

            {/* Corner markers */}
            <span aria-hidden className="corner-marker top-6 left-6">+</span>
            <span aria-hidden className="corner-marker top-6 right-6">+</span>
            <span aria-hidden className="corner-marker bottom-6 left-6">+</span>
            <span aria-hidden className="corner-marker bottom-6 right-6">+</span>

            {/* Main layout */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 gap-0 lg:gap-16 px-6 py-16 lg:py-0">

                {/* ── Left: text side ──────────────────────────── */}
                <div className="flex flex-col items-start gap-6 max-w-lg">

                    {/* Section label */}
                    <BlurIn delay={0}>
                        <div className="flex items-center gap-3 font-mono text-[10px] text-muted uppercase tracking-widest">
                            <span className="h-px w-8 bg-primary/40" />
                            <span>~/error/404</span>
                        </div>
                    </BlurIn>

                    {/* Glitch 404 */}
                    <BlurIn delay={0.1}>
                        <GlitchText text="404" />
                    </BlurIn>

                    {/* Heading */}
                    <BlurIn delay={0.2}>
                        <h1 className="font-display font-black text-2xl md:text-3xl text-foreground leading-tight">
                            Ball's Out of<br />
                            <span className="text-primary">Bounds.</span>
                        </h1>
                    </BlurIn>

                    {/* Description */}
                    <BlurIn delay={0.3}>
                        <p className="text-muted text-sm leading-relaxed max-w-sm">
                            Looks like this page took a wrong turn at midfield.
                            The route you're looking for doesn't exist — maybe it was
                            offside, or the ref called it out.
                        </p>
                    </BlurIn>

                    {/* Stat info card */}
                    <BlurIn delay={0.4} className="w-full">
                        <GlassCard className="p-4 flex items-center gap-4 w-full max-w-sm">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <RefreshCcw className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-0.5">Error Code</p>
                                <p className="font-display font-bold text-sm text-foreground">HTTP 404 — Resource Not Found</p>
                            </div>
                            <div className="ml-auto h-2 w-2 rounded-full bg-red-400 animate-pulse shrink-0" />
                        </GlassCard>
                    </BlurIn>

                    {/* CTA buttons */}
                    <BlurIn delay={0.5} className="flex flex-col sm:flex-row gap-3 w-full">
                        <Link
                            to="/"
                            className="btn-primary h-12 px-6 text-sm flex-1 sm:flex-none"
                        >
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="btn-ghost h-12 px-6 text-sm border border-border hover:border-primary/30 flex-1 sm:flex-none"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </button>
                    </BlurIn>

                    {/* Quick links */}
                    <BlurIn delay={0.6}>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Try:</span>
                            {[
                                { label: 'Dashboard', path: '/dashboard' },
                                { label: 'Upload',    path: '/upload'    },
                                { label: 'Analysis',  path: '/analysis'  },
                                { label: 'Help',      path: '/help'      },
                            ].map(({ label, path }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className="font-mono text-[10px] px-3 py-1.5 rounded-full border border-border text-muted hover:text-primary hover:border-primary/40 transition-colors duration-200"
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </BlurIn>
                </div>

                {/* ── Right: 3D ball ───────────────────────────── */}
                <div style={{ width: '420px', height: '420px' }} className="relative shrink-0">
                <BlurIn delay={0.2} className="absolute inset-0">
                    {/* Glow behind ball */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-[15%] rounded-full bg-primary/10 blur-[60px]" />
                        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[60%] h-[20px] rounded-full bg-primary/20 blur-[16px]" />
                    </div>

                    {/* Animated orbit lines */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-[10%] rounded-full border border-primary/10"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-[5%] rounded-full border border-primary/6"
                        style={{ borderStyle: 'dashed' }}
                    />

                    <BallScene />

                    {/* "OUT OF BOUNDS" label */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] text-primary/60 uppercase tracking-[0.4em] whitespace-nowrap"
                    >
                        Out of Bounds
                    </motion.div>
                </BlurIn>
                </div>

            </div>

            {/* Bottom mono strip */}
            <BlurIn delay={0.8} className="relative z-10 border-t border-border px-8 py-4 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                    GoalSense AI — v1.0
                </span>
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                    Error 404 / Page Not Found
                </span>
            </BlurIn>
        </div>
    );
};

export default NotFound;
