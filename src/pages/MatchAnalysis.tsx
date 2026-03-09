import { useRef, useState } from 'react';
import { Share2, Download, RefreshCcw, Clock, Calendar, Zap, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const MatchAnalysis = () => {
    const pageRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const pieData = [
        { name: 'FC Green Eagles', value: 58 },
        { name: 'Black Panthers FC', value: 42 },
    ];
    const COLORS = ['#10b981', '#334155'];

    const barData = [
        { name: 'Shots', home: 14, away: 8 },
        { name: 'On Target', home: 8, away: 4 },
        { name: 'Corners', home: 6, away: 3 },
        { name: 'Fouls', home: 12, away: 16 },
        { name: 'Yellow', home: 2, away: 3 },
        { name: 'Passes', home: 450, away: 320 },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0f151c] border border-[#242e3a] p-3 rounded-lg shadow-xl">
                    <p className="text-white font-medium mb-2">{label}</p>
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.fill }}></div>
                            <span className="text-[#a4b4c4]">{p.dataKey === 'home' ? 'FC Green Eagles' : 'Black Panthers FC'}:</span>
                            <span className="text-white font-bold">{p.value}</span>
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
                backgroundColor: '#0a0f16',
                cacheBust: true,
                filter: (node: any) => {
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
            pdf.save('match-analysis.pdf');
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };


    const handleShare = async () => {
        const shareData = {
            title: 'Match Analysis - FC Green Eagles vs Black Panthers FC',
            text: 'Check out this AI-powered match analysis!',
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
        <div ref={pageRef} className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-32 animate-fade-in text-white bg-[#0a0f16]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Match Analysis</h1>
                    <p className="text-[#8495a7] text-sm">AI-powered performance breakdown</p>
                </div>
                <div className="flex items-center gap-3" data-html2canvas-ignore="true">
                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-[#0d151c] hover:bg-[#15202b] border border-[#242e3a] rounded-lg text-sm font-medium transition-colors text-white">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-[#0d151c] hover:bg-[#15202b] border border-[#242e3a] rounded-lg text-sm font-medium transition-colors text-[#10b981] disabled:opacity-50">
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExporting ? 'Exporting...' : 'PDF'}
                    </button>
                </div>
            </div>

            {/* Scoreboard Banner */}
            <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-8 mb-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 w-full max-w-[800px] h-64 bg-[#10b981]/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="absolute top-6 right-8 text-xs font-semibold text-[#8495a7] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> 2026-03-03
                </div>

                <div className="flex justify-between items-center w-full max-w-2xl relative z-10 mt-2">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-16 h-16 bg-[#15202b] border border-[#242e3a] rounded-2xl flex items-center justify-center mb-3">
                            <span className="text-3xl">🦅</span>
                        </div>
                        <span className="text-sm font-bold text-white">FC Green Eagles</span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center justify-center gap-4 text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">
                            <span>3</span>
                            <span className="text-[#334155] font-light mx-1">-</span>
                            <span>1</span>
                            <RefreshCcw className="w-6 h-6 text-white ml-2" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8495a7]">
                            <Clock className="w-3.5 h-3.5" /> Full Time · 90'
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-16 h-16 bg-[#15202b] border border-[#242e3a] rounded-2xl flex items-center justify-center mb-3">
                            <span className="text-3xl">🐆</span>
                        </div>
                        <span className="text-sm font-bold text-[#e2e8f0]">Black Panthers FC</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
                <button className="bg-[#10b981] hover:bg-[#059669] text-[#0a0f16] px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                    Overview
                </button>
                <button className="bg-[#0b1016] hover:bg-[#15202b] text-white border border-[#242e3a] px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                    Events
                </button>
                <button className="bg-[#0b1016] hover:bg-[#15202b] text-white border border-[#242e3a] px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                    Players
                </button>
            </div>

            {/* Top Stat Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Ball Possession', icon: <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>, home: 58, away: 42, unit: '%', isPercentage: true },
                    { label: 'Pass Accuracy', icon: <Zap className="w-3.5 h-3.5 text-[#10b981]" />, home: 87, away: 79, unit: '%', isPercentage: true },
                    { label: 'Shots on Target', icon: <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>, home: 8, away: 4, isPercentage: false, max: 20 },
                    { label: 'Yellow Cards', icon: <div className="w-2.5 h-2.5 rounded-full border-[2px] border-[#eab308]"></div>, home: 2, away: 3, isPercentage: false, max: 10 },
                ].map(stat => {
                    const homePercent = stat.isPercentage ? stat.home : (stat.home / (stat.max || 1)) * 100;
                    const awayPercent = stat.isPercentage ? stat.away : (stat.away / (stat.max || 1)) * 100;

                    return (
                        <div key={stat.label} className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-5">
                            <div className="text-xs font-semibold text-[#8495a7] mb-4 flex items-center gap-2">
                                {stat.icon} {stat.label}
                            </div>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-2xl font-bold text-white leading-none">{stat.home}{stat.unit}</span>
                                <span className="text-xl font-bold text-[#8495a7] leading-none">{stat.away}{stat.unit}</span>
                            </div>
                            <div className="flex gap-1.5 h-1.5 w-full">
                                <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${homePercent}%` }}></div>
                                <div className="h-full bg-[#334155] rounded-full" style={{ width: `${awayPercent}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Ball Possession Donut */}
                <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6 flex flex-col">
                    <h3 className="font-bold text-white mb-6">Ball Possession</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-1">
                        <div className="w-32 h-32 relative">
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
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-white">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                                <span className="w-28 text-[#e2e8f0]">FC Green Eagles</span>
                                <span className="text-[#10b981] font-bold">58%</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-[#8495a7]">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#334155]"></div>
                                <span className="w-28">Black Panthers FC</span>
                                <span className="text-[#8495a7] font-bold">42%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Match Statistics Bar Chart */}
                <div className="lg:col-span-2 bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-6">Match Statistics</h3>
                    <div className="w-full h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barGap={2} barCategoryGap={16}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#242e3a" />
                                <XAxis type="number" stroke="#8495a7" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#8495a7" fontSize={11} axisLine={false} tickLine={false} tickMargin={20} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                                <Bar dataKey="home" fill="#10b981" radius={[0, 4, 4, 0]} barSize={8} />
                                <Bar dataKey="away" fill="#334155" radius={[0, 4, 4, 0]} barSize={8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchAnalysis;
