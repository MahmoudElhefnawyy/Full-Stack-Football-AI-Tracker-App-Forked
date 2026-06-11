import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Share2, Download, Loader2, Trophy } from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { itemVariants, hoverScale, tapScale } from '../utils/animations';
import { api, type MatchOverview } from '../services/api';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import TeamShield from '../components/ui/TeamShield';

const Comparison = () => {
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('matchId');
    const pageRef = useRef<HTMLDivElement>(null);
    
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [matchData, setMatchData] = useState<MatchOverview | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let id = matchId;
                if (!id) {
                    const matches = await api.matches.list();
                    if (matches.length > 0) id = matches[0].id;
                }
                
                if (id) {
                    const overview = await api.matches.getOverview(id);
                    setMatchData(overview);
                }
            } catch (err) {
                console.error("Comparison data fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [matchId]);

    // Map API data to Recharts format
    const radarData = matchData?.stats
        .filter(s => ['Possession', 'Pass Accuracy', 'Shots', 'Corner Kicks', 'Fouls'].includes(s.name))
        .map(s => ({
            subject: s.name,
            A: Number(s.home),
            B: Number(s.away)
        })) || [];

    const comparisons = matchData?.stats || [];

    const statsData = comparisons.map(s => ({
        name: s.name,
        A: Number(s.home),
        B: Number(s.away)
    }));

    const barData = statsData
        .filter(s => !['Possession', 'Pass Accuracy'].includes(s.name))
        .slice(0, 5);

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; color?: string; fill?: string; value: number | string }[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0b1016] border border-[#242e3a] p-3 rounded-lg shadow-xl">
                    <p className="text-white font-medium mb-2">{label}</p>
                    {payload.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || p.fill }}></div>
                            <span className="text-[#a4b4c4]">{p.dataKey === 'A' ? matchData?.homeTeam : matchData?.awayTeam}:</span>
                            <span className="text-white font-bold">{p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const MetricBar = ({ label, leftVal, rightVal, leftPct, showSymbol = '', delay = 0 }: { label: string; leftVal: number; rightVal: number; leftPct: number; showSymbol?: string; delay?: number }) => (
        <motion.div variants={itemVariants} className="mb-6 last:mb-0">
            <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-primary">{leftVal}{showSymbol}</span>
                <span className="text-muted font-medium">{label}</span>
                <span className="text-muted/60">{rightVal}{showSymbol}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden flex">
                <motion.div initial={{ width: 0 }} animate={{ width: `${leftPct}%` }} transition={{ duration: 1, delay: 1 + delay }} className="h-full bg-primary rounded-r-full" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${100 - leftPct}%` }} transition={{ duration: 1, delay: 1 + delay }} className="h-full bg-border rounded-l-full" />
            </div>
        </motion.div>
    );

    const TableRow = ({ label, left, right }: { label: string; left: string | number; right: string | number }) => {
        const isLeftHigher = Number(left) > Number(right);
        const isRightHigher = Number(right) > Number(left);
        return (
            <motion.div variants={itemVariants} className="flex items-center justify-between py-4 border-b border-border last:border-0 text-sm">
                <span className={`w-1/3 text-center font-bold ${isLeftHigher ? 'text-primary' : 'text-foreground'}`}>{left}</span>
                <span className="w-1/3 text-center text-muted text-xs font-medium">{label}</span>
                <span className={`w-1/3 text-center font-bold ${isRightHigher ? 'text-primary' : 'text-muted'}`}>{right}</span>
            </motion.div>
        );
    };

    const handleExportPDF = async () => {
        if (!pageRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(pageRef.current, {
                backgroundColor: '#0a0f16',
                cacheBust: true,
                filter: (node: HTMLElement) => {
                    return node.getAttribute?.('data-html2canvas-ignore') !== 'true';
                }
            });

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (img.height * pdfWidth) / img.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('team-comparison.pdf');
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };


    const handleShare = async () => {
        const shareData = {
            title: `Team Comparison - ${matchData?.homeTeam} vs ${matchData?.awayTeam}`,
            text: 'Check out this AI-powered team comparison!',
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div ref={pageRef} className="max-w-7xl mx-auto px-6 md:px-10 py-32">
            <BlurIn className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <SectionLabel number="00" path="~/comparison" className="mb-4" />
                    <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mt-4">Team <span className="text-primary">Comparison.</span></h1>
                    <p className="text-muted text-sm mt-2">Head-to-head AI match analysis</p>
                </div>
                <div className="flex items-center gap-3" data-html2canvas-ignore="true">
                    <motion.button whileHover={hoverScale} whileTap={tapScale} onClick={handleShare} className="btn-ghost h-9 px-4 text-xs border border-border hover:border-primary/30">
                        <Share2 className="w-3.5 h-3.5" /> Share
                    </motion.button>
                    <motion.button whileHover={hoverScale} whileTap={tapScale} onClick={handleExportPDF} disabled={isExporting} className="btn-ghost h-9 px-4 text-xs border border-border hover:border-primary/30 disabled:opacity-50">
                        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        {isExporting ? 'Exporting…' : 'PDF'}
                    </motion.button>
                </div>
            </BlurIn>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <GlassCard className="flex flex-col items-center justify-center py-40">
                        <div className="h-10 w-10 rounded-full border-2 border-border border-t-primary animate-spin mb-4" />
                        <p className="text-muted font-mono text-sm">Fetching Head-to-Head Data…</p>
                    </GlassCard>
                ) : !matchData ? (
                    <GlassCard className="flex flex-col items-center justify-center py-40">
                        <p className="text-muted text-sm mb-6">No match selected for comparison.</p>
                        <motion.button whileHover={hoverScale} whileTap={tapScale} onClick={() => window.history.back()} className="btn-primary h-10 px-6 text-xs">
                            Go Back
                        </motion.button>
                    </GlassCard>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <GlassCard className="p-8 lg:p-10 mb-6 flex flex-col md:flex-row items-center justify-between">
                            <motion.div variants={itemVariants} className="flex flex-col items-center w-1/3">
                                <TeamShield teamName={matchData.homeTeam} variant="home" className="mb-3" />
                                <h3 className="font-display font-bold text-foreground mb-2 text-center">{matchData.homeTeam}</h3>
                                <span className="font-mono text-[9px] px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Home</span>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex flex-col items-center w-1/3 my-8 md:my-0">
                                <div className="font-display font-black text-5xl md:text-6xl text-foreground tracking-tight mb-2">
                                    {matchData.homeScore}<span className="text-muted font-light mx-2">—</span>{matchData.awayScore}
                                </div>
                                <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">{matchData.date}</p>
                                <span className="flex items-center gap-1 text-primary text-xs font-semibold"><Trophy className="w-3 h-3" /> {matchData.status}</span>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex flex-col items-center w-1/3">
                                <TeamShield teamName={matchData.awayTeam} variant="away" className="mb-3" />
                                <h3 className="font-display font-bold text-muted mb-2 text-center">{matchData.awayTeam}</h3>
                                <span className="font-mono text-[9px] px-3 py-1 rounded-full bg-surface-2 text-muted border border-border">Away</span>
                            </motion.div>
                        </GlassCard>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <GlassCard className="p-6">
                                <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-6">Performance Radar</p>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                            <PolarGrid stroke="#242e3a" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#8495a7', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="A" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                                            <Radar name="B" dataKey="B" stroke="#64748b" fill="#64748b" fillOpacity={0.2} strokeWidth={2} />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2 text-[10px] text-muted"><div className="w-2 h-2 rounded-full bg-primary" /> {matchData.homeTeam}</div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted"><div className="w-2 h-2 rounded-full bg-border" /> {matchData.awayTeam}</div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-6">Team Attributes</p>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#242e3a" vertical={false} />
                                            <XAxis dataKey="name" stroke="#8495a7" tick={{ fill: '#8495a7', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                                            <YAxis stroke="#8495a7" tick={{ fill: '#8495a7', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                                            <Bar dataKey="A" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                                            <Bar dataKey="B" fill="#64748b" radius={[4, 4, 0, 0]} barSize={18} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2 text-[10px] text-muted"><div className="w-2 h-2 bg-primary rounded-sm" /> {matchData.homeTeam}</div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted"><div className="w-2 h-2 bg-border rounded-sm" /> {matchData.awayTeam}</div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard className="p-6 mb-6">
                            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-8">Key Metrics</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                {matchData.stats.map((s, i) => (
                                    <MetricBar 
                                        key={i}
                                        label={s.name}
                                        leftVal={Number(s.home)}
                                        rightVal={Number(s.away)}
                                        leftPct={(Number(s.home) / (Number(s.home) + Number(s.away) || 1)) * 100}
                                        showSymbol={['Possession', 'Pass Accuracy'].includes(s.name) ? '%' : ''}
                                    />
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 mb-8">
                            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-6">Full Statistics Breakdown</p>
                            <div className="w-full">
                                <div className="flex items-center justify-between pb-4 border-b border-border text-[10px] font-bold text-muted uppercase tracking-widest">
                                    <span className="w-1/3 text-center text-primary">{matchData.homeTeam}</span>
                                    <span className="w-1/3 text-center">Stat</span>
                                    <span className="w-1/3 text-center">{matchData.awayTeam}</span>
                                </div>
                                <div className="flex flex-col">
                                    {matchData.stats.map((s, i) => (
                                        <TableRow key={i} left={s.home} label={s.name} right={s.away} />
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Comparison;
