import { Play, Upload, BarChart3, Users, Map, Settings, Trash2 } from 'lucide-react';
import { mockUser, mockRecordings } from '../services/mockData';

const Dashboard = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/50">
                        {mockUser.avatar}
                    </div>
                    <div>
                        <p className="text-white/50 text-sm font-medium">Welcome back,</p>
                        <h1 className="text-3xl font-bold"> {mockUser.name}!</h1>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="btn-primary flex-grow md:flex-grow-0">
                        <Upload className="h-4 w-4" /> Upload New Video
                    </button>
                    <button className="btn-outline flex-grow md:flex-grow-0">
                        <BarChart3 className="h-4 w-4" /> View Analysis
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                    { label: 'Total Videos', value: mockUser.stats.totalVideos, icon: Play },
                    { label: 'Analyzed', value: mockUser.stats.analyzed, icon: BarChart3 },
                    { label: 'Teams Tracked', value: mockUser.stats.teamsTracked, icon: Users },
                    { label: 'Matches Reviewed', value: mockUser.stats.matchesReviewed, icon: Map },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 flex flex-col items-center justify-center text-center">
                        <stat.icon className="h-5 w-5 text-primary mb-3" />
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-white/30">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recordings */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Your Recordings</h2>
                        <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                            Upload New <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {mockRecordings.map((rec) => (
                            <div key={rec.id} className="glass-card overflow-hidden group">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="w-full sm:w-48 h-32 relative">
                                        <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Play className="h-8 w-8 text-white fill-white" />
                                        </div>
                                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold">
                                            {rec.duration}
                                        </div>
                                    </div>
                                    <div className="flex-grow p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${rec.status === 'Analyzed' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {rec.status}
                                                </span>
                                                <span className="text-[10px] text-white/30 font-medium">{rec.date}</span>
                                            </div>
                                            <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{rec.title}</h3>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <button className="flex items-center gap-2 text-xs font-bold bg-primary text-background px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">
                                                <BarChart3 className="h-3 w-3" /> Analyze
                                            </button>
                                            <button className="text-white/30 hover:text-red-500 transition-colors p-1.5">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Quick Actions & Tips */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/30 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'In-Depth Analysis', icon: BarChart3 },
                                { label: 'Team Comparison', icon: Users },
                                { label: 'Recommendations', icon: Settings },
                                { label: 'Heatmaps', icon: Map },
                            ].map((action, i) => (
                                <button key={i} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all gap-2 text-center group">
                                    <action.icon className="h-5 w-5 text-white/30 group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] font-bold tracking-tight leading-tight">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 border-primary/20 bg-primary/5">
                        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Pro Tip
                        </h2>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Upload recordings from a high-angle lateral position for best tracking results. Our AI works best with 1080p resolution footage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Import helper
const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export default Dashboard;
