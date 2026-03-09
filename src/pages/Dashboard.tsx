import { Play, Upload, BarChart3, Users, Map, Settings, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockUser, mockRecordings } from '../services/mockData';

const Dashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-32">
            {/* Welcome Header */}
            <div className="flex flex-col gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-[#0a0f16]">
                        {mockUser.avatar}
                    </div>
                    <div>
                        <p className="text-white/50 text-sm font-medium">Welcome back,</p>
                        <h1 className="text-4xl font-bold text-white">{mockUser.name}!</h1>
                    </div>
                </div>
                <p className="text-[#8495a7] text-sm max-w-md leading-relaxed">
                    Your match recordings are ready for analysis. Explore insights,
                    compare teams, and get performance recommendations.
                </p>
                <div className="flex gap-4 mt-2">
                    <Link to="/upload" className="flex items-center justify-center gap-2 rounded-full border border-primary text-primary font-bold px-5 py-2 hover:bg-primary/10 transition-colors text-xs">
                        <Upload className="h-4 w-4" /> Upload New Video
                    </Link>
                    <Link to="/analysis" className="flex items-center justify-center gap-2 rounded-full border border-white/10 text-white font-bold px-5 py-2 hover:bg-white/5 transition-colors text-xs">
                        <BarChart3 className="h-4 w-4" /> View Analysis
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-12">
                <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'In-Depth Analysis', desc: 'Full match breakdown', icon: BarChart3, path: '/analysis' },
                        { label: 'Team Comparison', desc: 'Side-by-side stats', icon: Users, path: '/comparison' },
                        { label: 'Recommendations', desc: 'Performance tips', icon: Settings, path: '/recommendations' },
                        { label: 'Heatmaps', desc: 'Positional data', icon: Map, path: '/heatmaps' },
                    ].map((action, i) => (
                        <Link to={action.path} key={i} className="block bg-[#0f151c] rounded-2xl p-5 border border-white/5 hover:border-primary/20 hover:bg-[#131b24] transition-all cursor-pointer group flex flex-col items-start gap-4">
                            <action.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                            <div>
                                <h3 className="text-sm font-bold text-white mb-1">{action.label}</h3>
                                <p className="text-[11px] text-[#5e6b7e]">{action.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Your Recordings */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">Your Recordings</h2>
                    <Link to="/upload" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                        Upload New <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockRecordings.map((rec) => (
                        <div key={rec.id} className="bg-[#0f151c] rounded-2xl overflow-hidden border border-white/5 flex flex-col group">
                            <div className="w-full h-40 relative">
                                <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-[#0a0f16] flex items-center gap-1">
                                    ✓ {rec.status}
                                </div>
                                <div className="absolute bottom-3 right-3 text-[10px] font-bold text-white/50">
                                    {rec.duration}
                                </div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <h3 className="font-bold text-sm text-white mb-1">{rec.title}</h3>
                                <div className="text-[10px] text-[#5e6b7e] font-medium mb-4">{rec.date}</div>

                                <div className="mt-auto flex items-center gap-2">
                                    <button className="flex-grow flex items-center justify-center gap-2 text-[11px] font-bold bg-primary text-[#0a0f16] px-4 py-2.5 rounded-xl hover:bg-[#00c968] transition-colors">
                                        <Play className="h-3.5 w-3.5 fill-current" /> Analyze
                                    </button>
                                    <button title='delete' className="bg-[#151b23] text-red-500 hover:bg-black p-2.5 rounded-xl transition-colors border border-white/5">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Internal Import helper
const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export default Dashboard;
