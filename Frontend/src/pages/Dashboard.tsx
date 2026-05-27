import { useEffect, useState } from 'react';
import { Play, Upload, BarChart3, Users, Map, Star, Trash2, ArrowRight, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type MatchSummary } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import StatCard from '../components/ui/StatCard';

const quickActions = [
    { label: 'Analysis', desc: 'Full match breakdown', icon: BarChart3, path: '/analysis', num: '01' },
    { label: 'Comparison', desc: 'Head-to-head stats', icon: Users, path: '/comparison', num: '02' },
    { label: 'Heatmaps', desc: 'Positional data', icon: Map, path: '/heatmaps', num: '03' },
    { label: 'AI Tips', desc: 'Performance recommendations', icon: Star, path: '/recommendations', num: '04' },
];

const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
    visible: (i: number) => ({
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
    }),
} as any;

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recordings, setRecordings] = useState<MatchSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userName = user?.name || 'Analyst';
    const userAvatar = user?.name ? user.name.substring(0, 2).toUpperCase() : 'AN';

    useEffect(() => {
        api.matches.list()
            .then(setRecordings)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = async (id: string | number) => {
        if (!confirm('Delete this recording?')) return;
        try {
            await api.matches.delete(id);
            setRecordings(prev => prev.filter(r => r.id !== id));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-32">

            {/* ── Header ── */}
            <BlurIn className="flex flex-col gap-6 mb-14">
                <SectionLabel number="00" path="~/dashboard" />
                <div className="flex items-center gap-4 mt-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 }}
                        className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center font-mono font-bold text-lg text-primary"
                    >
                        {userAvatar}
                    </motion.div>
                    <div>
                        <p className="text-muted text-xs font-mono uppercase tracking-widest">Welcome back,</p>
                        <h1 className="font-display font-black text-3xl md:text-4xl text-foreground">{userName}<span className="text-primary">.</span></h1>
                    </div>
                </div>
                <p className="text-muted text-sm max-w-md leading-relaxed">
                    Your match recordings are ready for analysis. Explore insights, compare teams, and get AI-powered recommendations.
                </p>

                {/* Quick stats */}
                <div className="flex gap-12 pt-2 border-t border-border">
                    <StatCard value={String(recordings.length)} label="Recordings" />
                    <StatCard value={recordings.filter(r => r.status === 'completed').length.toString()} label="Analyzed" />
                    <StatCard value="Live" label="System Status" glowing />
                </div>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3 mt-2">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link to="/upload" className="btn-primary h-10 px-6 text-xs">
                            <Upload className="h-3.5 w-3.5" /> Upload New Video
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link to="/analysis" className="btn-outline h-10 px-6 text-xs">
                            <BarChart3 className="h-3.5 w-3.5" /> View Analysis
                        </Link>
                    </motion.div>
                </div>
            </BlurIn>

            {/* ── Quick Actions ── */}
            <div className="mb-14">
                <SectionLabel number="01" path="~/quick-actions" className="mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {quickActions.map((action, i) => (
                        <motion.div
                            key={i} custom={i} variants={itemVariants}
                            initial="hidden" animate="visible"
                        >
                            <Link to={action.path}>
                                <GlassCard hoverable className="p-6 flex flex-col gap-4 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
                                            <action.icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-mono text-xs text-muted">{action.num}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-sm text-foreground mb-1">{action.label}</h3>
                                        <p className="font-mono text-[10px] text-muted">{action.desc}</p>
                                    </div>
                                </GlassCard>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Recordings ── */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <SectionLabel number="02" path="~/recordings" />
                    <Link to="/upload" className="flex items-center gap-1 font-mono text-[10px] text-primary hover:text-primary-dark transition-colors uppercase tracking-widest">
                        Upload New <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" />
                    </div>
                ) : recordings.length === 0 ? (
                    <GlassCard className="p-16 text-center">
                        <Video className="h-12 w-12 text-muted mx-auto mb-4" />
                        <p className="text-muted text-sm mb-6">No recordings yet. Upload your first match to get started.</p>
                        <Link to="/upload" className="btn-primary inline-flex h-10 px-6 text-xs">
                            <Upload className="h-3.5 w-3.5" /> Upload Match Video
                        </Link>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recordings.map((rec, i) => (
                            <motion.div
                                key={rec.id} custom={i} variants={itemVariants}
                                initial="hidden" animate="visible"
                            >
                                <GlassCard hoverable className="overflow-hidden flex flex-col group">
                                    {/* Thumbnail */}
                                    <div className="w-full h-40 relative bg-surface-2 flex items-center justify-center">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <Play className="h-5 w-5 text-primary ml-0.5" />
                                        </div>
                                        <div className="absolute top-3 left-3">
                                            <span className={`font-mono text-[10px] font-bold px-2 py-1 rounded-full border ${rec.status === 'completed' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted/20 text-muted border-muted/30'}`}>
                                                {rec.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5 flex flex-col gap-4 flex-grow">
                                        <div>
                                            <h3 className="font-display font-bold text-sm text-foreground">
                                                {rec.homeTeam} <span className="text-muted font-normal">vs</span> {rec.awayTeam}
                                            </h3>
                                            <p className="font-mono text-[10px] text-muted mt-1">{rec.date}</p>
                                        </div>

                                        <div className="mt-auto flex gap-2">
                                            <motion.button
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => navigate(`/analysis/${rec.id}`)}
                                                className="flex-grow btn-primary h-9 text-xs"
                                            >
                                                <Play className="h-3.5 w-3.5 fill-current" /> Analyze
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleDelete(rec.id)}
                                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-surface-2 border border-border text-muted hover:text-red-400 hover:border-red-400/30 transition-colors duration-200"
                                                title="Delete recording"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </motion.button>
                                        </div>

                                        <Link
                                            to={`/comparison?matchId=${rec.id}`}
                                            className="flex items-center justify-center gap-2 font-mono text-[10px] text-muted border border-border rounded-xl py-2.5 hover:border-primary/30 hover:text-primary transition-all duration-200"
                                        >
                                            <Users className="h-3 w-3" /> Compare Teams
                                        </Link>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
