import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, HelpCircle, Info, LogIn, UserPlus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Navbar = () => {
    const location = useLocation();
    const isAuth = false; // Mock auth state

    const navLinks = [
        { name: 'Home', path: '/', icon: LayoutGrid },
        { name: 'Help', path: '/help', icon: HelpCircle },
        { name: 'About Us', path: '/about', icon: Info },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <div className="h-4 w-4 rounded-full border-2 border-background bg-background shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Soccer<span className="text-primary">Net</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                location.pathname === link.path ? "text-primary" : "text-white/70"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {isAuth ? (
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-surface/50 px-3 py-1.5 transition-colors hover:bg-surface">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">MO</div>
                            <span className="text-xs font-medium">Mohamed</span>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
                                <LogIn className="h-4 w-4" />
                                Login
                            </Link>
                            <Link to="/register" className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-background transition-all hover:scale-[1.02] hover:bg-primary-dark active:scale-[0.98]">
                                <UserPlus className="h-4 w-4" />
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
