import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

/** Returns the global Lenis instance for external scroll control */
export const getLenis = () => lenisInstance;

/**
 * LenisProvider — initialises smooth scroll globally.
 * Automatically disabled when prefers-reduced-motion is set.
 */
const LenisProvider = ({ children }: { children: React.ReactNode }) => {
    const rafRef = useRef(0);

    useEffect(() => {
        // Respect user motion preference
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.8,
        });

        lenisInstance = lenis;

        const raf = (time: number) => {
            lenis.raf(time);
            rafRef.current = requestAnimationFrame(raf);
        };
        rafRef.current = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafRef.current);
            lenis.destroy();
            lenisInstance = null;
        };
    }, []);

    return <>{children}</>;
};

export default LenisProvider;

