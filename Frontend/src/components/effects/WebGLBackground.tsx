import * as THREE from 'three';
import { useEffect, useRef } from 'react';

/**
 * WebGLBackground — ported from Portfolio's background.svelte
 * Full GLSL shader with noise distortion + mouse smoke particle trails.
 * GPU-intensive — use on Landing page only.
 */
const WebGLBackground = ({ className = '' }: { className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const getViewport = () => ({
            w: Math.max(1, Math.round(canvas.clientWidth || window.innerWidth)),
            h: Math.max(1, Math.round(canvas.clientHeight || window.innerHeight)),
        });

        let { w: W, h: H } = getViewport();

        // ── Renderer ──────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'default' });
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(W, H, false);
        renderer.autoClear = false;
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        const dispScene = new THREE.Scene();
        const bgScene = new THREE.Scene();
        const cam = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -100, 100);

        const fbo = new THREE.WebGLRenderTarget(
            Math.round(W * pixelRatio), Math.round(H * pixelRatio),
            { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: THREE.UnsignedByteType }
        );

        // ── Noise texture (procedural) ────────────────────────────
        const noiseCanvas = document.createElement('canvas');
        noiseCanvas.width = noiseCanvas.height = 256;
        const nCtx = noiseCanvas.getContext('2d')!;
        const imgData = nCtx.createImageData(256, 256);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const v = Math.random() * 255;
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = v;
            imgData.data[i + 3] = 255;
        }
        nCtx.putImageData(imgData, 0, 0);
        const noiseTex = new THREE.CanvasTexture(noiseCanvas);
        noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;

        // ── Smoke mask ────────────────────────────────────────────
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = maskCanvas.height = 128;
        const mCtx = maskCanvas.getContext('2d')!;
        const g = mCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.5, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        mCtx.fillStyle = g;
        mCtx.fillRect(0, 0, 128, 128);
        const circleMask = new THREE.CanvasTexture(maskCanvas);

        // ── Smoke particles ───────────────────────────────────────
        const TOTAL = 80;
        const smokeGeo = new THREE.PlaneGeometry(95, 99);
        const dispM: THREE.Mesh[] = [];
        let curSmoke = 0;

        for (let i = 0; i < TOTAL; i++) {
            const m = new THREE.Mesh(smokeGeo, new THREE.MeshBasicMaterial({
                map: noiseTex, alphaMap: circleMask, transparent: true,
                blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
            }));
            m.visible = false;
            dispM.push(m);
            dispScene.add(m);
        }

        const spawnSmoke = (x: number, y: number, idx: number) => {
            const n = dispM[idx];
            n.visible = true;
            n.scale.set(0.15, 0.15, 1);
            n.rotation.z = Math.random() * Math.PI * 2;
            n.position.set(x - 0.9, y, 0);
            (n.material as THREE.MeshBasicMaterial).opacity = 0.4;
        };

        // ── Background shader ─────────────────────────────────────
        const bgVert = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`;

        const bgFrag = `
            precision mediump float;
            #define PI 3.14159265359
            uniform float time; uniform sampler2D tex; uniform vec2 ps;
            uniform vec4 c1; uniform vec4 c2;
            uniform vec2 vc1; uniform vec2 vc2;
            varying vec2 vUv;

            float rand(vec2 co) {
                float a = fract(sin(dot(co, vec2(127.1, 311.7))) * 43758.5453);
                float b = fract(sin(dot(co, vec2(269.5, 183.3))) * 43758.5453);
                return fract(a + b);
            }
            float ns(vec2 p) {
                vec2 ip = floor(p); vec2 u = fract(p);
                u = u * u * (3.0 - 2.0 * u);
                float res = mix(mix(rand(ip), rand(ip + vec2(1,0)), u.x),
                                mix(rand(ip + vec2(0,1)), rand(ip + vec2(1,1)), u.x), u.y);
                return res * res;
            }
            void main() {
                vec4 n = texture2D(tex, vUv);
                float z = n.r * 2.0 * PI;
                vec2 uv = vUv + vec2(sin(z)) * n.r * 0.1;
                float d1 = distance(uv, vc1);
                float d2 = distance(uv, vc2);
                vec2 mv = vec2(time * 0.04, time * -0.04);
                float f = ns((uv * d1 * 2.0) + mv);
                f += ns((uv * d2 * 2.5) + vec2(time * -0.06, time * 0.04));
                float gr = mix(-0.2, 0.2, rand(uv + sin(time)));
                f += gr;
                f = smoothstep(0.0, 2.0, f);
                vec4 color = mix(c1, c2, f);
                gl_FragColor = vec4(color.rgb, color.a * 0.95);
            }`;

        const bgMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                tex: { value: null },
                ps: { value: new THREE.Vector2(W, H) },
                vc1: { value: new THREE.Vector2(0.5, 0.5) },
                vc2: { value: new THREE.Vector2(0, 1) },
                c1: { value: new THREE.Vector4(0, 0, 0, 1) },
                c2: { value: new THREE.Vector4(0.02, 0.08, 0.04, 0.9) }, // subtle green tint
            },
            transparent: true, vertexShader: bgVert, fragmentShader: bgFrag,
        });

        const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
        bgMesh.scale.set(W, H, 1);
        bgScene.add(bgMesh);

        // ── Mouse ─────────────────────────────────────────────────
        const mouse = new THREE.Vector2();
        const prevMouse = new THREE.Vector2();
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX - W / 2;
            mouse.y = H / 2 - e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // ── Resize ────────────────────────────────────────────────
        const applySize = (nw: number, nh: number) => {
            if (nw === W && nh === H) return;
            W = nw; H = nh;
            renderer.setSize(W, H, false);
            fbo.setSize(Math.round(W * pixelRatio), Math.round(H * pixelRatio));
            cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2;
            cam.updateProjectionMatrix();
            bgMesh.scale.set(W, H, 1);
            bgMat.uniforms.ps.value.set(W, H);
        };

        const ro = new ResizeObserver(() => {
            const { w, h } = getViewport();
            applySize(w, h);
        });
        ro.observe(canvas);

        // ── Animation loop ────────────────────────────────────────
        let time = 0;
        let running = true;
        let rafId = 0;

        const tick = () => {
            if (!running) return;
            rafId = requestAnimationFrame(tick);
            time += 0.016;

            if (Math.abs(mouse.x - prevMouse.x) >= 1 || Math.abs(mouse.y - prevMouse.y) >= 1) {
                curSmoke = (curSmoke + 1) % TOTAL;
                spawnSmoke(mouse.x, mouse.y, curSmoke);
            }
            prevMouse.copy(mouse);

            for (const m of dispM) {
                if (!m.visible) continue;
                m.rotation.z += 0.018;
                const mat = m.material as THREE.MeshBasicMaterial;
                mat.opacity *= 0.96;
                if (mat.opacity < 0.002) { m.visible = false; continue; }
                m.scale.x = 0.98 * m.scale.x + 0.1;
                m.scale.y = m.scale.x;
            }

            renderer.setRenderTarget(fbo);
            renderer.clear();
            renderer.render(dispScene, cam);

            bgMat.uniforms.tex.value = fbo.texture;
            bgMat.uniforms.time.value = time;

            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(bgScene, cam);
        };
        tick();

        return () => {
            running = false;
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMouseMove);
            ro.disconnect();
            dispM.forEach(m => (m.material as THREE.MeshBasicMaterial).dispose());
            smokeGeo.dispose(); bgMesh.geometry.dispose(); bgMat.dispose();
            circleMask.dispose(); noiseTex.dispose(); fbo.dispose(); renderer.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`pointer-events-none fixed inset-x-0 top-0 z-0 h-screen w-full ${className}`}
        />
    );
};

export default WebGLBackground;
