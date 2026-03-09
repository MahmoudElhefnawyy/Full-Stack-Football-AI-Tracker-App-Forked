import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const Heatmaps = () => {
    const [selectedPlayer, setSelectedPlayer] = useState('Luca');

    const playerData = [
        { name: 'Carlos', position: 'GK', speed: 45, dribbling: 50, shooting: 30, passing: 70, defending: 85, overall: 7.2, goals: 0, assists: 1 },
        { name: 'Luca', position: 'CB', speed: 70, dribbling: 60, shooting: 55, passing: 68, defending: 88, overall: 7.8, goals: 3, assists: 1 },
        { name: 'Ahmed', position: 'CB', speed: 68, dribbling: 55, shooting: 40, passing: 65, defending: 85, overall: 7.5, goals: 2, assists: 0 },
        { name: 'Sergio', position: 'LB', speed: 82, dribbling: 75, shooting: 60, passing: 78, defending: 80, overall: 8.3, goals: 4, assists: 6 },
        { name: 'James', position: 'RB', speed: 85, dribbling: 72, shooting: 58, passing: 75, defending: 78, overall: 7.9, goals: 1, assists: 8 },
        { name: 'Yuki', position: 'CM', speed: 75, dribbling: 82, shooting: 70, passing: 88, defending: 72, overall: 8.5, goals: 7, assists: 12 },
        { name: 'Diego', position: 'CM', speed: 72, dribbling: 80, shooting: 75, passing: 85, defending: 70, overall: 8.2, goals: 9, assists: 7 },
        { name: 'Mehdi', position: 'CAM', speed: 78, dribbling: 88, shooting: 82, passing: 90, defending: 55, overall: 8.7, goals: 14, assists: 9 },
        { name: 'Kwame', position: 'LW', speed: 92, dribbling: 86, shooting: 80, passing: 76, defending: 40, overall: 8.4, goals: 11, assists: 13 },
        { name: 'Ravi', position: 'RW', speed: 88, dribbling: 85, shooting: 78, passing: 80, defending: 45, overall: 8.1, goals: 8, assists: 10 },
        { name: 'Alexei', position: 'ST', speed: 85, dribbling: 82, shooting: 92, passing: 70, defending: 35, overall: 9.0, goals: 22, assists: 5 },
    ];

    const scatterData = Array.from({ length: 15 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 100,
    }));

    const currentPlayer = playerData.find(p => p.name === selectedPlayer) || playerData[1];

    const renderPitchGrid = () => (
        <div className="relative w-full aspect-[1.6] bg-[#1a2d1d] border border-[#2a3f2d] rounded-xl overflow-hidden mt-4">
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 opacity-30">
                {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="border border-[#3a5a3d]" style={{ backgroundColor: `rgba(0, 200, 100, ${Math.random() * 0.4})` }}></div>
                ))}
            </div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />
            <div className="absolute left-1/2 top-1/2 w-[20%] h-[30%] border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute left-0 top-[20%] w-[15%] h-[60%] border border-white/20 border-l-0" />
            <div className="absolute right-0 top-[20%] w-[15%] h-[60%] border border-white/20 border-r-0" />
            <div className="absolute bottom-2 right-4 text-[10px] font-bold text-white/30 flex gap-2 items-center">
                <span>Low</span>
                <div className="w-16 h-2 bg-gradient-to-r from-[#1a2d1d] to-primary rounded-full"></div>
                <span>High</span>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-32 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Heatmaps & Visualization</h1>
                <p className="text-[#8495a7] text-sm">Positional data and performance visualization for teams and players</p>
            </div>

            <div className="flex gap-4 mb-8">
                <button className="bg-primary text-[#0a0f16] px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0a0f16]"></span> FC Green Eagles
                </button>
                <button className="bg-[#0f151c] border border-white/10 text-white hover:bg-white/5 transition-colors px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Black Panthers FC
                </button>
            </div>

            {/* Zone Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#0f151c] border border-white/5 rounded-3xl p-6">
                    <h2 className="text-sm font-bold text-white mb-2">FC Green Eagles — Zone Activity</h2>
                    {renderPitchGrid()}
                </div>
                <div className="bg-[#0f151c] border border-white/5 rounded-3xl p-6">
                    <h2 className="text-sm font-bold text-white mb-2">Black Panthers FC — Zone Activity</h2>
                    <div className="relative w-full aspect-[1.6] bg-[#1d252f] border border-[#2d3a47] rounded-xl overflow-hidden mt-4">
                        <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 opacity-30">
                            {Array.from({ length: 60 }).map((_, i) => (
                                <div key={i} className="border border-[#3d4a57]" style={{ backgroundColor: `rgba(150, 150, 150, ${Math.random() * 0.4})` }}></div>
                            ))}
                        </div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />
                        <div className="absolute left-1/2 top-1/2 w-[20%] h-[30%] border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute left-0 top-[20%] w-[15%] h-[60%] border border-white/20 border-l-0" />
                        <div className="absolute right-0 top-[20%] w-[15%] h-[60%] border border-white/20 border-r-0" />
                        <div className="absolute bottom-2 right-4 text-[10px] font-bold text-white/30 flex gap-2 items-center">
                            <span>Low</span>
                            <div className="w-16 h-2 bg-gradient-to-r from-[#1d252f] to-[#8495a7] rounded-full"></div>
                            <span>High</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Player Attribute Comparison */}
            <div className="bg-[#0f151c] border border-white/5 rounded-3xl p-6 mb-6 overflow-hidden">
                <h2 className="text-sm font-bold text-white mb-6">FC Green Eagles — Player Attribute Comparison</h2>
                <div className="w-full h-64 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={playerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                            <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0a0f16', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="speed" fill="#00c968" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="dribbling" fill="#008844" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="shooting" fill="#99ffcc" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="passing" fill="#22aa66" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-6 text-[10px] font-bold text-white/50">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#00c968] rounded-sm"></div> speed</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#008844] rounded-sm"></div> dribbling</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#99ffcc] rounded-sm"></div> shooting</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#22aa66] rounded-sm"></div> passing</span>
                </div>
            </div>

            {/* Individual Player */}
            <div className="bg-[#0f151c] border border-white/5 rounded-3xl p-6">
                <h2 className="text-sm font-bold text-white mb-6">Individual Player Position Heatmap</h2>

                <div className="flex flex-wrap gap-2 mb-8">
                    {playerData.map(p => (
                        <button
                            key={p.name}
                            onClick={() => setSelectedPlayer(p.name)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-colors border ${selectedPlayer === p.name ? 'bg-primary/20 border-primary text-primary' : 'bg-[#0a0f16] border-white/5 text-white/70 hover:text-white'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedPlayer === p.name ? 'bg-primary' : 'bg-white/30'}`}></div>
                            {p.name} <span className="text-white/30">({p.position})</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-[13px] font-bold text-white mb-6">Position Distribution — {currentPlayer.name}</h3>
                        <div className="w-full h-56 bg-[#0a0f16] border border-white/5 rounded-xl flex items-center justify-center -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                    <XAxis type="number" dataKey="x" name="Field Width" axisLine={false} tickLine={false} stroke="#ffffff30" fontSize={10} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]}
                                        label={{ value: "Field Width %", position: "insideBottom", offset: -10, fill: "#ffffff30", fontSize: 9 }}
                                    />
                                    <YAxis type="number" dataKey="y" name="Field Length" axisLine={false} tickLine={false} stroke="#ffffff30" fontSize={10} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0a0f16', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '12px' }} />
                                    <Scatter name="Position" data={scatterData} fill="#00c968" line shape="circle" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[13px] font-bold text-white mb-6">Attribute Profile</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Speed', val: currentPlayer.speed },
                                { name: 'Dribbling', val: currentPlayer.dribbling },
                                { name: 'Shooting', val: currentPlayer.shooting },
                                { name: 'Passing', val: currentPlayer.passing },
                                { name: 'Defending', val: currentPlayer.defending },
                            ].map(attr => (
                                <div key={attr.name}>
                                    <div className="flex justify-between text-[11px] font-bold text-white/70 mb-2">
                                        <span>{attr.name}</span>
                                        <span>{attr.val}/100</span>
                                    </div>
                                    <div className="h-2 bg-[#0a0f16] rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: `${attr.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 bg-[#0a0f16] border border-white/5 rounded-xl p-4 text-[11px] font-bold text-white/50 flex flex-wrap gap-4">
                            <span><span className="text-primary">Position:</span> {currentPlayer.position}</span>
                            <span>|</span>
                            <span><span className="text-primary">Overall:</span> {currentPlayer.overall}/10</span>
                            <span>|</span>
                            <span><span className="text-primary">Goals:</span> {currentPlayer.goals}</span>
                            <span>|</span>
                            <span><span className="text-primary">Assists:</span> {currentPlayer.assists}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Heatmaps;
