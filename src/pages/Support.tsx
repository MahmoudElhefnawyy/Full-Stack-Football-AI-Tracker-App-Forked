import React from 'react';
import { Search, ChevronDown, Video, Lock, Activity, Mail, BookOpen, MessageSquare, Wrench } from 'lucide-react';

const Support: React.FC = () => {
    return (
        <div className="relative min-h-screen pt-32 pb-20 overflow-hidden">
            {/* Dark green glow background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Help & Support</h1>
                    <p className="text-[#8495a7] text-sm">
                        Find answers, troubleshooting tips, and contact our support team.
                    </p>

                    <div className="max-w-xl mx-auto mt-8">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5e6b7e] group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search FAQs..."
                                className="w-full bg-[#0a0f16]/80 backdrop-blur-sm border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-[#5e6b7e] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="mb-16">
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-8">
                        {/* Getting Started */}
                        <div>
                            <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-3 px-2">Getting Started</h3>
                            <div className="space-y-2">
                                <FaqItem title="How do I create an account?">
                                    To create an account, click the Register button in the top right corner. You'll need to provide a username, valid email address, and password.
                                </FaqItem>
                                <FaqItem title="What video formats are supported?">
                                    We support standard MP4, AVI, and MOV files up to 2GB per upload.
                                </FaqItem>
                                <FaqItem title="How long does analysis take?">
                                    Analysis time depends on the video length and current server load. A typical 10-minute highlight clip takes about 15-20 minutes to fully process.
                                </FaqItem>
                            </div>
                        </div>

                        {/* Analysis Features */}
                        <div>
                            <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-3 px-2">Analysis Features</h3>
                            <div className="space-y-2">
                                <FaqItem title="What does the analysis include?">
                                    Our system automatically detects and tracks all players and the ball, generates heatmaps, calculates possession statistics, and provides tactical recommendations based on spatial analysis.
                                </FaqItem>
                                <FaqItem title="How accurate is the player tracking?">
                                    Our AI models are trained on professional datasets and typically achieve 95%+ accuracy in identifying players and tracking their movements across the pitch.
                                </FaqItem>
                                <FaqItem title="Can I analyze videos from any camera angle?">
                                    For best results, we recommend a wide tactical broadcast or drone angle. Close-up or highly unstable amateur footage might result in lower tracking accuracy.
                                </FaqItem>
                            </div>
                        </div>

                        {/* Account & Data */}
                        <div>
                            <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-3 px-2">Account & Data</h3>
                            <div className="space-y-2">
                                <FaqItem title="How do I delete an uploaded video?">
                                    Go to your Dashboard, click on 'Analysis', locate the video you want to remove, and click the delete icon next to its name.
                                </FaqItem>
                                <FaqItem title="Is my data private?">
                                    Yes, all uploaded videos and generated analytics remain private to your account unless you explicitly choose to share them.
                                </FaqItem>
                                <FaqItem title="Can I export my analysis reports?">
                                    Currently, you can download pitch visualizations and heatmaps as PNG images. A full PDF export feature is coming soon.
                                </FaqItem>
                                <FaqItem title="Why is my video taking long to process?">
                                    High server demand or extremely large video files can cause delays. If a video is stuck 'Processing' for over 2 hours, please contact support.
                                </FaqItem>
                                <FaqItem title="What browsers are supported?">
                                    We support the latest versions of Chrome, Safari, Firefox, and Edge.
                                </FaqItem>
                                <FaqItem title="Can I use GoalSense on mobile?">
                                    While the dashboard and analytics viewing are responsive, we highly recommend using a desktop browser for video uploading and detailed tactical analysis.
                                </FaqItem>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Troubleshooting Guide */}
                <div className="mb-16">
                    <div className="flex items-center gap-2 mb-6">
                        <Wrench className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-white">Troubleshooting Guide</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#0f151c]/90 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-primary/20 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-[#0a0f16] border border-white/5 flex items-center justify-center mb-4 text-[#5e6b7e]">
                                <Video className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-3">Video not processing</h3>
                            <ul className="text-xs text-[#8495a7] space-y-2.5 list-decimal pl-4">
                                <li className="pl-1">Check video format (MP4, AVI, MOV)</li>
                                <li className="pl-1">Ensure file size is under 2GB</li>
                                <li className="pl-1">Try re-uploading the video</li>
                                <li className="pl-1">Contact support if issue persists</li>
                            </ul>
                        </div>

                        <div className="bg-[#0f151c]/90 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-primary/20 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-[#0a0f16] border border-white/5 flex items-center justify-center mb-4 text-[#5e6b7e]">
                                <Lock className="w-5 h-5 text-yellow-500" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-3">Can't log in</h3>
                            <ul className="text-xs text-[#8495a7] space-y-2.5 list-decimal pl-4">
                                <li className="pl-1">Verify email and password spelling</li>
                                <li className="pl-1">Clear browser cache and cookies</li>
                                <li className="pl-1">Try password reset via email</li>
                                <li className="pl-1">Use demo account:<br /> <span className="text-primary font-medium">demo@goalsense.ai</span></li>
                            </ul>
                        </div>

                        <div className="bg-[#0f151c]/90 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-primary/20 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-[#0a0f16] border border-white/5 flex items-center justify-center mb-4 text-[#5e6b7e]">
                                <Activity className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-3">Analysis not loading</h3>
                            <ul className="text-xs text-[#8495a7] space-y-2.5 list-decimal pl-4">
                                <li className="pl-1">Ensure video status shows 'Analyzed'</li>
                                <li className="pl-1">Refresh the page</li>
                                <li className="pl-1">Check your internet connection</li>
                                <li className="pl-1">Try a different browser</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-white">Contact Support</h2>
                    </div>

                    <div className="bg-[#0f151c]/90 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-[#0a0f16] flex justify-between items-center p-4 border-b border-white/5">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#8495a7]">
                                <Mail className="w-4 h-4 text-primary" />
                                support@goalsense.ai
                            </div>
                            <div className="text-[10px] font-medium text-[#5e6b7e]">
                                Avg response: 24 hours
                            </div>
                        </div>
                        <div className="p-8">
                            <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-white/50 ml-1">Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            className="w-full bg-[#0a0f16] border border-white/5 rounded-xl py-3 px-4 text-xs text-white placeholder:text-[#5e6b7e] focus:border-primary/50 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-white/50 ml-1">Email</label>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            className="w-full bg-[#0a0f16] border border-white/5 rounded-xl py-3 px-4 text-xs text-white placeholder:text-[#5e6b7e] focus:border-primary/50 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-white/50 ml-1">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="What's your issue about?"
                                        className="w-full bg-[#0a0f16] border border-white/5 rounded-xl py-3 px-4 text-xs text-white placeholder:text-[#5e6b7e] focus:border-primary/50 focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-white/50 ml-1">Message</label>
                                    <textarea
                                        placeholder="Describe your issue in detail..."
                                        rows={5}
                                        className="w-full bg-[#0a0f16] border border-white/5 rounded-xl py-3 px-4 text-xs text-white placeholder:text-[#5e6b7e] focus:border-primary/50 focus:outline-none transition-all resize-none"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-primary hover:bg-[#00c968] text-[#0f151c] font-bold py-3.5 rounded-xl text-sm transition-colors mt-2">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const FaqItem: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    return (
        <details className="group bg-[#0f151c]/90 backdrop-blur-sm border border-white/5 rounded-xl transition-all open:border-primary/30">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-sm font-semibold text-white/90 group-open:text-primary">
                {title}
                <span className="transition-transform duration-300 group-open:rotate-180 text-[#5e6b7e] group-open:text-primary">
                    <ChevronDown className="w-4 h-4" />
                </span>
            </summary>
            <div className="px-4 pb-4 pt-1 text-xs text-[#8495a7] leading-relaxed">
                {children}
            </div>
        </details>
    );
};

export default Support;
