import React from 'react';
import { Share2, Download, TrendingUp, TrendingDown, Users, Lightbulb, Zap, Target, Flag, Star, ChevronRight, Activity, Shield } from 'lucide-react';

const Recommendations: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-32 animate-fade-in text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Recommendations</h1>
                    <p className="text-[#8495a7] text-sm">AI-powered performance insights for FC Green Eagles</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0d151c] hover:bg-[#15202b] border border-[#242e3a] rounded-lg text-sm font-medium transition-colors text-white">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0d151c] hover:bg-[#15202b] border border-[#242e3a] rounded-lg text-sm font-medium transition-colors text-white">
                        <Download className="w-4 h-4" /> PDF
                    </button>
                </div>
            </div>

            {/* Top Performers Section */}
            <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h2 className="text-xl font-bold text-white">Top Performers</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        4 players
                    </span>
                </div>
                <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl flex flex-col p-1">
                    {/* Player 1 */}
                    <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-pointer border-b border-[#242e3a] border-opacity-50 last:border-0 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                                YT
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white">Yuki Tanaka</h3>
                                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">CM</span>
                                </div>
                                <div className="text-[#8495a7] text-xs mb-2">
                                    7 goals · 12 assists
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Zap className="w-3.5 h-3.5" /> Elite dribbler (82)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Activity className="w-3.5 h-3.5" /> Creative passer (88)
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-green-400 text-lg">8.5</span>
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#8495a7] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Player 2 */}
                    <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-pointer border-b border-[#242e3a] border-opacity-50 last:border-0 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                                MT
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white">Mehdi Taremi</h3>
                                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">CAM</span>
                                </div>
                                <div className="text-[#8495a7] text-xs mb-2">
                                    14 goals · 9 assists
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Zap className="w-3.5 h-3.5" /> Elite dribbler (85)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Target className="w-3.5 h-3.5" /> Deadly finisher (86)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Activity className="w-3.5 h-3.5" /> Creative passer (87)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Star className="w-3.5 h-3.5" /> Clinical in front of goal
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-green-400 text-lg">8.7</span>
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#8495a7] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Player 3 */}
                    <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-pointer border-b border-[#242e3a] border-opacity-50 last:border-0 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                                KA
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white">Kwame Asante</h3>
                                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">LW</span>
                                </div>
                                <div className="text-[#8495a7] text-xs mb-2">
                                    11 goals · 13 assists
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Zap className="w-3.5 h-3.5" /> Explosive speed (92)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Zap className="w-3.5 h-3.5" /> Elite dribbler (88)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Star className="w-3.5 h-3.5" /> Clinical in front of goal
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-green-400 text-lg">8.4</span>
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#8495a7] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Player 4 */}
                    <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-pointer border-b border-[#242e3a] border-opacity-50 last:border-0 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                                AV
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white">Alexei Volkov</h3>
                                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">ST</span>
                                </div>
                                <div className="text-[#8495a7] text-xs mb-2">
                                    22 goals · 5 assists
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Zap className="w-3.5 h-3.5" /> Explosive speed (85)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Zap className="w-3.5 h-3.5" /> Elite dribbler (82)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Target className="w-3.5 h-3.5" /> Deadly finisher (94)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-400/80">
                                        <Star className="w-3.5 h-3.5" /> Clinical in front of goal
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-yellow-500 text-lg">9.0</span>
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#8495a7] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                </div>
            </section>

            {/* Needs Improvement Section */}
            <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-bold text-white">Needs Improvement</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        1 players
                    </span>
                </div>
                <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl flex flex-col p-1">
                    <div className="p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-pointer border-b border-[#242e3a] border-opacity-50 last:border-0 relative">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-900 border border-orange-700 flex items-center justify-center text-orange-100 font-bold text-lg mt-1">
                                    AH
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">Ahmed Hassan</h3>
                                        <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">CB</span>
                                    </div>
                                    <div className="text-[#8495a7] text-xs mb-3">
                                        2 goals · 0 assists
                                    </div>
                                    <ul className="space-y-1.5 text-sm text-[#a4b4c4]">
                                        <li className="flex items-start gap-2">
                                            <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                            <span>Improve short-range passing accuracy and decision making</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Lightbulb className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                            <span>Requires additional shooting drills and positioning work</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                            <span>Focus on consistency across the full 90 minutes</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-orange-400 text-lg">7.5</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#8495a7] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Opposing Key Players to Watch Section */}
            <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Opposing Key Players to Watch</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Black Panthers FC
                    </span>
                </div>
                <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl flex flex-col p-1">
                    {/* Opposing Player 1 */}
                    <div className="p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-pointer border-b border-[#242e3a] border-opacity-50 last:border-0 relative">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-blue-100 font-bold text-lg mt-1">
                                    PS
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">Pablo Suarez</h3>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">CAM</span>
                                    </div>
                                    <div className="text-[#8495a7] text-xs flex items-center gap-3 mb-3">
                                        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> 12 goals</span>
                                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> 11 assists</span>
                                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Speed: 76</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="text-[#a4b4c4]"><span className="text-[#8495a7] font-medium">Strengths:</span> Elite dribbler, creative vision, strong overall performance</div>
                                        <div className="text-blue-300"><span className="text-blue-400 font-medium">Tactical Advice:</span> Deny space in the final third, press quickly.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center flex-shrink-0 self-end sm:self-start">
                                <span className="font-bold text-yellow-500 text-lg">8.6</span>
                            </div>
                        </div>
                    </div>

                    {/* Opposing Player 2 */}
                    <div className="p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-pointer border-b border-[#242e3a] border-opacity-50 last:border-0 relative">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-blue-100 font-bold text-lg mt-1">
                                    EM
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">Eto Mensah</h3>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">LW</span>
                                    </div>
                                    <div className="text-[#8495a7] text-xs flex items-center gap-3 mb-3">
                                        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> 9 goals</span>
                                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> 8 assists</span>
                                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Speed: 90</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="text-[#a4b4c4]"><span className="text-[#8495a7] font-medium">Strengths:</span> Elite dribbler, lightning pace</div>
                                        <div className="text-blue-300"><span className="text-blue-400 font-medium">Tactical Advice:</span> Track runs tightly, double up if isolated.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center flex-shrink-0 self-end sm:self-start">
                                <span className="font-bold text-orange-400 text-lg">8.2</span>
                            </div>
                        </div>
                    </div>

                    {/* Opposing Player 3 */}
                    <div className="p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-pointer border-b border-[#242e3a] border-opacity-50 last:border-0 relative">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-blue-100 font-bold text-lg mt-1">
                                    AP
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">Anton Petrov</h3>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">ST</span>
                                    </div>
                                    <div className="text-[#8495a7] text-xs flex items-center gap-3 mb-3">
                                        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> 17 goals</span>
                                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> 4 assists</span>
                                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Speed: 83</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="text-[#a4b4c4]"><span className="text-[#8495a7] font-medium">Strengths:</span> deadly shooter, strong overall performance</div>
                                        <div className="text-blue-300"><span className="text-blue-400 font-medium">Tactical Advice:</span> Mark closely in the box, don't allow turns.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center flex-shrink-0 self-end sm:self-start">
                                <span className="font-bold text-yellow-500 text-lg">8.7</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Team Improvement Recommendations Section */}
            <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-bold text-white">Team Improvement Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1 */}
                    <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <h3 className="font-bold text-white">Improve Defensive Transitions</h3>
                        </div>
                        <p className="text-[#8495a7] text-sm leading-relaxed">
                            The backline is slow to recover after losing possession. Implement structured pressing to recover shape faster, especially in the second half.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <Target className="w-5 h-5 text-pink-500" />
                            <h3 className="font-bold text-white">Increase Shot Conversion Rate</h3>
                        </div>
                        <p className="text-[#8495a7] text-sm leading-relaxed">
                            14 shots, only 3 goals. Work on clinical finishing drills and shooting under pressure. Utilize the flanks more effectively for crosses.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold text-white">Better Ball Circulation</h3>
                        </div>
                        <p className="text-[#8495a7] text-sm leading-relaxed">
                            Too many long balls lost in midfield. Encourage short-passing triangles in the buildup phase to maintain possession and create better openings.
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-[#0b1016] border border-[#242e3a] rounded-2xl p-6 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <Flag className="w-5 h-5 text-white" />
                            <h3 className="font-bold text-white">Set-Piece Strategy</h3>
                        </div>
                        <p className="text-[#8495a7] text-sm leading-relaxed">
                            Capitalize on corner and free-kick situations more. Develop rehearsed routines based on opposition defensive weaknesses identified in this analysis.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Recommendations;

