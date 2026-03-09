import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { RadarStatsChart, DonutChart } from '../components/ui/Charts';
import { mockPlayers } from '../services/mockData';
import { User, Activity, CheckCircle, Target } from 'lucide-react';

const PlayerProfile: React.FC = () => {
    const player = mockPlayers[0];

    return (
        <div className="container mx-auto px-4 py-32 max-w-7xl animate-fade-in text-white">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 text-emerald-500/10 rotate-12 group-hover:rotate-6 transition-transform duration-500">
                    <span className="text-[250px] font-bold italic block leading-none">{player.number}</span>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-xl">
                        <User className="w-16 h-16 text-slate-500" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold mb-2">{player.name}</h1>
                        <p className="text-xl text-slate-400">{player.position} • {player.team}</p>
                        <div className="mt-4 flex gap-4 justify-center md:justify-start">
                            <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30">
                                <span className="block text-xs uppercase font-bold opacity-70">OVR</span>
                                <span className="text-xl font-black">{player.stats.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Season Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl">
                                <div className="flex items-center gap-3"><Target className="w-5 h-5 text-emerald-400" /> Goals</div>
                                <span className="font-bold text-xl">{player.stats.goals}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl">
                                <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-blue-400" /> Assists</div>
                                <span className="font-bold text-xl">{player.stats.assists}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl">
                                <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-purple-400" /> Matches</div>
                                <span className="font-bold text-xl">{player.stats.matchesPlayed}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Action Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChart data={[
                                { name: 'Passes', value: 400 },
                                { name: 'Shots', value: 50 },
                                { name: 'Tackles', value: 30 },
                                { name: 'Crosses', value: 65 }
                            ]} height={250} />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Technical Attributes</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[450px]">
                            <RadarStatsChart data={player.attributes} height={400} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PlayerProfile;
