import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-32">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 blur-[120px]">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary rounded-full" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500 rounded-full" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        AI-Powered Football Analytics
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Unlock the <span className="text-primary italic">Power</span> of<br />Football <span className="bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent">Data</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                        SoccerNet transforms your match footage into deep performance insights using computer vision. Analyze players, track movements, compare teams, and get actionable recommendations.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-primary w-full sm:w-auto h-14 text-lg">
                            Get Started Free <ArrowRight className="h-5 w-5" />
                        </Link>
                        <button className="flex items-center justify-center gap-3 px-8 h-14 rounded-lg bg-surface border border-white/5 hover:bg-surface/80 transition-all font-bold w-full sm:w-auto">
                            Login to Account
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
                        {[
                            { label: 'Matches Analyzed', value: '10K+' },
                            { label: 'Teams Registered', value: '500+' },
                            { label: 'Accuracy Rate', value: '99%' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl font-bold text-white mb-2 tracking-tight">{stat.value}</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-white/30">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="py-24 bg-surface/30 px-4">
                <div className="container mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Win</h2>
                    <p className="text-white/50 max-w-xl mx-auto">Professional-grade analytics tools built for coaches, analysts, and passionate football fans.</p>
                </div>

                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Computer Vision Analysis', desc: 'Our AI automatically detects and tracks every player, ball, and event in your match footage with pixel-perfect precision.' },
                        { title: 'Deep Performance Stats', desc: 'Get comprehensive statistics including possession, shots, passes, heatmaps, and individual player performance scores.' },
                        { title: 'Team Comparison', desc: 'Compare two teams head-to-head across all key metrics. Identify strengths, weaknesses, and tactical patterns.' },
                    ].map((feature, i) => (
                        <div key={i} className="glass-card p-8 hover:border-primary/30 transition-all group">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <Play className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
