import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User, ShieldCheck, Check } from 'lucide-react';

const RegisterPage = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />

                    <div className="text-center mb-8">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Create Account</h2>
                        <p className="text-white/50 text-sm mt-1">Join SoccerNet and start analyzing</p>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="YourUsername"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                    />
                                </div>
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
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                    <input
                                        type="password"
                                        placeholder="Min. 8 characters"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex gap-1 mt-1.5 px-1">
                                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-0.5 flex-grow bg-white/10 rounded-full" />)}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                    <input
                                        type="password"
                                        placeholder="Repeat your password"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full h-12 text-sm">
                            Create Account <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    <p className="text-center text-sm text-white/40 mt-8">
                        Already have an account? <Link to="/login" className="text-primary/70 hover:text-primary transition-colors font-medium">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
