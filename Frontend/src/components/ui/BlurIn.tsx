import { useEffect, useRef, type ReactNode } from 'react';

interface BlurInProps {
    children: ReactNode;
    delay?: number;       // seconds
    duration?: number;    // seconds
    className?: string;
    as?: React.ElementType;
}

/**
 * BlurIn — ported from Portfolio's blurIn Svelte action.
 * Uses IntersectionObserver so it triggers as the element enters the viewport.
 */
const BlurIn = ({
    children,
    delay = 0,
    duration = 0.6,
    className = '',
    as: Tag = 'div' as React.ElementType,
}: BlurInProps) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            el.style.opacity = '1';
            return;
        }

        el.style.opacity = '0';
        el.style.filter = 'blur(12px)';
        el.style.transform = 'translateY(10px)';
        el.style.transition = `opacity ${duration}s ease ${delay}s, filter ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.style.opacity = '1';
                    el.style.filter = 'blur(0)';
                    el.style.transform = 'translateY(0)';
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [delay, duration]);

    return (
        // @ts-ignore — dynamic tag
        <Tag ref={ref} className={className}>
            {children}
        </Tag>
    );
};

export default BlurIn;
