import React from 'react';
import { Mail, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/5 bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Logo & About */}
                    <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <div className="h-4 w-4 rounded-full border-2 border-background bg-background shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Soccer<span className="text-primary">Net</span>
                            </span>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                            Advanced football analytics platform powered by computer vision and AI. Get deep insights from your match footage.
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <a href="#" className="text-white/30 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-white/30 hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
                            <a href="#" className="text-white/30 hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Platform</h4>
                        <ul className="space-y-4">
                            {['Upload Video', 'Analysis', 'Comparison', 'Heatmaps'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-white/50 hover:text-primary transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Teams Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Teams</h4>
                        <ul className="space-y-4">
                            {['FC Green Eagles', 'Black Panthers FC', 'Recommendations'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-white/50 hover:text-primary transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Info Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Info</h4>
                        <ul className="space-y-4">
                            {['Website Guide', 'About Us', 'Help & Support'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-white/50 hover:text-primary transition-colors">{item}</a>
                                </li>
                            ))}
                            <li className="flex items-center gap-2 text-sm text-white/50 border-t border-white/5 pt-4 mt-4">
                                <Mail className="h-4 w-4" />
                                support@soccernet.ai
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/30">
                        © 2026 SoccerNet — Graduation Project. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-xs text-white/30 hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-white/30 hover:text-white transition-colors">Terms of Service</a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/30">
                        Built with <span className="text-red-500">❤️</span> by the SoccerNet Team
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
