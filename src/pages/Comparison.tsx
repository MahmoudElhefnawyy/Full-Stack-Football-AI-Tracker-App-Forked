import { useRef, useState } from 'react';
import { Share2, Download, Loader2 } from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const Comparison = () => {
    const pageRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Mock Data for Charts
    const radarData = [
        { subject: 'Possession', A: 85, B: 65 },
        { subject: 'Shots', A: 75, B: 55 },
        { subject: 'Passing', A: 90, B: 70 },
        { subject: 'Defense', A: 70, B: 85 },
        { subject: 'Attack', A: 80, B: 60 },
        { subject: 'Discipline', A: 60, B: 75 },
    ];

    const barData = [
        { name: 'Speed', A: 75, B: 65 },
        { name: 'Dribbling', A: 85, B: 70 },
        { name: 'Shooting', A: 80, B: 75 },
        { name: 'Passing', A: 85, B: 80 },
        { name: 'Defending', A: 70, B: 100 },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0b1016] border border-[#242e3a] p-3 rounded-lg shadow-xl">
                    <p className="text-white font-medium mb-2">{label}</p>
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                            <span className="text-[#a4b4c4]">{p.name === 'A' ? 'FC Green Eagles' : 'Black Panthers FC'}:</span>
                            <span className="text-white font-bold">{p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const MetricBar = ({ label, leftVal, rightVal, leftPct, showSymbol = '' }: any) => (
        <div className="mb-6 last:mb-0">
            <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-[#10b981]">{leftVal}{showSymbol}</span>
                <span className="text-[#8495a7] font-medium">{label}</span>
                <span className="text-[#64748b]">{rightVal}{showSymbol}</span>
            </div>
            <div className="h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#10b981] rounded-r-full" style={{ width: `${leftPct}%` }}></div>
                <div className="h-full bg-[#334155] rounded-l-full" style={{ width: `${100 - leftPct}%` }}></div>
            </div>
        </div>
    );

    const TableRow = ({ label, left, right }: any) => {
        const isLeftHigher = Number(left) > Number(right);
        const isRightHigher = Number(right) > Number(left);
        return (
            <div className="flex items-center justify-between py-4 border-b border-[#242e3a]/50 last:border-0 text-sm">
                <span className={`w-1/3 text-center font-bold ${isLeftHigher ? 'text-[#10b981]' : 'text-white'}`}>{left}</span>
                <span className="w-1/3 text-center text-[#8495a7] text-xs font-medium">{label}</span>
                <span className={`w-1/3 text-center font-bold ${isRightHigher ? 'text-[#10b981]' : 'text-[#8495a7]'}`}>{right}</span>
            </div>
        );
    };

    const handleExportPDF = async () => {
        if (!pageRef.current) return;
        setIsExporting(true);
        try {
            // Hide elements with data-html2canvas-ignore (we'll manually handle this or use filter)
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
            pdf.save('team-comparison.pdf');
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };


    const handleShare = async () => {
        const shareData = {
            title: 'Team Comparison - FC Green Eagles vs Black Panthers FC',
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
        <div ref={pageRef} className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-32 animate-fade-in text-white bg-[#0a0f16]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Team Comparison</h1>
                    <p className="text-[#8495a7] text-sm">Head-to-head analysis</p>
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

            {/* Match Result Banner */}
            <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6 lg:p-10 mb-6 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#10b981]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#3b82f6]/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>

                {/* Left Team */}
                <div className="flex flex-col items-center z-10 w-1/3">
                    <div className="w-16 h-16 bg-[#064e3b]/30 border border-[#10b981]/30 rounded-xl flex items-center justify-center mb-3 text-2xl">
                        🦅
                    </div>
                    <h3 className="font-bold text-white mb-2 text-center">FC Green Eagles</h3>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                        W18 D4 L2
                    </span>
                </div>

                {/* Score Center */}
                <div className="flex flex-col items-center justify-center z-10 my-8 md:my-0 w-1/3">
                    <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">
                        3<span className="text-[#8495a7] font-light mx-2">-</span>1
                    </div>
                    <div className="text-[#8495a7] text-xs uppercase tracking-widest mb-1">Match Result</div>
                    <div className="text-[#10b981] text-xs font-semibold">FC Green Eagles Win</div>
                </div>

                {/* Right Team */}
                <div className="flex flex-col items-center z-10 w-1/3">
                    <div className="w-16 h-16 bg-[#1e293b]/50 border border-[#334155] rounded-xl flex items-center justify-center mb-3 text-2xl">
                        🐆
                    </div>
                    <h3 className="font-bold text-[#e2e8f0] mb-2 text-center">Black Panthers FC</h3>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#1e293b] text-[#94a3b8] border border-[#334155]">
                        W14 D6 L4
                    </span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Radar Chart Card */}
                <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-6">Performance Radar</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#242e3a" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8495a7', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="A" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                                <Radar name="B" dataKey="B" stroke="#64748b" fill="#64748b" fillOpacity={0.2} strokeWidth={2} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center items-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-xs text-[#8495a7]">
                            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div> FC Green Eagles
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#8495a7]">
                            <div className="w-3 h-3 rounded-full bg-[#64748b]"></div> Black Panthers FC
                        </div>
                    </div>
                </div>

                {/* Bar Chart Card */}
                <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-6">Team Attributes (Average)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#242e3a" vertical={false} />
                                <XAxis dataKey="name" stroke="#8495a7" tick={{ fill: '#8495a7', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#8495a7" tick={{ fill: '#8495a7', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                                <Bar dataKey="A" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="B" fill="#64748b" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center items-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-xs text-[#8495a7]">
                            <div className="w-3 h-3 bg-[#10b981] rounded-sm"></div> FC Green Eagles
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#8495a7]">
                            <div className="w-3 h-3 bg-[#64748b] rounded-sm"></div> Black Panthers FC
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6 mb-6 relative">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-white">Key Metrics</h3>
                    <button className="flex items-center gap-1 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                        Hide &rarr;
                    </button>
                </div>

                <div className="space-y-2">
                    <MetricBar label="Possession" leftVal={58} rightVal={42} leftPct={58} showSymbol="%" />
                    <MetricBar label="Pass Accuracy" leftVal={87} rightVal={79} leftPct={52} showSymbol="%" />
                    <MetricBar label="Shots" leftVal={14} rightVal={9} leftPct={60} />
                    <MetricBar label="Goals" leftVal={3} rightVal={1} leftPct={75} />
                </div>
            </div>

            {/* Statistics Breakdown Table */}
            <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-white mb-6">Full Statistics Breakdown</h3>

                <div className="w-full">
                    {/* Table Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#242e3a] text-xs font-medium text-[#8495a7]">
                        <span className="w-1/3 text-center text-[#10b981]">FC Green<br />Eagles</span>
                        <span className="w-1/3 text-center">Stat</span>
                        <span className="w-1/3 text-center">Black<br />Panthers FC</span>
                    </div>

                    {/* Table Body */}
                    <div className="flex flex-col">
                        <TableRow left="1" label="Penalty Kicks" right="0" />
                        <TableRow left="14" label="Shots Total" right="9" />
                        <TableRow left="8" label="Shots on Target" right="4" />
                        <TableRow left="2" label="Yellow Cards" right="3" />
                        <TableRow left="0" label="Red Cards" right="1" />
                        <TableRow left="11" label="Fouls" right="14" />
                        <TableRow left="3" label="Offsides" right="2" />
                        <TableRow left="6" label="Corners" right="3" />
                        <TableRow left="542" label="Total Passes" right="389" />
                        <TableRow left="87" label="Pass Accuracy %" right="79" />
                        <TableRow left="3" label="Goals" right="1" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comparison;
