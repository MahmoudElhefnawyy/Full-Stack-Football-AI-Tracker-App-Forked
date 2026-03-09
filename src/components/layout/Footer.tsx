

import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/5 bg-[#03060a] py-16 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
                    {/* Logo & About */}
                    <div className="col-span-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
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
                        </div>
                        <p className="text-[13px] text-[#5e6b7e] leading-relaxed max-w-[200px]">
                            Advanced football analytics platform powered by computer vision and AI.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5e6b7e] mb-6">PLATFORM</h4>
                        <ul className="space-y-4">
                            {['Upload Video', 'Analysis', 'Comparison', 'Heatmaps'].map((item) => {
                                const path = item === 'Upload Video' ? '/upload' : `/${item.toLowerCase()}`;
                                return (
                                    <li key={item}>
                                        <Link to={path} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">{item}</Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Teams Links */}
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5e6b7e] mb-6">TEAMS</h4>
                        <ul className="space-y-4">
                            {['FC Green Eagles', 'Black Panthers FC', 'Recommendations'].map((item) => {
                                const path = item === 'Recommendations' ? '/recommendations' : `/team/${item.replace(/\s+/g, '-').toLowerCase()}`;
                                return (
                                    <li key={item}>
                                        <Link to={path} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">{item}</Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Info Links */}
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5e6b7e] mb-6">INFO</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/guide" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Website Guide</Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link to="/help" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Help & Support</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] font-medium text-[#5e6b7e]">
                        © 2025 GoalSense — Graduation Project. All rights reserved.
                    </p>
                    <p className="text-[11px] font-medium text-[#5e6b7e]">
                        Built with <span className="text-red-500 mx-1">❤️</span> by the GoalSense Team
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
