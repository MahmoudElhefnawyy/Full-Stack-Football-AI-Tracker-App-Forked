import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Lightbulb, Activity, Zap, Share2, Download, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, type Recommendation } from '../services/api';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import StatCard from '../components/ui/StatCard';

const priorityConfig = {
    high:   { color: 'text-primary',  bg: 'bg-primary/10',  border: 'border-primary/30',  label: 'HIGH' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', label: 'MEDIUM' },
    low:    { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', label: 'LOW' },
} as const;

const cardVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
    visible: (i: number) => ({
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
    }),
} as any;

const RecCard = ({ rec, idx }: { rec: Recommendation; idx: number }) => {
    const cfg = priorityConfig[rec.priority as keyof typeof priorityConfig] ?? priorityConfig.medium;
    return (
        <motion.div custom={idx} variants={cardVariants} initial="hidden" animate="visible">
            <GlassCard hoverable className="p-5 flex items-start gap-4 group">
                {/* Initials avatar */}
                <div className={`shrink-0 h-11 w-11 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center font-mono font-bold text-sm ${cfg.color}`}>
                    {rec.title.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-sm text-foreground truncate">{rec.title}</h3>
                        <span className={`shrink-0 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                            {cfg.label}
                        </span>
                    </div>
                    <p className="text-muted text-xs leading-relaxed mb-2">{rec.description}</p>
                    <div className="flex items-center gap-1.5 text-muted/70">
                        <Activity className="h-3 w-3" />
                        <span className="font-mono text-[10px]">Confidence: {Math.round(rec.confidence * 100)}%</span>
                        {rec.reasoning && (
                            <>
                                <span className="text-border">·</span>
                                <Lightbulb className="h-3 w-3 text-yellow-400/70" />
                                <span className="font-mono text-[10px] truncate">{rec.reasoning}</span>
                            </>
                        )}
                    </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </GlassCard>
        </motion.div>
    );
};

const TeamCard = ({ rec, idx }: { rec: Recommendation; idx: number }) => (
    <motion.div custom={idx} variants={cardVariants} initial="hidden" animate="visible">
        <GlassCard hoverable className="p-6 h-full">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground">{rec.title}</h3>
            </div>
            <p className="text-muted text-xs leading-relaxed">{rec.description}</p>
        </GlassCard>
    </motion.div>
);

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.recommendations.list()
            .then(setRecommendations)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const topPerformers    = recommendations.filter(r => r.scope === 'player' && r.priority === 'high');
    const needsImprovement = recommendations.filter(r => r.scope === 'player' && (r.priority === 'low' || r.priority === 'medium'));
    const teamInsights     = recommendations.filter(r => r.scope === 'team');

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="h-10 w-10 rounded-full border-2 border-border border-t-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-32">

            {/* Header */}
            <BlurIn className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                <div>
                    <SectionLabel number="00" path="~/recommendations" className="mb-4" />
                    <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mt-4">
                        AI <span className="text-primary">Recommendations.</span>
                    </h1>
                    <p className="text-muted text-sm mt-2">Machine-learning powered performance insights from your match data.</p>
                </div>
                <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-ghost h-9 px-4 text-xs border border-border hover:border-primary/30">
                        <Share2 className="h-3.5 w-3.5" /> Share
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-ghost h-9 px-4 text-xs border border-border hover:border-primary/30">
                        <Download className="h-3.5 w-3.5" /> PDF
                    </motion.button>
                </div>
            </BlurIn>

            {/* Stats row */}
            <BlurIn delay={0.1} className="flex gap-12 mb-14 pb-8 border-b border-border">
                <StatCard value={String(topPerformers.length)} label="Top Performers" />
                <StatCard value={String(needsImprovement.length)} label="Needs Improvement" />
                <StatCard value={String(teamInsights.length)} label="Team Insights" />
            </BlurIn>

            {recommendations.length === 0 ? (
                <GlassCard className="p-16 text-center">
                    <Lightbulb className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted text-sm">No recommendations yet. Analyze a match first to get AI insights.</p>
                </GlassCard>
            ) : (
                <div className="space-y-12">

                    {/* Top Performers */}
                    {topPerformers.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-5">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <SectionLabel number="01" path="~/top-performers" />
                                <span className="ml-auto font-mono text-[10px] text-muted border border-border rounded-full px-2.5 py-1">
                                    {topPerformers.length} players
                                </span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {topPerformers.map((rec, i) => <RecCard key={rec.id} rec={rec} idx={i} />)}
                            </div>
                        </section>
                    )}

                    {/* Needs Improvement */}
                    {needsImprovement.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-5">
                                <TrendingDown className="h-4 w-4 text-orange-400" />
                                <SectionLabel number="02" path="~/needs-improvement" />
                                <span className="ml-auto font-mono text-[10px] text-muted border border-border rounded-full px-2.5 py-1">
                                    {needsImprovement.length} insights
                                </span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {needsImprovement.map((rec, i) => <RecCard key={rec.id} rec={rec} idx={i} />)}
                            </div>
                        </section>
                    )}

                    {/* Team Insights */}
                    {teamInsights.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-5">
                                <Lightbulb className="h-4 w-4 text-yellow-400" />
                                <SectionLabel number="03" path="~/team-insights" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teamInsights.map((rec, i) => <TeamCard key={rec.id} rec={rec} idx={i} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default Recommendations;
