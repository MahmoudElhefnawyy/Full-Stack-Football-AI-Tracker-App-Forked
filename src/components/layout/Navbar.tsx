import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Activity, ArrowUpDown, Star, Map, HelpCircle, Info, LogIn, UserPlus, ChevronDown, Menu, X, Upload } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuth, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    const publicLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Help', path: '/help', icon: HelpCircle },
        { name: 'About Us', path: '/about', icon: Info },
    ];

    const authLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Upload', path: '/upload', icon: Upload },
        { name: 'Analysis', path: '/analysis', icon: Activity },
        { name: 'Comparison', path: '/comparison', icon: ArrowUpDown },
        { name: 'Recommendations', path: '/recommendations', icon: Star },
        { name: 'Heatmaps', path: '/heatmaps', icon: Map },
        { name: 'Help', path: '/help', icon: HelpCircle },
        { name: 'About Us', path: '/about', icon: Info },
    ];

    const navLinks = isAuth ? authLinks : publicLinks;

    return (
        <nav className="absolute top-0 z-50 w-full pt-4 md:pt-6 pb-4 md:pb-0">
            <div className="w-[98%] mx-auto flex h-16 items-center justify-between px-6 md:px-10 bg-[#0a0f16]/80 md:bg-[#0f151c]/60 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-full shadow-2xl transition-all duration-300">
                <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
                            <circle cx="12" cy="12" r="3" fill="white" />
                            <path d="M12 2V6" />
                            <path d="M12 18V22" />
                            <path d="M4.5 16.5L7.5 14.5" />
                            <path d="M16.5 9.5L19.5 7.5" />
                            <path d="M16.5 14.5L19.5 16.5" />
                            <path d="M4.5 7.5L7.5 9.5" />
                        </svg>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                        Goal<span className="text-primary">Sense</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-[#0f151c] border border-white/5 px-2 py-1.5 rounded-full shadow-lg">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname.startsWith(link.path) && (link.path !== '/' || location.pathname === '/');
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "text-xs font-bold tracking-wide transition-all flex items-center gap-2 px-4 py-2 rounded-full",
                                    isActive ? "bg-primary/20 text-primary border border-primary/20" : "text-white/50 hover:text-white"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuth ? (
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="flex items-center gap-2 rounded-full border border-white/10 bg-surface/50 px-3 py-1.5 transition-colors hover:bg-surface text-sm font-medium">
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">MO</div>
                                <span className="text-white/90">Mohamed</span>
                                <ChevronDown className="h-4 w-4 text-white/50 ml-1" />
                            </Link>
                            <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:text-white">
                                <LogIn className="h-4 w-4" />
                                Login
                            </Link>
                            <Link to="/register" className="flex h-10 items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-background active:scale-[0.98]">
                                <UserPlus className="h-4 w-4" />
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white hover:text-primary transition-colors focus:outline-none bg-white/5 p-2 rounded-lg border border-white/5"
                        aria-label="Toggle Menu"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-[85px] left-0 w-full bg-[#0a0f16]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-4 px-4 px-4 overflow-y-auto max-h-[calc(100vh-85px)] animate-fade-in">
                    <div className="flex flex-col space-y-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname.startsWith(link.path) && (link.path !== '/' || location.pathname === '/');
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "text-sm font-bold flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all",
                                        isActive ? "bg-primary/20 text-primary border border-primary/20" : "text-white/70 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.name}
                                </Link>
                            );
                        })}

                        <div className="h-px bg-white/10 my-4"></div>

                        {isAuth ? (
                            <div className="flex flex-col gap-3">
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 border border-white/5 bg-white/5 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">MO</div>
                                    <span className="text-white/90 font-bold">Mohamed</span>
                                </Link>
                                <button onClick={handleLogout} className="text-center px-4 py-3.5 text-sm font-bold text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                    <LogIn className="h-4 w-4" />
                                    Login
                                </Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="flex justify-center items-center gap-2 px-4 py-3.5 text-sm font-bold text-background bg-primary rounded-xl hover:bg-primary-dark transition-colors">
                                    <UserPlus className="h-4 w-4" />
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
