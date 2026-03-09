import React from 'react';
import { Github, Linkedin } from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="relative min-h-screen pt-32 pb-20 overflow-hidden">
            {/* Dark green glow background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">

                <div className="text-center mb-16">
                    <span className="text-primary text-xs font-bold tracking-wider uppercase mb-3 inline-block">Graduation Project 2025</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Meet the GoalSense Team</h1>
                    <p className="text-[#8495a7] text-lg max-w-2xl mx-auto leading-relaxed">
                        Five passionate engineers who combined artificial intelligence, computer vision, and modern web development to bring professional football analytics to everyone.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                    <div className="bg-[#0f151c]/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 text-center shadow-[0_0_15px_rgba(0,230,118,0.05)]">
                        <div className="text-4xl font-black text-primary mb-2">15</div>
                        <div className="text-sm font-bold text-white">Pages Built</div>
                        <div className="text-xs text-[#8495a7] mt-1">Fully designed & functional</div>
                    </div>
                    <div className="bg-[#0f151c]/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 text-center shadow-[0_0_15px_rgba(0,230,118,0.05)]">
                        <div className="text-4xl font-black text-primary mb-2">5</div>
                        <div className="text-sm font-bold text-white">Team Members</div>
                        <div className="text-xs text-[#8495a7] mt-1">Diverse skills & expertise</div>
                    </div>
                    <div className="bg-[#0f151c]/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 text-center shadow-[0_0_15px_rgba(0,230,118,0.05)]">
                        <div className="text-4xl font-black text-primary mb-2">6</div>
                        <div className="text-sm font-bold text-white">Months</div>
                        <div className="text-xs text-[#8495a7] mt-1">Development & research</div>
                    </div>
                </div>

                {/* About Project */}
                <div className="mb-16">
                    <h2 className="text-xl font-bold text-white mb-6">About the Project</h2>
                    <div className="bg-[#0f151c]/90 backdrop-blur-sm border border-white/5 rounded-2xl p-8 space-y-4 text-sm text-[#8495a7] leading-relaxed">
                        <p>
                            <span className="text-primary font-semibold">GoalSense</span> is a graduation project developed at our university's Computer Science and Engineering department. The project addresses a real-world problem: making professional-level football analytics accessible to coaches, analysts, and clubs who lack the budget for expensive commercial solutions.
                        </p>
                        <p>
                            Using state-of-the-art computer vision techniques — including YOLO object detection, DeepSORT tracking, and transformer-based pose estimation — our system can automatically analyze match footage to extract player trajectories, ball possession, tactical formations, and individual performance metrics.
                        </p>
                        <p>
                            The frontend platform you're using was built with <span className="text-white font-medium">React</span> and <span className="text-white font-medium">TypeScript</span>, featuring an intuitive interface designed around the needs of coaches and analysts. Every feature was validated through user testing sessions with real football coaches and sports science students.
                        </p>
                    </div>
                </div>

                {/* Our Team */}
                <div className="mb-16">
                    <h2 className="text-xl font-bold text-white mb-6">Our Team</h2>
                    <div className="space-y-4">
                        {teamMembers.map((member, idx) => (
                            <div key={idx} className="bg-[#0f151c]/90 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start hover:border-primary/30 transition-colors">
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/30 shadow-[0_0_15px_rgba(0,230,118,0.2)]">
                                        {member.initials}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-[#0f151c] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0f151c]">
                                        {idx + 1}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{member.name}</h3>
                                            <div className="text-primary text-xs font-semibold">{member.role}</div>
                                        </div>
                                        <div className="flex gap-3 text-[#5e6b7e]">
                                            <a href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
                                            <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-4 h-4" /></a>
                                        </div>
                                    </div>
                                    <p className="text-[#8495a7] text-xs leading-relaxed mt-3 mb-4">
                                        {member.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {member.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] font-medium bg-[#0a0f16] border border-white/5 text-[#8495a7] px-2 py-1 rounded flex items-center gap-1.5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Special Thank You */}
                <div className="bg-gradient-to-b from-[#0a0f16] to-[#0f151c] rounded-3xl p-10 text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-yellow-500/10 blur-[50px] pointer-events-none" />
                    <div className="text-yellow-500 mb-4 inline-block">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4">A Special Thank You</h2>
                    <p className="text-[#8495a7] text-sm max-w-xl mx-auto leading-relaxed mb-8">
                        We would like to express our deepest gratitude to our project supervisor, the faculty of Computer Science and Engineering, and the football coaches who provided invaluable feedback during our testing phases. This project would not have been possible without your support.
                    </p>
                    <div className="flex justify-center gap-6 text-[#5e6b7e]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500/70"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    </div>
                </div>

            </div>
        </div>
    );
};

const teamMembers = [
    {
        initials: "SR",
        name: "Sarah Al-Rashid",
        role: "Project Lead & Full-Stack Developer",
        desc: "Led the overall project architecture, developed the core backend APIs, and coordinated the team's workflow. Responsible for the authentication system and database design.",
        tags: ["React", "Node.js", "PostgreSQL", "System Design"]
    },
    {
        initials: "OK",
        name: "Omar Khalil",
        role: "Computer Vision Engineer",
        desc: "Developed the core AI/ML pipeline for player tracking and ball detection using deep learning models. Implemented the video analysis algorithms powering GoalSense.",
        tags: ["Python", "OpenCV", "TensorFlow", "YOLO"]
    },
    {
        initials: "LH",
        name: "Layla Hassan",
        role: "UI/UX Designer & Frontend Developer",
        desc: "Designed the complete UI/UX system including wireframes, prototypes, and the final visual identity. Built responsive frontend components and ensured accessibility standards.",
        tags: ["Figma", "React", "Tailwind CSS", "Accessibility"]
    },
    {
        initials: "KM",
        name: "Khalid Mansour",
        role: "Data Scientist & Analytics Engineer",
        desc: "Built the statistical analysis modules, heatmap generation, and performance metrics engine. Created the comparison and recommendation algorithms based on match data.",
        tags: ["Python", "Pandas", "Scikit-Learn", "D3.js"]
    },
    {
        initials: "NZ",
        name: "Nour Zayed",
        role: "Backend Developer & DevOps",
        desc: "Developed the video processing pipeline, managed cloud infrastructure, and implemented CI/CD workflows. Responsible for API integration and system performance optimization.",
        tags: ["Docker", "AWS", "FastAPI", "Redis"]
    }
];

export default About;
