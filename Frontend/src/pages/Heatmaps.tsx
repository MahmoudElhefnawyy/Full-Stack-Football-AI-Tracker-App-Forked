import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type PlayerSummary, type PlayerHeatmap, type PlayerDetail } from '../services/api';
import { Users, Map as MapIcon, Activity, Trophy } from 'lucide-react';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import StatCard from '../components/ui/StatCard';

const formatDuration = (mins: number) => {
    if (mins < 1) return `${Math.round(mins * 60)}s`;
    return `${mins}'`;
};

const Heatmaps = () => {
    const [players, setPlayers] = useState<PlayerSummary[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [playerDetail, setPlayerDetail] = useState<PlayerDetail | null>(null);
    const [heatmap, setHeatmap] = useState<PlayerHeatmap | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    useEffect(() => {
        api.players.list()
            .then(data => { setPlayers(data); if (data.length > 0) setSelectedPlayerId(data[0].id); })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedPlayerId) return;
        setIsDetailLoading(true);
        Promise.all([api.players.get(selectedPlayerId), api.players.getHeatmap(selectedPlayerId)])
            .then(([detail, heat]) => { setPlayerDetail(detail); setHeatmap(heat); })
            .catch(console.error)
            .finally(() => setIsDetailLoading(false));
    }, [selectedPlayerId]);

    const PitchGrid = ({ zones }: { zones?: { x: number; y: number; value: number }[] }) => {
        const gridValues = Array(60).fill(0);
        if (zones) zones.forEach(z => {
            const index = Math.floor(z.y / 16.6) * 10 + Math.floor(z.x / 10);
            if (index >= 0 && index < 60) gridValues[index] = z.value;
        });
        return (
            <div className="relative w-full aspect-[1.6] bg-background border border-border rounded-2xl overflow-hidden">
                {/* Heat grid */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-6">
                    {gridValues.map((val, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.005 }}
                            className="border border-white/3 transition-colors"
                            style={{ backgroundColor: `rgba(0,230,118,${val / 100})` }}
                        />
                    ))}
                </div>
                {/* Pitch markings */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/15 -translate-x-1/2" />
                    <div className="absolute left-1/2 top-1/2 w-[20%] h-[30%] border border-white/15 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute left-0 top-[20%] w-[15%] h-[60%] border border-white/15 border-l-0" />
                    <div className="absolute right-0 top-[20%] w-[15%] h-[60%] border border-white/15 border-r-0" />
                </div>
            </div>
        );
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="h-10 w-10 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
    );

    if (players.length === 0) return (
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
            <GlassCard className="p-16">
                <Users className="h-14 w-14 text-muted mx-auto mb-5" />
                <h2 className="font-display font-black text-2xl text-foreground mb-2">No Tracking Data Available</h2>
                <p className="text-muted text-sm">Upload and analyze a match to see player heatmaps and positional stats.</p>
            </GlassCard>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-32">

            {/* Header */}
            <BlurIn className="mb-12">
                <SectionLabel number="00" path="~/heatmaps" className="mb-4" />
                <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mt-4">
                    Heatmaps & <span className="text-primary">Visualization.</span>
                </h1>
                <p className="text-muted text-sm mt-2">Real-time positional data from AI tracking</p>
            </BlurIn>

            {/* Player selector */}
            <BlurIn delay={0.1}>
                <GlassCard className="p-6 mb-6">
                    <div className="flex items-center gap-2 mb-5">
                        <MapIcon className="h-4 w-4 text-primary" />
                        <SectionLabel number="01" path="~/positional-activity" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {players.map(p => (
                            <motion.button
                                key={p.id}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedPlayerId(p.id)}
                                className={[
                                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 border',
                                    selectedPlayerId === p.id
                                        ? 'bg-primary/15 border-primary/40 text-primary'
                                        : 'bg-surface-2 border-border text-muted hover:text-foreground',
                                ].join(' ')}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${selectedPlayerId === p.id ? 'bg-primary' : 'bg-muted/30'}`} />
                                {p.name}
                                <span className="text-muted/50">({p.position})</span>
                            </motion.button>
                        ))}
                    </div>
                </GlassCard>
            </BlurIn>

            {/* Detail area */}
            <AnimatePresence mode="wait">
                {isDetailLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <GlassCard className="h-80 flex items-center justify-center">
                            <div className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" />
                        </GlassCard>
                    </motion.div>
                ) : playerDetail && (
                    <motion.div key={selectedPlayerId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Heatmap panel */}
                            <GlassCard className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest">Activity Heatmap</span>
                                    <span className="ml-auto font-display font-bold text-sm text-foreground">{playerDetail.name}</span>
                                </div>
                                <PitchGrid zones={heatmap?.points} />
                                <div className="mt-3 flex justify-end items-center gap-2 font-mono text-[10px] text-muted">
                                    <span>Low</span>
                                    <div className="w-20 h-1.5 bg-gradient-to-r from-primary/10 to-primary rounded-full" />
                                    <span>High Intensity</span>
                                </div>
                            </GlassCard>

                            {/* Attribute profile */}
                            <GlassCard className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Trophy className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest">Attribute Profile</span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {playerDetail.attributes ? Object.entries(playerDetail.attributes).map(([key, val], idx) => (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, x: 16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.06 }}
                                        >
                                            <div className="flex justify-between font-mono text-[10px] text-muted mb-1.5">
                                                <span className="capitalize">{key}</span>
                                                <span className="text-foreground">{val}/100</span>
                                            </div>
                                            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${val}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.06 }}
                                                    className="h-full bg-primary rounded-full"
                                                />
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <p className="text-muted text-xs font-mono">Attributes data unavailable</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                                    <GlassCard className="p-4">
                                        <StatCard value={`${Math.round(playerDetail.passAccuracy ?? 0)}%`} label="Pass Accuracy" />
                                    </GlassCard>
                                    <GlassCard className="p-4">
                                        <StatCard value={formatDuration(playerDetail.minutesPlayed ?? 0)} label="Duration Played" />
                                    </GlassCard>
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Heatmaps;
