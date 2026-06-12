import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Share2, Download, RefreshCcw, Clock, Calendar,
    Zap, Loader2, AlertTriangle, TrendingUp, Activity
} from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from 'recharts';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { hoverScale, tapScale } from '../utils/animations';
import { api, type MatchOverview, type Recommendation } from '../services/api';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import StatCard from '../components/ui/StatCard';
import TeamShield from '../components/ui/TeamShield';

const COLORS = ['#00e676', '#1e2d3a'];

const MatchAnalysis = () => {
    const { id } = useParams<{ id: string }>();
    const pageRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [data, setData] = useState<MatchOverview | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setIsLoading(true);
            try {
                let currentId = id;
                if (!currentId) {
                    const matches = await api.matches.list();
                    if (matches.length > 0) currentId = matches[0].id;
                }
                
                if (currentId) {
                    const [overview, recs] = await Promise.all([
                        api.matches.getOverview(currentId),
                        api.recommendations.forMatch(currentId).catch(() => []),
                    ]);
                    setData(overview);
                    setRecommendations(recs);
                } else {
                    setData(null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [id]);

    interface ChartPayload { name: string; value: number | string; fill?: string; dataKey?: string; }

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: ChartPayload[]; label?: string }) => {
        if (active && payload && payload.length && data) {
            return (
                <div className="bg-surface border border-border p-3 rounded-xl shadow-xl">
                    <p className="text-foreground font-semibold text-xs mb-2">{label}</p>
                    {payload.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                            <span className="text-muted">{p.dataKey === 'home' ? data.homeTeam : data.awayTeam}:</span>
                            <span className="text-foreground font-bold">{p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const handleExportPDF = async () => {
        if (!pageRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(pageRef.current, {
                backgroundColor: '#080c10',
                cacheBust: true,
                pixelRatio: 2,
                filter: (node: HTMLElement) => node.getAttribute?.('data-html2canvas-ignore') !== 'true',
            });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const img = new Image();
            img.src = dataUrl;
            await new Promise(resolve => { img.onload = resolve; });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfPageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (img.height * pdfWidth) / img.width;

            // Multi-page support for long reports
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfPageHeight;

            while (heightLeft > 0) {
                position -= pdfPageHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfPageHeight;
            }

            pdf.save(`match-analysis-${id}.pdf`);
        } catch (e) { console.error(e); } finally { setIsExporting(false); }
    };

    const handleShare = async () => {
        if (!data) return;
        const shareData = {
            title: `Match Analysis — ${data.homeTeam} vs ${data.awayTeam}`,
            text: 'Check out this AI-powered match analysis!',
            url: window.location.href,
        };
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try { await navigator.share(shareData); } catch { /* user cancelled */ }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="h-10 w-10 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <GlassCard className="p-12 text-center max-w-sm">
                <p className="text-muted text-sm">Match analysis data not found.</p>
            </GlassCard>
        </div>
    );

    const pieData = [
        { name: data.homeTeam, value: data.possession[data.homeTeam] || 50 },
        { name: data.awayTeam, value: data.possession[data.awayTeam] || 50 },
    ];

    const homePoss = data.possession[data.homeTeam] ?? 50;
    const awayPoss = data.possession[data.awayTeam] ?? 50;
    const homePassAcc = data.passAccuracy[data.homeTeam] ?? 0;
    const awayPassAcc = data.passAccuracy[data.awayTeam] ?? 0;

    const statCards = [
        {
            label: 'Ball Possession',
            icon: <span className="h-2.5 w-2.5 rounded-full bg-primary" />,
            home: `${homePoss}%`,
            away: `${awayPoss}%`,
            homePct: homePoss,
            awayPct: awayPoss,
        },
        {
            label: 'Pass Accuracy',
            icon: <Zap className="h-3.5 w-3.5 text-primary" />,
            home: `${Math.round(homePassAcc)}%`,
            away: `${Math.round(awayPassAcc)}%`,
            homePct: Math.round(homePassAcc),
            awayPct: Math.round(awayPassAcc),
        },
    ];

    const priorityIcon = (p: string) => {
        if (p === 'high') return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />;
        if (p === 'low') return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
        return <Activity className="h-3.5 w-3.5 text-yellow-400" />;
    };

    const priorityBadge = (p: string) => {
        const cfg: Record<string, string> = {
            high: 'bg-red-500/10 text-red-400 border-red-500/30',
            medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
            low: 'bg-primary/10 text-primary border-primary/30',
        };
        return cfg[p] || cfg.medium;
    };

    return (
        <div ref={pageRef} className="max-w-7xl mx-auto px-6 md:px-10 py-32">

            {/* Header */}
            <BlurIn className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <SectionLabel number="00" path="~/match-analysis" className="mb-4" />
                    <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mt-4">
                        Match <span className="text-primary">Analysis.</span>
                    </h1>
                    <p className="text-muted text-sm mt-2">AI-powered performance breakdown · {data.date}</p>
                </div>
                <div className="flex items-center gap-3" data-html2canvas-ignore="true">
                    <motion.button whileHover={hoverScale} whileTap={tapScale} onClick={handleShare} className="btn-ghost h-9 px-4 text-xs border border-border hover:border-primary/30">
                        <Share2 className="h-3.5 w-3.5" /> Share
                    </motion.button>
                    <motion.button whileHover={hoverScale} whileTap={tapScale} onClick={handleExportPDF} disabled={isExporting} className="btn-ghost h-9 px-4 text-xs border border-border hover:border-primary/30 disabled:opacity-50">
                        {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        {isExporting ? 'Exporting…' : 'PDF'}
                    </motion.button>
                </div>
            </BlurIn>

            {/* Scoreboard */}
            <BlurIn delay={0.1} className="mb-6">
                <GlassCard className="p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                    {/* Ambient glow */}
                    <motion.div
                        animate={{ opacity: [0.08, 0.14, 0.08], scale: [1, 1.08, 1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 w-full max-w-[600px] h-48 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                    />
                    <div className="absolute top-5 right-6 flex items-center gap-1.5 font-mono text-[10px] text-muted">
                        <Calendar className="h-3 w-3" /> {data.date}
                    </div>

                    <div className="flex justify-between items-center w-full max-w-lg relative z-10">
                        {/* Home */}
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center flex-1">
                            <TeamShield teamName={data.homeTeam} variant="home" size="lg" className="mb-3" />
                            <span className="text-sm font-bold text-foreground text-center">{data.homeTeam}</span>
                            <span className="font-mono text-[9px] text-primary uppercase tracking-widest mt-1">Home</span>
                        </motion.div>

                        {/* Score */}
                        <div className="flex flex-col items-center flex-1">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="flex items-center gap-4 font-display font-black text-5xl md:text-6xl text-foreground tracking-tight mb-2"
                            >
                                <span>{data.homeScore}</span>
                                <span className="text-muted font-light text-4xl">—</span>
                                <span>{data.awayScore}</span>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    className="ml-1"
                                >
                                    <RefreshCcw className="h-5 w-5 text-primary/40" />
                                </motion.div>
                            </motion.div>
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
                                <Clock className="h-3 w-3" /> Full Time · {data.status}
                            </div>
                        </div>

                        {/* Away */}
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center flex-1">
                            <TeamShield teamName={data.awayTeam} variant="away" size="lg" className="mb-3" />
                            <span className="text-sm font-bold text-muted text-center">{data.awayTeam}</span>
                            <span className="font-mono text-[9px] text-muted uppercase tracking-widest mt-1">Away</span>
                        </motion.div>
                    </div>
                </GlassCard>
            </BlurIn>

            {/* Stat bars */}
            <BlurIn delay={0.15} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {statCards.map((s, i) => (
                    <GlassCard key={s.label} className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            {s.icon}
                            <span className="font-mono text-[10px] text-muted uppercase tracking-widest">{s.label}</span>
                        </div>
                        <div className="flex justify-between items-end mb-3">
                            <span className="font-display font-black text-2xl text-foreground">{s.home}</span>
                            <span className="font-display font-bold text-xl text-muted">{s.away}</span>
                        </div>
                        <div className="flex gap-1.5 h-1.5 w-full">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.homePct}%` }} transition={{ duration: 1, delay: 0.8 + i * 0.1 }} className="h-full bg-primary rounded-full" />
                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.awayPct}%` }} transition={{ duration: 1, delay: 1 + i * 0.1 }} className="h-full bg-border rounded-full" />
                        </div>
                    </GlassCard>
                ))}
            </BlurIn>

            {/* Summary stat row */}
            <BlurIn delay={0.2} className="flex gap-10 py-8 px-2 border-y border-border mb-8">
                <StatCard value={`${homePoss}%`} label="Possession" glowing />
                <StatCard value={String(data.homeScore + data.awayScore)} label="Total Goals" />
                <StatCard value={`${Math.round(homePassAcc)}%`} label="Home Pass Acc." />
            </BlurIn>

            {/* Charts grid */}
            <BlurIn delay={0.25} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Possession donut */}
                <GlassCard className="p-6 flex flex-col">
                    <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-6">Ball Possession</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-1">
                        <div className="w-32 h-32 relative shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={45}
                                        outerRadius={60}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={-270}
                                        animationBegin={800}
                                        animationDuration={1200}
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="w-28 truncate">{data.homeTeam}</span>
                                <span className="text-primary font-bold">{homePoss}%</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-muted">
                                <div className="w-2 h-2 rounded-full bg-border" />
                                <span className="w-28 truncate">{data.awayTeam}</span>
                                <span className="font-bold">{awayPoss}%</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Match stats horizontal bar chart */}
                <GlassCard className="lg:col-span-2 p-6">
                    <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-6">Match Statistics</p>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.stats} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barGap={2} barCategoryGap={16}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" stroke="transparent" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke="transparent" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={16} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar dataKey="home" fill="#00e676" radius={[0, 4, 4, 0]} barSize={7} />
                                <Bar dataKey="away" fill="#1e2d3a" radius={[0, 4, 4, 0]} barSize={7} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-6 mt-4 justify-center">
                        <span className="flex items-center gap-2 font-mono text-[10px] text-muted"><span className="h-2 w-2 rounded-sm bg-primary" />{data.homeTeam}</span>
                        <span className="flex items-center gap-2 font-mono text-[10px] text-muted"><span className="h-2 w-2 rounded-sm bg-border" />{data.awayTeam}</span>
                    </div>
                </GlassCard>
            </BlurIn>

            {/* Full Statistics Breakdown Table */}
            {data.stats && data.stats.length > 0 && (
                <BlurIn delay={0.3} className="mb-8">
                    <GlassCard className="p-6 lg:p-8">
                        <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-6">Full Statistics Breakdown</p>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                            <span className="w-1/3 text-center font-display font-bold text-sm text-primary">{data.homeTeam}</span>
                            <span className="w-1/3 text-center font-mono text-[10px] text-muted uppercase tracking-widest">Stat</span>
                            <span className="w-1/3 text-center font-display font-bold text-sm text-muted">{data.awayTeam}</span>
                        </div>
                        {data.stats.map((s, i) => {
                            const homeVal = Number(s.home);
                            const awayVal = Number(s.away);
                            const homeWins = homeVal > awayVal;
                            const awayWins = awayVal > homeVal;
                            return (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                                    <span className={`w-1/3 text-center font-bold text-sm ${homeWins ? 'text-primary' : 'text-foreground'}`}>{s.home}</span>
                                    <span className="w-1/3 text-center text-muted text-xs font-medium">{s.name}</span>
                                    <span className={`w-1/3 text-center font-bold text-sm ${awayWins ? 'text-primary' : 'text-muted'}`}>{s.away}</span>
                                </div>
                            );
                        })}
                    </GlassCard>
                </BlurIn>
            )}

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
                <BlurIn delay={0.35} className="mb-8">
                    <GlassCard className="p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-mono text-[10px] text-muted uppercase tracking-widest">AI Recommendations</p>
                                <p className="text-foreground font-display font-bold text-sm">{recommendations.length} insights generated</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {recommendations.slice(0, 10).map((rec, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                                    {priorityIcon(rec.priority)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-display font-bold text-xs text-foreground truncate">{rec.title}</span>
                                            <span className={`shrink-0 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${priorityBadge(rec.priority)}`}>
                                                {rec.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-muted text-[11px] leading-relaxed">{rec.description}</p>
                                        {rec.reasoning && (
                                            <p className="text-muted/60 text-[10px] mt-1 font-mono">💡 {rec.reasoning}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </BlurIn>
            )}

            {/* PDF Footer */}
            <div className="text-center py-4 border-t border-border mt-4">
                <p className="font-mono text-[9px] text-muted/50 uppercase tracking-widest">
                    MatchIQ AI · Powered by Computer Vision · {data.date}
                </p>
            </div>
        </div>
    );
};

export default MatchAnalysis;
