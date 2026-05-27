import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import FullscreenMenu from './FullscreenMenu';
import {
    Home, Activity, ArrowUpDown, Star, Map,
    HelpCircle, Info, LogIn, UserPlus, Upload, LayoutDashboard,
} from 'lucide-react';

const publicLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Help', path: '/help', icon: HelpCircle },
];

const authLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Analysis', path: '/analysis', icon: Activity },
    { name: 'Comparison', path: '/comparison', icon: ArrowUpDown },
    { name: 'Heatmaps', path: '/heatmaps', icon: Map },
    { name: 'Tips', path: '/recommendations', icon: Star },
    { name: 'Help', path: '/help', icon: HelpCircle },
];

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuth, user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [visible, setVisible] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    const navLinks = isAuth ? authLinks : publicLinks;

    // Scroll-aware show/hide
    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            setScrolled(currentY > 10);
            if (currentY <= 80) {
                setVisible(true);
            } else if (currentY > lastScrollY + 5) {
                setVisible(false);
            } else if (lastScrollY > currentY + 5) {
                setVisible(true);
            }
            setLastScrollY(currentY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Lock body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const isActive = (path: string) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <>
            <FullscreenMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                links={navLinks}
            />

            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                className={[
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                    scrolled
                        ? 'bg-background/90 backdrop-blur-2xl border-b border-border shadow-[0_1px_0_0_rgba(255,255,255,0.03)]'
                        : 'bg-transparent',
                ].join(' ')}
            >
                {/* Full-width inner container */}
                <div className="max-w-[1600px] mx-auto px-6 md:px-10 xl:px-16 h-[72px] flex items-center justify-between gap-6">

                    {/* ── Logo ─────────────────────────────────────── */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <motion.div
                            whileHover={{ rotate: 90, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 shadow-[0_0_12px_rgba(0,230,118,0.15)]"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="3" fill="#00e676" />
                                <path d="M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" />
                            </svg>
                        </motion.div>
                        <span className="font-display font-black text-xl uppercase tracking-tight">
                            Goal<span className="text-primary">Sense</span>
                        </span>
                    </Link>

                    {/* ── Desktop centre nav ───────────────────────── */}
                    <nav className="hidden md:flex items-center gap-1 bg-surface/60 border border-border/60 px-2 py-2 rounded-2xl backdrop-blur-md">
                        {navLinks.map(({ name, path, icon: Icon }) => {
                            const active = isActive(path);
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={[
                                        'relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors duration-200',
                                        active ? 'text-primary' : 'text-muted hover:text-foreground',
                                    ].join(' ')}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="activeNavPill"
                                            className="absolute inset-0 bg-primary/10 border border-primary/25 rounded-xl -z-10"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <Icon className="h-3.5 w-3.5 shrink-0" />
                                    {name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ── Desktop auth ─────────────────────────────── */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        {isAuth ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/80 px-4 py-2.5 text-xs font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                                >
                                    <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                        {user?.name?.substring(0, 2).toUpperCase() ?? 'US'}
                                    </div>
                                    <span className="text-foreground">{user?.name ?? 'Account'}</span>
                                </Link>
                                <button
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-red-400 transition-colors duration-200 px-3 py-2.5"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition-colors duration-200 px-4 py-2.5"
                                >
                                    <LogIn className="h-4 w-4" /> Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 h-10 px-5 text-sm font-bold rounded-xl bg-primary text-background hover:bg-primary-dark hover:shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all duration-200"
                                >
                                    <UserPlus className="h-4 w-4" /> Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── Mobile hamburger ─────────────────────────── */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMenuOpen(true)}
                        className="md:hidden flex flex-col justify-center gap-1.5 p-2.5 rounded-xl hover:bg-surface-2 transition-colors duration-200"
                        aria-label="Open menu"
                    >
                        <span className="block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300" />
                        <span className="block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300" />
                        <span className="block h-0.5 w-4 bg-primary rounded-full transition-all duration-300" />
                    </motion.button>
                </div>

                {/* Bottom accent line — glows on scroll */}
                <motion.div
                    animate={{ opacity: scrolled ? 1 : 0 }}
                    className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                />
            </motion.nav>
        </>
    );
};

export default Navbar;
