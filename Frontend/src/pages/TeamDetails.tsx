import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RadarStatsChart } from '../components/ui/Charts';
import { api, type TeamSummary, type PlayerSummary } from '../services/api';
import { Shield, MapPin, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import StatCard from '../components/ui/StatCard';

type Tab = 'overview' | 'roster';

const TeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [team, setTeam] = useState<TeamSummary | null>(null);
    const [players, setPlayers] = useState<PlayerSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    useEffect(() => {
        if (!id) return;
        Promise.all([api.teams.get(id), api.teams.getPlayers(id)])
            .then(([teamData, playersData]) => { setTeam(teamData); setPlayers(playersData); })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="h-10 w-10 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
    );

    if (!team) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <GlassCard className="p-12 text-center max-w-sm">
                <Shield className="h-10 w-10 text-muted mx-auto mb-4" />
                <h2 className="font-display font-bold text-xl text-foreground mb-2">Team Not Found</h2>
                <p className="text-muted text-sm">This team does not exist or has been removed.</p>
            </GlassCard>
        </div>
    );

    const radarData = Object.keys(team.attributes).map(key => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        A: team.attributes[key as keyof typeof team.attributes],
    }));

    const tabs: { id: Tab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'roster', label: 'Roster' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-32">

            {/* Team header */}
            <BlurIn className="mb-12">
                <SectionLabel number="00" path="~/team-details" className="mb-6" />
                <GlassCard className="p-8 mt-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-4xl shrink-0">
                        {team.emoji || <Shield className="h-10 w-10 text-primary" />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="font-display font-black text-3xl md:text-4xl text-foreground">{team.name}<span className="text-primary">.</span></h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted"><MapPin className="h-3 w-3" />{team.stadium}</span>
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted"><Users className="h-3 w-3" />Coach: {team.coach}</span>
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted"><Award className="h-3 w-3" />Est. {team.founded}</span>
                        </div>
                    </div>
                    <div className="flex gap-8 shrink-0">
                        <StatCard value={`${team.stats.wins}W`} label="Wins" glowing />
                        <StatCard value={`${team.stats.draws}D`} label="Draws" />
                        <StatCard value={`${team.stats.losses}L`} label="Losses" />
                    </div>
                </GlassCard>
            </BlurIn>

            {/* Tabs */}
            <BlurIn delay={0.1}>
                <div className="flex gap-1 p-1 bg-surface rounded-2xl border border-border w-fit mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="relative px-6 py-2.5 text-sm font-semibold transition-colors duration-200"
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="teamTab"
                                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className={`relative z-10 ${activeTab === tab.id ? 'text-primary' : 'text-muted'}`}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </BlurIn>

            <AnimateContent tab={activeTab}>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlassCard className="md:col-span-2 p-6">
                            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-6">Team Strengths — Radar</p>
                            <RadarStatsChart data={radarData} height={350} />
                        </GlassCard>
                        <div className="flex flex-col gap-4">
                            <GlassCard className="p-6 border-primary/20">
                                <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-3">Season Record</p>
                                <p className="font-display font-black text-3xl text-foreground">
                                    {team.stats.wins}W <span className="text-muted font-normal text-xl">—</span> {team.stats.draws}D <span className="text-muted font-normal text-xl">—</span> {team.stats.losses}L
                                </p>
                            </GlassCard>
                            <GlassCard className="p-6">
                                <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Goals</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-display font-black text-2xl text-primary">{team.stats.goalsFor} <span className="font-mono text-xs font-normal text-muted">For</span></span>
                                    <div className="h-8 w-px bg-border" />
                                    <span className="font-display font-black text-2xl text-red-400">{team.stats.goalsAgainst} <span className="font-mono text-xs font-normal text-muted">Against</span></span>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                )}

                {activeTab === 'roster' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {players.length === 0 ? (
                            <GlassCard className="col-span-full p-16 text-center">
                                <Users className="h-10 w-10 text-muted mx-auto mb-4" />
                                <p className="text-muted text-sm">No players found for this team.</p>
                            </GlassCard>
                        ) : players.map((player, i) => (
                            <motion.div key={player.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                <Link to={`/player/${player.id}`}>
                                    <GlassCard hoverable className="p-5 relative overflow-hidden group">
                                        <span className="absolute top-3 right-4 font-mono font-black text-3xl text-primary/10 group-hover:text-primary/20 transition-colors">
                                            #{player.number}
                                        </span>
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-sm text-primary mb-4">
                                            {player.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <h3 className="font-display font-bold text-sm text-foreground">{player.name}</h3>
                                        <p className="font-mono text-[10px] text-muted mt-0.5 mb-3">{player.position}</p>
                                        <span className="font-mono text-[10px] bg-surface-2 border border-border rounded-full px-2 py-0.5 text-muted">
                                            Rating <span className="text-foreground font-bold">{player.rating}</span>
                                        </span>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimateContent>
        </div>
    );
};

// Simple animation wrapper for tab content
const AnimateContent = ({ tab, children }: { tab: string; children: React.ReactNode }) => (
    <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {children}
    </motion.div>
);

export default TeamDetails;
