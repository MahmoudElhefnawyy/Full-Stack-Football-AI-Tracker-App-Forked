import { useEffect, useRef } from 'react';

/**
 * CustomCursor — ported from Portfolio's cursor.svelte
 * RAF lerp with 0.18 factor, green tint, grows on hover over clickable elements
 */
const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const targetX = useRef(0);
    const targetY = useRef(0);
    const currentX = useRef(0);
    const currentY = useRef(0);
    const hasMoved = useRef(false);
    const isClickable = useRef(false);
    const rafId = useRef(0);

    useEffect(() => {
        const cursor = cursorRef.current;
        const dot = dotRef.current;
        if (!cursor || !dot) return;

        const tick = () => {
            currentX.current += (targetX.current - currentX.current) * 0.12;
            currentY.current += (targetY.current - currentY.current) * 0.12;

            if (hasMoved.current) {
                cursor.style.transform = `translate3d(${currentX.current}px, ${currentY.current}px, 0) translate(-50%, -50%)`;
                dot.style.transform = `translate3d(${targetX.current}px, ${targetY.current}px, 0) translate(-50%, -50%)`;
            }
            rafId.current = requestAnimationFrame(tick);
        };
        rafId.current = requestAnimationFrame(tick);

        const onMouseMove = (e: MouseEvent) => {
            targetX.current = e.clientX;
            targetY.current = e.clientY;
            if (!hasMoved.current) {
                currentX.current = targetX.current;
                currentY.current = targetY.current;
                hasMoved.current = true;
                cursor.style.opacity = '1';
                dot.style.opacity = '1';
            }

            const target = e.target as HTMLElement;
            const clickable = !!target.closest('a, button, [role="button"], input, select, textarea, label, [tabindex]');
            if (clickable !== isClickable.current) {
                isClickable.current = clickable;
                cursor.style.width = clickable ? '40px' : '20px';
                cursor.style.height = clickable ? '40px' : '20px';
                cursor.style.borderColor = clickable ? 'rgba(0,230,118,0.8)' : 'rgba(0,230,118,0.4)';
                cursor.style.backgroundColor = clickable ? 'rgba(0,230,118,0.08)' : 'transparent';
            }
        };

        const onMouseLeave = () => { cursor.style.opacity = '0'; dot.style.opacity = '0'; };
        const onMouseEnter = () => {
            if (hasMoved.current) { cursor.style.opacity = '1'; dot.style.opacity = '1'; }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseleave', onMouseLeave);
        document.addEventListener('mouseenter', onMouseEnter);

        return () => {
            cancelAnimationFrame(rafId.current);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
            document.removeEventListener('mouseenter', onMouseEnter);
        };
    }, []);

    return (
        <>
            {/* Lagging ring */}
            <div
                ref={cursorRef}
                className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border border-primary/40 transition-[width,height,border-color,background-color] duration-200 max-lg:hidden"
                style={{ width: 20, height: 20, opacity: 0 }}
            />
            {/* Sharp dot — follows mouse directly */}
            <div
                ref={dotRef}
                className="pointer-events-none fixed top-0 left-0 z-[9999] h-1.5 w-1.5 rounded-full bg-primary max-lg:hidden"
                style={{ opacity: 0 }}
            />
        </>
    );
};

export default CustomCursor;
