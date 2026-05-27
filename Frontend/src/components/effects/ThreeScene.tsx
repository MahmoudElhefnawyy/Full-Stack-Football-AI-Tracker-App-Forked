import * as THREE from 'three';
import { useEffect, useRef } from 'react';

/**
 * ThreeScene — Modern holographic football player
 * Smooth, emissive geometry with wireframe overlay and brand-green glow.
 * No GLTF needed — fully procedural.
 */
const ThreeScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const W = canvas.clientWidth  || 600;
        const H = canvas.clientHeight || 700;

        // ── Renderer ──────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H, false);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace  = THREE.SRGBColorSpace;
        renderer.toneMapping       = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        // ── Scene & Camera ────────────────────────────────────────────
        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
        camera.position.set(0, 2.8, 9);
        camera.lookAt(0, 1.8, 0);

        // ── Lighting ──────────────────────────────────────────────────
        // Soft ambient
        scene.add(new THREE.AmbientLight(0x0a1a1a, 2));

        // Primary brand-green key light (top-left)
        const keyLight = new THREE.DirectionalLight(0x00e676, 3.5);
        keyLight.position.set(-3, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.camera.near = 1;
        keyLight.shadow.camera.far  = 20;
        scene.add(keyLight);

        // Rim light (cold blue from behind)
        const rimLight = new THREE.DirectionalLight(0x4488ff, 1.8);
        rimLight.position.set(4, 3, -6);
        scene.add(rimLight);

        // Under-glow (subtle green bounce)
        const bounceLight = new THREE.PointLight(0x00e676, 0.8, 8);
        bounceLight.position.set(0, 0, 2);
        scene.add(bounceLight);

        // ── Shared materials ──────────────────────────────────────────
        const mkSolid = (color: number, roughness = 0.55, metalness = 0.15, emissive = 0x000000, emissiveIntensity = 0) =>
            new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });

        const mkWire = (color: number, opacity = 0.18) =>
            new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });

        // Player palette
        const skinCol   = 0xd4956a;
        const jerseyCol = 0x00c853;   // deep green jersey
        const shortsCol = 0x071510;
        const bootsCol  = 0x080808;
        const accentCol = 0x00e676;   // emissive green trim

        const skinMat    = mkSolid(skinCol,   0.7, 0.0);
        const jerseyMat  = mkSolid(jerseyCol, 0.5, 0.1, accentCol, 0.08);
        const shortsMat  = mkSolid(shortsCol, 0.8, 0.05);
        const bootsMat   = mkSolid(bootsCol,  0.3, 0.7, accentCol, 0.15);
        const hairMat    = mkSolid(0x1a0c00,  0.9, 0.0);

        // Holographic wireframe overlay (applied to key parts)
        const wireMat = mkWire(accentCol, 0.12);

        // ── Helper: mesh + optional wireframe overlay ─────────────────
        const addMesh = (
            geo: THREE.BufferGeometry,
            mat: THREE.Material,
            parent: THREE.Group,
            wire = false,
        ) => {
            const m = new THREE.Mesh(geo, mat);
            m.castShadow    = true;
            m.receiveShadow = true;
            parent.add(m);
            if (wire) {
                parent.add(new THREE.Mesh(geo, wireMat));
            }
            return m;
        };

        // ── Player group ──────────────────────────────────────────────
        const player = new THREE.Group();

        // HEAD — smooth sphere
        const headGeo = new THREE.SphereGeometry(0.27, 32, 32);
        const head    = addMesh(headGeo, skinMat, player, true);
        head.position.set(0, 3.55, 0);

        // Hair — hemisphere cap
        const hairGeo = new THREE.SphereGeometry(0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
        const hair    = addMesh(hairGeo, hairMat, player);
        hair.position.copy(head.position);

        // NECK
        const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.22, 16);
        const neck    = addMesh(neckGeo, skinMat, player);
        neck.position.set(0, 3.24, 0);

        // TORSO — tapered box (shoulders wider than waist)
        const torsoGeo = new THREE.BoxGeometry(0.72, 0.9, 0.42);
        const torso    = addMesh(torsoGeo, jerseyMat, player, true);
        torso.position.set(0, 2.6, 0);

        // Shoulder pads (subtle sphere on each side)
        const shoulderGeo = new THREE.SphereGeometry(0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const lShoulder   = addMesh(shoulderGeo, jerseyMat, player);
        lShoulder.position.set(-0.4, 2.98, 0);
        lShoulder.rotation.z = 1.2;
        const rShoulder = addMesh(shoulderGeo, jerseyMat, player);
        rShoulder.position.set(0.4, 2.98, 0);
        rShoulder.rotation.z = -1.2;

        // UPPER ARMS
        const uArmGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.46, 16);
        const lUArm   = addMesh(uArmGeo, jerseyMat, player);
        lUArm.position.set(-0.46, 2.7, 0);
        lUArm.rotation.z = 0.28;

        const rUArm = addMesh(uArmGeo, jerseyMat, player);
        rUArm.position.set(0.46, 2.7, 0);
        rUArm.rotation.z = -0.28;

        // LOWER ARMS
        const lArmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.42, 16);
        const lLArm   = addMesh(lArmGeo, skinMat, player);
        lLArm.position.set(-0.6, 2.28, 0);
        lLArm.rotation.z = 0.45;

        const rLArm = addMesh(lArmGeo, skinMat, player);
        rLArm.position.set(0.6, 2.28, 0);
        rLArm.rotation.z = -0.45;

        // HANDS (small spheres)
        const handGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const lHand   = addMesh(handGeo, skinMat, player);
        lHand.position.set(-0.72, 1.98, 0);
        const rHand = addMesh(handGeo, skinMat, player);
        rHand.position.set(0.72, 1.98, 0);

        // SHORTS (hips)
        const shortsGeo = new THREE.BoxGeometry(0.68, 0.48, 0.4);
        const shorts    = addMesh(shortsGeo, shortsMat, player);
        shorts.position.set(0, 1.92, 0);

        // THIGHS
        const thighGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.52, 16);
        const lThigh   = addMesh(thighGeo, shortsMat, player);
        lThigh.position.set(-0.18, 1.56, 0);

        const rThigh = addMesh(thighGeo, shortsMat, player);
        rThigh.position.set(0.18, 1.56, 0);

        // SHINS (left straight, right kicked forward)
        const shinGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.52, 16);

        const lShin = addMesh(shinGeo, skinMat, player);
        lShin.position.set(-0.18, 1.06, 0);

        const rShin = addMesh(shinGeo, skinMat, player);
        rShin.position.set(0.22, 1.0, 0.2);
        rShin.rotation.x = -0.38;

        // BOOTS — sleek with emissive accent
        const bootGeo = new THREE.BoxGeometry(0.19, 0.13, 0.34);

        const lBoot = addMesh(bootGeo, bootsMat, player, true);
        lBoot.position.set(-0.18, 0.76, 0.06);

        const rBoot = addMesh(bootGeo, bootsMat, player, true);
        rBoot.position.set(0.22, 0.68, 0.42);
        rBoot.rotation.x = -0.38;

        // Boot sole accent stripe (emissive green line)
        const stripeGeo  = new THREE.BoxGeometry(0.19, 0.015, 0.34);
        const stripeMat  = new THREE.MeshStandardMaterial({ color: accentCol, emissive: accentCol, emissiveIntensity: 1.5 });
        const lStripe    = new THREE.Mesh(stripeGeo, stripeMat);
        lStripe.position.set(-0.18, 0.696, 0.06);
        player.add(lStripe);
        const rStripe = new THREE.Mesh(stripeGeo, stripeMat);
        rStripe.position.set(0.22, 0.616, 0.42);
        rStripe.rotation.x = -0.38;
        player.add(rStripe);

        // Jersey number "10" label (plane with emissive material)
        const labelGeo = new THREE.PlaneGeometry(0.2, 0.2);
        const labelMat = new THREE.MeshStandardMaterial({ color: accentCol, emissive: accentCol, emissiveIntensity: 0.5, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        const label    = new THREE.Mesh(labelGeo, labelMat);
        label.position.set(0, 2.62, 0.215);
        player.add(label);

        player.position.set(0.3, 0.1, 0);
        player.rotation.y = -Math.PI / 7;
        scene.add(player);

        // ── Football ──────────────────────────────────────────────────
        const ballGroup = new THREE.Group();

        const ballMat = new THREE.MeshStandardMaterial({
            color: 0xfafafa,
            roughness: 0.35,
            metalness: 0.05,
            emissive: 0xffffff,
            emissiveIntensity: 0.04,
        });
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), ballMat);
        ball.castShadow = true;
        ballGroup.add(ball);

        // Pentagon patches (black)
        const patchMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6 });
        [
            [0, 0.22, 0], [0, -0.22, 0],
            [0.21, 0.07, 0.07], [-0.21, 0.07, 0.07],
            [0.13, -0.17, 0.16], [-0.13, -0.17, 0.16],
            [0, 0.1, 0.2],
        ].forEach(([x, y, z]) => {
            const patch = new THREE.Mesh(new THREE.CircleGeometry(0.076, 5), patchMat);
            const dir   = new THREE.Vector3(x, y, z).normalize();
            patch.position.copy(dir.clone().multiplyScalar(0.222));
            patch.lookAt(dir.clone().multiplyScalar(2));
            ballGroup.add(patch);
        });

        // Ball emissive rim glow
        const glowMat = new THREE.MeshBasicMaterial({ color: accentCol, wireframe: true, transparent: true, opacity: 0.06 });
        ballGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 16), glowMat));

        ballGroup.position.set(0.58, 0.22, 0.6);
        scene.add(ballGroup);

        // ── Ground shadow ─────────────────────────────────────────────
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 6),
            new THREE.ShadowMaterial({ opacity: 0.18 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // ── Ground emissive ring ──────────────────────────────────────
        const ringGeo = new THREE.RingGeometry(0.45, 0.5, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: accentCol, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
        const ring    = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        ring.position.x = 0.3;
        scene.add(ring);

        // ── Mouse parallax ────────────────────────────────────────────
        const mouse = new THREE.Vector2();
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // ── Animation loop ────────────────────────────────────────────
        let running = true;
        let rafId   = 0;
        let t       = 0;

        const tick = () => {
            if (!running) return;
            rafId = requestAnimationFrame(tick);
            t += 0.016;

            // Idle bob
            player.position.y = 0.1 + Math.sin(t * 1.4) * 0.045;
            // Gentle parallax yaw
            player.rotation.y = -Math.PI / 7 + mouse.x * 0.18;
            // Camera micro parallax
            camera.position.y = 2.8 + mouse.y * 0.15;

            // Kick animation (right leg)
            rShin.rotation.x     = -0.38 + Math.sin(t * 1.4) * 0.28;
            rBoot.rotation.x     = -0.38 + Math.sin(t * 1.4) * 0.28;
            rBoot.position.z     = 0.42  + Math.sin(t * 1.4) * 0.12;
            rStripe.rotation.x   = -0.38 + Math.sin(t * 1.4) * 0.28;

            // Arm counter-swing
            lUArm.rotation.z = 0.28  + Math.sin(t * 1.4) * 0.18;
            rUArm.rotation.z = -0.28 - Math.sin(t * 1.4) * 0.18;
            lLArm.rotation.z = 0.45  + Math.sin(t * 1.4) * 0.12;
            rLArm.rotation.z = -0.45 - Math.sin(t * 1.4) * 0.12;

            // Ball roll + float
            ballGroup.rotation.x += 0.022;
            ballGroup.rotation.z += 0.009;
            ballGroup.position.y  = 0.22 + Math.abs(Math.sin(t * 1.4)) * 0.025;

            // Ring pulse
            ringMat.opacity = 0.1 + Math.sin(t * 2) * 0.08;

            // Boot sole stripe flicker
            stripeMat.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.4;

            // Bounce light pulse
            bounceLight.intensity = 0.6 + Math.sin(t * 2.5) * 0.3;

            renderer.render(scene, camera);
        };
        tick();

        // ── Resize ────────────────────────────────────────────────────
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
            window.removeEventListener('mousemove', onMouseMove);
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

export default ThreeScene;
