import { Link } from 'react-router-dom';
import MarqueeStrip from '../ui/MarqueeStrip';

const footerLinks = {
    Platform: [
        { label: 'Upload Video', path: '/upload' },
        { label: 'Analysis', path: '/analysis' },
        { label: 'Comparison', path: '/comparison' },
        { label: 'Heatmaps', path: '/heatmaps' },
        { label: 'Recommendations', path: '/recommendations' },
    ],
    Info: [
        { label: 'About Us', path: '/about' },
        { label: 'Help & Support', path: '/help' },
        { label: 'Register', path: '/register' },
        { label: 'Login', path: '/login' },
    ],
};

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-background border-t border-border">
            <MarqueeStrip
                items={['Computer Vision', 'Player Tracking', 'Team Analytics', 'AI Insights', 'Heatmaps', 'Pass Networks']}
                className="border-y-0 border-t border-border opacity-50"
            />

            <div className="container mx-auto max-w-7xl px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Brand column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="3" fill="#00e676" />
                                    <path d="M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" />
                                </svg>
                            </div>
                            <span className="font-display font-black text-lg uppercase tracking-tight">
                                Match<span className="text-primary">IQ</span>
                            </span>
                        </div>
                        <p className="text-muted text-xs leading-relaxed max-w-[200px]">
                            AI-powered football analytics. Transform footage into insight.
                        </p>
                        {/* Tech badges */}
                        <div className="flex gap-2 flex-wrap mt-2">
                            {['YOLOv8', 'FastAPI', 'React'].map(t => (
                                <span key={t} className="font-mono text-[10px] px-2 py-1 rounded-full border border-border text-muted">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section}>
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-6">
                                {section}
                            </h4>
                            <ul className="space-y-3">
                                {links.map(({ label, path }) => (
                                    <li key={path}>
                                        {/* Portfolio link-slide hover pattern */}
                                        <Link
                                            to={path}
                                            className="link-slide text-xs font-medium text-muted hover:text-primary transition-colors duration-300"
                                        >
                                            <span className="link-text">{label}</span>
                                            <span className="link-text-clone">{label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="font-mono text-[10px] text-muted uppercase tracking-widest">
                        © {year} MatchIQ — AI Football Analytics
                    </p>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span>System Online</span>
                    </div>
                </div>
        </div>
        </footer>
    );
};

export default Footer;
