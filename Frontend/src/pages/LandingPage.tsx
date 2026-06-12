import { Link } from 'react-router-dom';
import { ChevronRight, Eye, BarChart2, Repeat, Map, Star, ShieldCheck, Upload, Zap, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import WebGLBackground from '../components/effects/WebGLBackground';
import ThreeScene from '../components/effects/ThreeScene';
import BlurIn from '../components/ui/BlurIn';
import MarqueeStrip from '../components/ui/MarqueeStrip';
import SectionLabel from '../components/ui/SectionLabel';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';

const marqueeItems = [
    'Computer Vision Tracking',
    'Player Heatmaps',
    'Possession Analysis',
    'Pass Networks',
    'Team Comparison',
    'AI Recommendations',
    'Real-time Analytics',
    'Match Intelligence',
];

const features = [
    { icon: Eye, title: 'Computer Vision', desc: 'Our AI detects and tracks every player and the ball with pixel-perfect precision across every frame.' },
    { icon: BarChart2, title: 'Deep Performance Stats', desc: 'Possession, shots, passes, distances, speed maps — every metric your coaching staff needs.' },
    { icon: Repeat, title: 'Team Comparison', desc: 'Head-to-head across all key metrics. Surface tactical patterns and exploit weaknesses.' },
    { icon: Map, title: 'Heatmap Visualization', desc: 'Color-coded spatial maps that show exactly where each player operated during the match.' },
    { icon: Star, title: 'Smart Recommendations', desc: 'AI-powered tactical advice based on real match data — not guesswork.' },
    { icon: ShieldCheck, title: 'Secure & Private', desc: 'Your match data is encrypted. Only you control access to your team\'s analytics.' },
];

const steps = [
    { step: '01', icon: Upload, title: 'Upload Your Match', desc: 'Upload any football match video. We accept all common formats.' },
    { step: '02', icon: Zap, title: 'AI Analyzes It', desc: 'Our computer vision engine processes every frame automatically in the background.' },
    { step: '03', icon: PieChart, title: 'Get Insights', desc: 'Access heatmaps, player stats, pass networks, and tactical recommendations instantly.' },
];

const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    visible: (i: number) => ({
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as any },
    }),
} as any;

