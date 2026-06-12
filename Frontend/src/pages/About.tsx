import { Github, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import StatCard from '../components/ui/StatCard';
import MarqueeStrip from '../components/ui/MarqueeStrip';

const teamMembers = [
    { initials: 'FM', name: 'Fatema Mostafa', role: 'Machine Learning Engineer', desc: 'Led the overall project architecture, developed the core backend APIs, and coordinated the team\'s workflow. Responsible for the authentication system and database design.', tags: ['React', 'Node.js', 'PostgreSQL', 'System Design'] },
    { initials: 'MM', name: 'Mahmoud Mohamed', role: 'AI Intgeration Developer', desc: 'Developed the core AI/ML pipeline for player tracking and ball detection using deep learning models. Implemented the video analysis algorithms powering MatchIQ.', tags: ['Python', 'OpenCV', 'TensorFlow', 'YOLO'] },
    { initials: 'MA', name: 'Mohamed Ahmed', role: 'AI Developer & Team Lead', desc: 'Build the AI Model Trackings and Detection prototypes, and the final visual identity. Built responsive frontend components and ensured accessibility standards.', tags: ['Figma', 'React', 'Tailwind CSS', 'Accessibility'] },
    { initials: 'MW', name: 'Mohamed Waheed', role: 'UI/UX Developer', desc: 'Built the UI/UX For statistical analysis modules, heatmap generation, and performance metrics engine. Created the comparison and recommendation algorithms based on match data.', tags: ['Python', 'Pandas', 'Scikit-Learn', 'D3.js'] },
    { initials: 'MM', name: 'Mohamed Mahmoud', role: 'AI Enigineer', desc: 'Developed the video processing pipeline, managed cloud infrastructure, and implemented CI/CD workflows. Responsible for API integration and system performance optimization.', tags: ['Docker', 'Railway', 'FastAPI', 'Redis'] },
];

const cardVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    visible: (i: number) => ({
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] as any },
    }),
} as any;

const About = () => {
    return (
        <div className="relative min-h-screen pt-32 pb-24 overflow-hidden bg-background">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/4 blur-[130px]" />
                <div className="dot-grid absolute inset-0" />
            </div>
            <span aria-hidden className="corner-marker top-24 left-6 z-10">+</span>
            <span aria-hidden className="corner-marker top-24 right-6 z-10">+</span>

            <div className="container mx-auto px-6 max-w-5xl relative z-10">

                {/* Header */}
                <BlurIn className="text-center mb-20">
                    <SectionLabel number="01" path="~/about" className="justify-center mb-6" />
                    <div className="status-badge w-fit mx-auto mt-6 mb-8">
                        <span className="status-dot" />
                        <span className="font-mono text-xs text-muted uppercase tracking-widest">Graduation Project 2025</span>
                    </div>
                    <h1 className="font-display font-black text-4xl md:text-6xl text-foreground tracking-tight">
                        Meet the <span className="text-primary">Team.</span>
                    </h1>
                    <p className="text-muted text-base md:text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
                        Five engineers who combined computer vision, AI, and modern web development to bring professional football analytics to everyone.
                    </p>
                </BlurIn>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-20">
                    {[
                        { value: '15', label: 'Pages Built', sub: 'Fully designed & functional' },
                        { value: '5', label: 'Team Members', sub: 'Diverse skills & expertise' },
                        { value: '6', label: 'Months', sub: 'Development & research' },
                    ].map((s, i) => (
                        <motion.div
                            key={i} custom={i} variants={cardVariants}
                            initial="hidden" whileInView="visible" viewport={{ once: true }}
                        >
                            <GlassCard className="p-6 text-center border-primary/20">
                                <StatCard value={s.value} label={s.label} className="items-center" />
                                <p className="font-mono text-[10px] text-muted mt-2">{s.sub}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* About Project */}
                <BlurIn className="mb-20">
                    <SectionLabel number="02" path="~/project" className="mb-6" />
                    <GlassCard className="p-8 md:p-10 mt-6 space-y-4 text-sm text-muted leading-relaxed">
                        <p><span className="text-primary font-semibold">MatchIQ</span> is a graduation project developed at our university's Computer Science and Engineering department. The project addresses a real-world problem: making professional-level football analytics accessible to coaches, analysts, and clubs.</p>
                        <p>Using state-of-the-art computer vision — including <span className="text-foreground font-medium">YOLO v8</span> object detection, <span className="text-foreground font-medium">StrongSORT</span> tracking, and transformer-based pose estimation — our system automatically analyzes match footage to extract player trajectories, ball possession, tactical formations, and individual performance metrics.</p>
                        <p>The frontend was built with <span className="text-foreground font-medium">React</span> and <span className="text-foreground font-medium">TypeScript</span>, featuring an intuitive interface validated through user testing sessions with real football coaches and sports science students.</p>
                    </GlassCard>
                </BlurIn>

                {/* Tech stack marquee */}
                <MarqueeStrip
                    items={['YOLOv8', 'StrongSORT', 'FastAPI', 'Celery', 'Redis', 'PostgreSQL', 'React', 'Three.js', 'Railway', 'Python']}
                    className="mb-20 rounded-2xl overflow-hidden"
                />

                {/* Team */}
                <div className="mb-20">
                    <BlurIn>
                        <SectionLabel number="03" path="~/team" className="mb-6" />
                    </BlurIn>
                    <div className="flex flex-col gap-4 mt-6">
                        {teamMembers.map((member, idx) => (
                            <motion.div
                                key={idx} custom={idx} variants={cardVariants}
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                            >
                                <GlassCard hoverable className="p-6 flex flex-col md:flex-row gap-6 items-start group">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center font-mono font-bold text-lg text-primary">
                                            {member.initials}
                                        </div>
                                        <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-background text-[9px] font-black flex items-center justify-center border-2 border-background">
                                            {idx + 1}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <div>
                                                <h3 className="font-display font-bold text-base text-foreground">{member.name}</h3>
                                                <p className="text-primary font-mono text-xs mt-0.5">{member.role}</p>
                                            </div>
                                            <div className="flex gap-3 text-muted shrink-0">
                                                <a href="#" className="hover:text-foreground transition-colors duration-200"><Github className="h-4 w-4" /></a>
                                                <a href="#" className="hover:text-primary transition-colors duration-200"><Linkedin className="h-4 w-4" /></a>
                                            </div>
                                        </div>
                                        <p className="text-muted text-xs leading-relaxed mt-3 mb-4">{member.desc}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {member.tags.map((tag, i) => (
                                                <span key={i} className="font-mono text-[10px] text-muted border border-border px-2 py-0.5 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Thank You */}
                <BlurIn>
                    <GlassCard className="p-10 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
                        <SectionLabel number="04" path="~/acknowledgements" className="justify-center mb-8" />
                        <h2 className="font-display font-black text-2xl md:text-3xl text-foreground mb-4 mt-4">
                            A Special <span className="text-primary">Thank You.</span>
                        </h2>
                        <p className="text-muted text-sm max-w-xl mx-auto leading-relaxed">
                            We express our deepest gratitude to our project supervisor, the faculty of Computer Science and Engineering, and the football coaches who provided invaluable feedback during testing. This project would not have been possible without your support.
                        </p>
                    </GlassCard>
                </BlurIn>
            </div>
        </div>
    );
};

export default About;
