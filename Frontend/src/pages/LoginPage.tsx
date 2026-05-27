import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const tokenResponse = await api.auth.login({ email, password });
            login(tokenResponse);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 bg-background overflow-hidden">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
                <div className="dot-grid absolute inset-0" />
            </div>

            {/* Corner markers */}
            <span aria-hidden className="corner-marker top-24 left-6 z-10">+</span>
            <span aria-hidden className="corner-marker top-24 right-6 z-10">+</span>
            <span aria-hidden className="corner-marker bottom-8 left-6 z-10">+</span>
            <span aria-hidden className="corner-marker bottom-8 right-6 z-10">+</span>

            <div className="relative z-10 w-full max-w-md">
                <BlurIn className="mb-10 text-center">
                    <SectionLabel number="01" path="~/auth/login" className="justify-center mb-6" />
                    <h1 className="font-display font-black text-4xl md:text-5xl text-foreground mt-4">
                        Welcome <span className="text-primary">Back.</span>
                    </h1>
                    <p className="text-muted text-sm mt-3">Sign in to access your analytics dashboard.</p>
                </BlurIn>

                <BlurIn delay={0.15}>
                    <GlassCard className="p-8">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                            {/* Email */}
                            <div className="input-float">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none z-10" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        required
                                        className="w-full bg-surface-2 border border-border rounded-xl pl-11 pr-4 py-4 text-foreground text-sm outline-none transition-colors duration-200 focus:border-primary placeholder:text-muted"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none z-10" />
                                <input
                                    id="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    className="w-full bg-surface-2 border border-border rounded-xl pl-11 pr-12 py-4 text-foreground text-sm outline-none transition-colors duration-200 focus:border-primary placeholder:text-muted"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                                >
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary h-12 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-background/40 border-t-background animate-spin" />
                                        Signing in…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <LogIn className="h-4 w-4" /> Sign In
                                    </span>
                                )}
                            </motion.button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-muted text-xs">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                                    Create one free
                                </Link>
                            </p>
                        </div>
                    </GlassCard>
                </BlurIn>
            </div>
        </div>
    );
};

export default LoginPage;
