import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                    {/* Decorative Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />

                    <div className="text-center mb-8">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Welcome Back</h2>
                        <p className="text-white/50 text-sm mt-1">Sign in to your SoccerNet account</p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-4">
                            {/* Demo Account Indicator */}
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3 text-[10px] font-medium text-primary/80">
                                <span className="font-bold uppercase bg-primary/10 px-1.5 py-0.5 rounded">Demo</span>
                                demo@soccernet.ai / demo123
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1">Password</label>
                                    <a href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                    <input
                                        type="password"
                                        placeholder="Your password"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full h-12 text-sm">
                            Sign In <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    <p className="text-center text-sm text-white/40 mt-8">
                        Don't have an account? <Link to="/register" className="text-primary/70 hover:text-primary transition-colors font-medium">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
