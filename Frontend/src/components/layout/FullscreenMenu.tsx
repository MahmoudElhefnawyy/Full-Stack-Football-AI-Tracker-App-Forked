import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import gsap from 'gsap';

interface NavLink { name: string; path: string; }

interface FullscreenMenuProps {
    open: boolean;
    onClose: () => void;
    links: NavLink[];
}

const BARS = 3;

/**
 * FullscreenMenu — 3-panel wipe + GSAP per-character hover scatter
 * Ported from Portfolio's sidebar.svelte
 */
const FullscreenMenu = ({ open, onClose, links }: FullscreenMenuProps) => {
    const location = useLocation();
    const { isAuth, user, logout } = useAuth();

    // Close on route change
    useEffect(() => { onClose(); }, [location.pathname]);
    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const attachCharHover = (node: HTMLElement | null) => {
        if (!node) return;
        const chars = node.querySelectorAll<HTMLElement>('.char');

        const enter = () => {
            gsap.to(chars, {
                x: () => gsap.utils.random(-15, 15),
                y: () => gsap.utils.random(-15, 15),
                rotation: () => gsap.utils.random(-25, 25),
                duration: 0.5,
                ease: 'power3.out',
                stagger: 0.02,
                overwrite: true,
            });
        };
        const leave = () => {
            gsap.to(chars, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'power3.out', overwrite: true });
        };

        node.addEventListener('mouseenter', enter);
        node.addEventListener('mouseleave', leave);
        return () => {
            node.removeEventListener('mouseenter', enter);
            node.removeEventListener('mouseleave', leave);
        };
    };

    return (
        <div className={`fixed inset-0 z-[200] flex ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* 3-panel wipe */}
            {Array.from({ length: BARS }).map((_, i) => (
                <motion.div
                    key={i}
                    style={{ width: `${100 / BARS}%` }}
                    initial={{ y: '-100%' }}
                    animate={{ y: open ? '0%' : '-100%' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: i * 0.07 }}
                    className="bg-background"
                />
            ))}

            {/* Menu Content */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: BARS * 0.07 + 0.2 }}
                        className="absolute inset-0 flex flex-col justify-between px-8 py-10 md:px-16"
                    >
                        {/* Top row: logo + close */}
                        <div className="flex items-center justify-between">
                            <span className="font-display text-lg font-black uppercase tracking-tighter">
                                Goal<span className="text-primary">Sense</span>
                            </span>
                            <button
                                onClick={onClose}
                                className="group text-muted hover:text-primary transition-colors duration-300"
                                aria-label="Close menu"
                            >
                                <svg viewBox="-0.5 0 25 25" fill="none" className="h-10 w-10">
                                    <path d="M3 21.32L21 3.32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M3 3.32L21 21.32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Nav links */}
                        <nav className="flex flex-col gap-4">
                            {links.map(({ name, path }, idx) => (
                                <motion.div
                                    key={path}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.06 + 0.4, duration: 0.5, ease: 'easeOut' }}
                                >
                                    <Link
                                        to={path}
                                        ref={(el) => { attachCharHover(el); }}
                                        className="inline-block font-display text-4xl font-bold uppercase hover:text-primary transition-colors duration-300 md:text-6xl"
                                    >
                                        {[...name].map((ch, i) => (
                                            <span key={i} className="char inline-block">{ch === ' ' ? '\u00A0' : ch}</span>
                                        ))}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Bottom: user info or auth links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.4 }}
                            className="flex items-center justify-between"
                        >
                            {isAuth ? (
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-xs text-muted uppercase tracking-widest">Signed in as</span>
                                    <span className="text-foreground font-semibold">{user?.name || user?.email}</span>
                                </div>
                            ) : (
                                <div className="flex gap-6">
                                    <Link to="/login" className="font-mono text-sm text-muted hover:text-primary transition-colors uppercase tracking-widest">Login</Link>
                                    <Link to="/register" className="font-mono text-sm text-primary hover:text-primary-dark transition-colors uppercase tracking-widest">Register</Link>
                                </div>
                            )}
                            {isAuth && (
                                <button
                                    onClick={() => { logout(); onClose(); }}
                                    className="font-mono text-xs text-muted hover:text-red-400 transition-colors uppercase tracking-widest"
                                >
                                    Logout
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FullscreenMenu;
