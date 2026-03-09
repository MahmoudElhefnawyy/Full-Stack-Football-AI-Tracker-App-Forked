import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RadarStatsChart } from '../components/ui/Charts';
import { mockTeams, mockPlayers } from '../services/mockData';
import { Shield, MapPin, Award, Users } from 'lucide-react';

const TeamDetails: React.FC = () => {
    const team = mockTeams[0];
    const [activeTab, setActiveTab] = useState<'overview' | 'roster'>('overview');

    const radarData = Object.keys(team.attributes).map(key => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        A: team.attributes[key as keyof typeof team.attributes]
    }));

    return (
        <div className="container mx-auto px-4 py-32 max-w-7xl animate-fade-in text-white">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center justify-center">
                    <Shield className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold">{team.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {team.stadium}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Coach: {team.coach}</span>
                        <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Est. {team.founded}</span>
                    </div>
                </div>
                <Button>Edit Team</Button>
            </div>

            <div className="flex border-b border-slate-800 mb-8">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 px-4 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'border-b-2 border-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('roster')}
                    className={`pb-4 px-4 text-sm font-medium transition-colors ${activeTab === 'roster' ? 'border-b-2 border-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Roster
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="md:col-span-2 border-slate-800">
                        <CardHeader>
                            <CardTitle>Team Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadarStatsChart data={radarData} height={350} />
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-emerald-500/20 bg-emerald-500/5 line-clamp-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-emerald-400">Season Record</CardTitle>
                            </CardHeader>
                            <CardContent className="text-3xl font-bold">
                                {team.stats.wins}W - {team.stats.draws}D - {team.stats.losses}L
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Goals</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center text-lg">
                                <span><span className="text-emerald-400 font-bold">{team.stats.goalsFor}</span> For</span>
                                <span className="h-6 w-px bg-slate-700"></span>
                                <span><span className="text-rose-400 font-bold">{team.stats.goalsAgainst}</span> Against</span>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'roster' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mockPlayers.map(player => (
                        <Card key={player.id} className="hover:border-emerald-500/50 transition-colors cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="text-right text-emerald-500 font-mono font-bold text-xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    #{player.number}
                                </div>
                                <h3 className="font-bold text-lg">{player.name}</h3>
                                <p className="text-sm text-slate-400 mb-4">{player.position}</p>
                                <div className="text-xs bg-slate-800 rounded px-2 py-1 inline-block text-slate-300">
                                    Rating: <span className="text-white font-bold">{player.stats.rating}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamDetails;
