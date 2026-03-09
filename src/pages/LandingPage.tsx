import { Link } from 'react-router-dom';
import { ChevronRight, Eye, BarChart2, Repeat, Map, Star, ShieldCheck, Upload, Zap, PieChart } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col bg-[#0a0f16]">
            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-screen pt-40 pb-20">
                {/* Background image tint and gradient */}
                <div className="absolute inset-0 z-0">
                    <img src="/pitch.svg" alt="Pitch Background" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f16] via-[#0a0f16]/90 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-transparent to-[#0a0f16]/50" />
                </div>

                <div className="container relative z-10 mx-auto px-4 max-w-7xl">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-primary text-[11px] font-bold tracking-widest uppercase">
                                AI-Powered Football Analytics
                            </span>
                        </div>

                        <h1 className="text-[3.5rem] leading-[1.1] font-bold text-white mb-6">
                            Unlock the <span className="text-primary">Power</span> of<br />Football <span className="text-primary">Data</span>
                        </h1>

                        <p className="text-[17px] text-white/50 leading-relaxed mb-10 max-w-[500px]">
                            GoalSense transforms your match footage into deep performance insights using computer vision. Analyze players, track movements, compare teams, and get actionable recommendations.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
                            <Link to="/register" className="h-12 px-6 flex items-center justify-center gap-2 rounded-full bg-primary text-black font-semibold hover:bg-primary-dark transition-colors w-full sm:w-auto">
                                Get Started Free <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link to="/login" className="h-12 px-6 flex items-center justify-center rounded-full bg-black border border-[#1e293b] text-white font-semibold hover:bg-[#1e293b]/50 transition-colors w-full sm:w-auto">
                                Login to Account
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-16 mt-6 pt-2">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-primary mb-1 tracking-tight">10K+</span>
                                <span className="text-[11px] font-medium text-[#5e6b7e]">Matches Analyzed</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-primary mb-1 tracking-tight">500+</span>
                                <span className="text-[11px] font-medium text-[#5e6b7e]">Teams Registered</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-primary mb-1 tracking-tight">99%</span>
                                <span className="text-[11px] font-medium text-[#5e6b7e]">Accuracy Rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-4 bg-[#0a0f16]">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-4">Everything You Need to Win</h2>
                        <p className="text-[#8b9bb4] text-sm leading-relaxed">Professional-grade analytics tools built for coaches, analysts, and passionate football fans.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Eye, title: 'Computer Vision Analysis', desc: 'Our AI automatically detects and tracks every player, ball, and event in your match footage with pixel-perfect precision.' },
                            { icon: BarChart2, title: 'Deep Performance Stats', desc: 'Get comprehensive statistics including possession, shots, passes, heatmaps, and individual player performance scores.' },
                            { icon: Repeat, title: 'Team Comparison', desc: 'Compare two teams head-to-head across all key metrics. Identify strengths, weaknesses, and tactical patterns.' },
                            { icon: Map, title: 'Heatmap Visualization', desc: 'See exactly where players spend their time on the pitch with beautiful, color-coded heatmap overlays.' },
                            { icon: Star, title: 'Smart Recommendations', desc: 'Get AI-powered recommendations for player development and team tactics based on real match data.' },
                            { icon: ShieldCheck, title: 'Secure & Private', desc: 'Your match data is encrypted and private. Only you control who sees your team\'s analytics.' }
                        ].map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div key={i} className="bg-[#0f151c] rounded-2xl p-8 border border-white/5 hover:border-primary/20 transition-all group">
                                    <Icon className="h-6 w-6 text-primary mb-6" />
                                    <h3 className="text-[17px] font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-[13px] text-[#5e6b7e] leading-relaxed">{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-4 bg-[#060a0f]">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-[#8b9bb4] text-sm">Three simple steps to unlock your team's potential</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connecting lines for desktop */}
                        <div className="hidden md:block absolute top-[40%] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#1e293b] to-transparent z-0" />

                        {[
                            { step: '01', icon: Upload, title: 'Upload Your Match', desc: 'Upload any football match video. Our system accepts all common video formats.' },
                            { step: '02', icon: Zap, title: 'AI Analyzes It', desc: 'Our computer vision engine processes every frame, tracking players and events automatically.' },
                            { step: '03', icon: PieChart, title: 'Get Insights', desc: 'Access detailed analytics, heatmaps, player stats, and tactical recommendations instantly.' },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="bg-[#0f151c] rounded-2xl p-10 border border-white/5 relative z-10 flex flex-col items-center text-center hover:border-primary/20 transition-colors">
                                    <div className="text-[2.5rem] font-black text-primary mb-4 leading-none">{item.step}</div>
                                    <Icon className="h-6 w-6 text-primary mb-6" />
                                    <h3 className="text-[17px] font-bold text-white mb-3">{item.title}</h3>
                                    <p className="text-[13px] text-[#5e6b7e] leading-relaxed px-4">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-[#0a0f16]">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-[#0f151c] rounded-[2rem] p-12 md:p-20 text-center border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">Ready to Elevate Your Game?</h2>
                        <p className="text-[#8b9bb4] text-sm mb-10 max-w-md mx-auto relative z-10">Join thousands of coaches and analysts already using GoalSense to gain a competitive edge.</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                            <Link to="/register" className="h-12 px-6 flex items-center justify-center gap-2 rounded-full bg-primary text-black font-semibold hover:bg-primary-dark transition-colors w-full sm:w-auto">
                                Create Free Account <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link to="/about" className="h-12 px-6 flex items-center justify-center rounded-full bg-transparent border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors w-full sm:w-auto">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