const LandingPage = () => {
    return (
        <div className="flex flex-col bg-background">

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative min-h-screen overflow-hidden">

                {/* Three.js WebGL shader background */}
                <WebGLBackground />

                {/* Dot grid overlay */}
                <div className="pointer-events-none absolute inset-0 z-[1]">
                    <div className="dot-grid absolute inset-0" />
                </div>

                {/* Corner markers — exact portfolio pattern */}
                <span aria-hidden className="corner-marker top-20 left-6 z-10">+</span>
                <span aria-hidden className="corner-marker top-20 right-6 z-10">+</span>
                <span aria-hidden className="corner-marker bottom-8 left-6 z-10">+</span>
                <span aria-hidden className="corner-marker bottom-8 right-6 z-10">+</span>

                {/* Content grid */}
                <div className="relative z-10 container mx-auto max-w-7xl px-6 flex flex-col h-screen justify-between pt-28 pb-16">

                    {/* Top meta row */}
                    <BlurIn className="flex items-center justify-between" delay={0}>
                        <SectionLabel number="01" path="~/home" />
                        <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-muted uppercase tracking-widest">
                            <span>Vision</span><span className="text-border">·</span>
                            <span>Analytics</span><span className="text-border">·</span>
                            <span>Intelligence</span>
                        </div>
                    </BlurIn>

                    {/* Hero main content */}
                    <div className="flex items-end justify-between gap-8">
                        {/* Left: text */}
                        <div className="flex-1 space-y-8 max-w-2xl">

                            {/* Status badge */}
                            <BlurIn delay={0.15}>
                                <div className="status-badge w-fit">
                                    <span className="status-dot" />
                                    <span className="font-mono text-xs text-muted uppercase tracking-widest">
                                        AI-Powered Football Analytics
                                    </span>
                                </div>
                            </BlurIn>

                            {/* Main headline */}
                            <div className="space-y-3">
                                <BlurIn delay={0.25}>
                                    <h1 className="font-display font-black text-[4rem] md:text-[6rem] leading-[0.95] tracking-tight text-foreground">
                                        Match<span className="text-primary text-glow">IQ</span><span className="text-primary">.</span>
                                    </h1>
                                </BlurIn>
                                <BlurIn delay={0.35}>
                                    <p className="text-muted text-base md:text-lg leading-relaxed max-w-md">
                                        {['Transform', 'match', 'footage', 'into', 'deep', 'performance', 'insights', 'using', 'computer', 'vision.', 'Analyze', 'players,', 'track', 'movements,', 'win', 'more.'].map((word, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
                                                className="inline-block mr-1"
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                    </p>
                                </BlurIn>
                            </div>

                            {/* Tech stack pills */}
                            <BlurIn delay={0.5}>
                                <ul className="flex flex-wrap gap-2">
                                    {['YOLO v8', 'StrongSort', 'FastAPI', 'Celery', 'React'].map((tech) => (
                                        <li key={tech} className="rounded-full border border-border bg-surface/30 px-3 py-1 font-mono text-xs text-muted backdrop-blur-sm">
                                            {tech}
                                        </li>
                                    ))}
                                </ul>
                            </BlurIn>

                            {/* CTA buttons */}
                            <BlurIn delay={0.6}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Link to="/register" className="btn-primary h-12 px-8 text-sm">
                                            Get Started Free <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Link to="/login" className="btn-outline h-12 px-8 text-sm">
                                            Login to Account
                                        </Link>
                                    </motion.div>
                                </div>
                            </BlurIn>

                            {/* Stats row */}
                            <BlurIn delay={0.7} className="flex gap-12 pt-2">
                                <StatCard value="10K+" label="Matches Analyzed" />
                                <StatCard value="500+" label="Teams Registered" />
                                <StatCard value="99%" label="Accuracy Rate" />
                            </BlurIn>
                        </div>

                        {/* Right: 3D football player */}
                        <BlurIn
                            delay={0.4}
                            className="hidden lg:block flex-shrink-0 w-[380px] h-[520px]"
                        >
                            <ThreeScene />
                        </BlurIn>
                    </div>

                    {/* Bottom scroll hint */}
                    <BlurIn delay={0.8} className="flex items-center justify-end gap-2 font-mono text-xs text-muted uppercase tracking-widest">
                        <span className="h-8 w-px bg-border" />
                        <span>Scroll to explore</span>
                    </BlurIn>
                </div>
            </section>

            {/* ── Marquee Strip ─────────────────────────────────────── */}
            <MarqueeStrip items={marqueeItems} />

            {/* ── Features ──────────────────────────────────────────── */}
            <section className="py-28 px-6">
                <div className="container mx-auto max-w-7xl">

                    <BlurIn className="mb-16">
                        <SectionLabel number="02" path="~/features" right="Everything You Need" className="mb-6" />
                        <h2 className="font-display font-black text-3xl md:text-5xl text-foreground mt-4">
                            Win with <span className="text-primary">Data.</span>
                        </h2>
                        <p className="text-muted text-sm md:text-base mt-3 max-w-md leading-relaxed">
                            Professional-grade analytics tools built for coaches, analysts, and competitive clubs.
                        </p>
                    </BlurIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={i}
                                    custom={i}
                                    variants={itemVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: '-80px' }}
                                >
                                    <GlassCard hoverable className="p-8 h-full group">
                                        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="font-display font-bold text-lg text-foreground mb-3">{feature.title}</h3>
                                        <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── How It Works ──────────────────────────────────────── */}
            <section className="py-28 px-6 border-t border-border">
                <div className="container mx-auto max-w-7xl">

                    <BlurIn className="mb-16">
                        <SectionLabel number="03" path="~/how-it-works" right="3 Steps" className="mb-6" />
                        <h2 className="font-display font-black text-3xl md:text-5xl text-foreground mt-4">
                            Simple as <span className="text-primary">1, 2, 3.</span>
                        </h2>
                    </BlurIn>

                    {/* Connecting line */}
                    <div className="relative">
                        <div className="hidden md:block absolute top-[52px] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {steps.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        custom={i}
                                        variants={itemVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: '-80px' }}
                                    >
                                        <GlassCard hoverable className="p-10 flex flex-col items-center text-center relative z-10">
                                            <span className="font-mono font-bold text-4xl text-primary text-glow mb-4 leading-none">
                                                {item.step}
                                            </span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-display font-bold text-lg text-foreground mb-3">{item.title}</h3>
                                            <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────── */}
            <section className="py-28 px-6 border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-12 md:p-20 text-center"
                    >
                        {/* Top glow line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        {/* Bottom radial glow */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                        <BlurIn>
                            <h2 className="font-display font-black text-3xl md:text-5xl text-foreground mb-4 relative z-10">
                                Ready to Elevate<br />Your <span className="text-primary">Game?</span>
                            </h2>
                            <p className="text-muted text-sm md:text-base mb-10 max-w-md mx-auto relative z-10 leading-relaxed">
                                Join coaches and analysts already using MatchIQ to gain a competitive edge.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                    <Link to="/register" className="btn-primary h-12 px-8 text-sm">
                                        Create Free Account <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                    <Link to="/about" className="btn-ghost h-12 px-8 text-sm border border-border hover:border-primary/30">
                                        Learn More
                                    </Link>
                                </motion.div>
                            </div>
                        </BlurIn>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
