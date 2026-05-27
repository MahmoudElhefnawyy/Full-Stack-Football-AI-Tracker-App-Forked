import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RadarStatsChart, DonutChart } from '../components/ui/Charts';
import { api, type PlayerDetail } from '../services/api';
import { User, Activity, Target, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import StatCard from '../components/ui/StatCard';

const PlayerProfile = () => {
    const { id } = useParams<{ id: string }>();
    const [player, setPlayer] = useState<PlayerDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.players.get(id)
            .then(setPlayer)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="h-10 w-10 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
    );

    if (!player) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <GlassCard className="p-12 text-center max-w-sm">
                <User className="h-10 w-10 text-muted mx-auto mb-4" />
                <h2 className="font-display font-bold text-xl text-foreground mb-2">Player Not Found</h2>
                <p className="text-muted text-sm">This player does not exist or has been removed.</p>
            </GlassCard>
        </div>
    );

    const radarData = Object.keys(player.attributes).map(key => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        A: player.attributes[key as keyof typeof player.attributes],
    }));

    const seasonStats = [
        { icon: Target, label: 'Goals', value: String(player.goals), color: 'text-primary' },
        { icon: Activity, label: 'Assists', value: String(player.assists), color: 'text-blue-400' },
        { icon: CheckCircle, label: 'Pass Acc.', value: `${Math.round(player.passAccuracy * 100)}%`, color: 'text-purple-400' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-32">

            {/* Hero banner */}
            <BlurIn className="mb-10">
                <SectionLabel number="00" path="~/player-profile" className="mb-6" />
                <GlassCard className="p-8 mt-6 relative overflow-hidden">
                    {/* Giant jersey number watermark */}
                    <span className="absolute -right-4 -top-6 font-display font-black text-[200px] leading-none text-primary/5 select-none pointer-events-none rotate-6 group-hover:rotate-3 transition-transform">
                        {player.number}
                    </span>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="h-28 w-28 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_40px_rgba(0,230,118,0.1)]">
                            <User className="h-14 w-14 text-primary/60" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2">{player.teamName}</p>
                            <h1 className="font-display font-black text-3xl md:text-5xl text-foreground tracking-tight">{player.name}<span className="text-primary">.</span></h1>
                            <p className="text-muted text-sm mt-2">{player.position}</p>
                            <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
                                    <span className="font-mono text-[9px] text-muted uppercase tracking-widest">OVR</span>
                                    <span className="font-display font-black text-2xl text-primary">{player.rating}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-4 py-2">
                                    <span className="font-mono text-[9px] text-muted uppercase tracking-widest">Mins</span>
                                    <span className="font-display font-black text-2xl text-foreground">{player.minutesPlayed}'</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </BlurIn>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left column: stats + donut */}
                <div className="lg:col-span-1 flex flex-col gap-5">
                    <BlurIn delay={0.1}>
                        <GlassCard className="p-6">
                            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-5">Season Stats</p>
                            <div className="flex flex-col gap-3">
                                {seasonStats.map(({ icon: Icon, label, value, color }) => (
                                    <div key={label} className="flex items-center justify-between p-3.5 bg-surface-2 border border-border rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Icon className={`h-4 w-4 ${color}`} />
                                            <span className="text-sm font-medium text-foreground">{label}</span>
                                        </div>
                                        <span className="font-display font-black text-xl text-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </BlurIn>

                    <BlurIn delay={0.15}>
                        <GlassCard className="p-6">
                            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-4">Performance Distribution</p>
                            <DonutChart data={[
                                { name: 'Passes', value: player.passesCompleted },
                                { name: 'Turnovers', value: player.turnovers },
                            ]} height={220} />
                        </GlassCard>
                    </BlurIn>

                    {/* Mini stat grid */}
                    <BlurIn delay={0.2}>
                        <div className="grid grid-cols-2 gap-3">
                            <GlassCard className="p-4">
                                <StatCard value={String(player.passesCompleted)} label="Passes" />
                            </GlassCard>
                            <GlassCard className="p-4">
                                <StatCard value={String(player.turnovers)} label="Turnovers" />
                            </GlassCard>
                        </div>
                    </BlurIn>
                </div>

                {/* Right column: radar attributes */}
                <BlurIn delay={0.12} className="lg:col-span-2">
                    <GlassCard className="p-6 h-full">
                        <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-4">Technical Attributes — Radar</p>
                        <RadarStatsChart data={radarData} height={420} />

                        {/* Attribute bars below radar */}
                        <div className="mt-6 space-y-3 pt-5 border-t border-border">
                            {Object.entries(player.attributes).map(([key, val], idx) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.05 }}
                                >
                                    <div className="flex justify-between font-mono text-[10px] text-muted mb-1">
                                        <span className="capitalize">{key}</span>
                                        <span className="text-foreground">{val}</span>
                                    </div>
                                    <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${val}%` }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 + idx * 0.05 }}
                                            className="h-full bg-primary rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </BlurIn>
            </div>
        </div>
    );
};

export default PlayerProfile;
