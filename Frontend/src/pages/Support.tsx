import { useState } from 'react';
import { Search, ChevronDown, Video, Lock, Activity, Mail, BookOpen, MessageSquare, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';

const faqCategories = [
    {
        label: 'Getting Started', icon: BookOpen, items: [
            { q: 'How do I create an account?', a: 'Click the Register button in the top right corner. Provide a username, valid email address, and a password of at least 6 characters.' },
            { q: 'What video formats are supported?', a: 'We support standard MP4, AVI, and MOV files up to 2GB per upload.' },
            { q: 'How long does analysis take?', a: 'A typical 10-minute highlight clip takes about 15-20 minutes to fully process depending on server load.' },
        ]
    },
    {
        label: 'Analysis Features', icon: Activity, items: [
            { q: 'What does the analysis include?', a: 'Our system automatically detects and tracks all players and the ball, generates heatmaps, calculates possession statistics, and provides tactical recommendations.' },
            { q: 'How accurate is the player tracking?', a: 'Our AI models achieve 95%+ accuracy in identifying players and tracking their movements across the pitch.' },
            { q: 'Can I analyze videos from any camera angle?', a: 'Best results come from a wide tactical broadcast or drone angle. Highly unstable footage may reduce tracking accuracy.' },
        ]
    },
    {
        label: 'Account & Data', icon: Lock, items: [
            { q: 'How do I delete an uploaded video?', a: 'Go to your Dashboard, locate the recording, and click the delete icon next to its name.' },
            { q: 'Is my data private?', a: 'All uploaded videos and generated analytics remain private to your account unless you explicitly choose to share them.' },
            { q: 'Can I export my analysis reports?', a: 'You can download pitch visualizations and heatmaps as PNG images. A full PDF export feature is coming soon.' },
            { q: 'What browsers are supported?', a: 'We support the latest versions of Chrome, Safari, Firefox, and Edge. Desktop recommended for uploads.' },
        ]
    },
];

const troubleItems = [
    { icon: Video, color: 'text-blue-400', title: 'Video not processing', steps: ['Check video format (MP4, AVI, MOV)', 'Ensure file size is under 2GB', 'Try re-uploading the video', 'Contact support if issue persists'] },
    { icon: Lock, color: 'text-yellow-400', title: "Can't log in", steps: ['Verify email and password spelling', 'Clear browser cache and cookies', 'Try password reset via email', 'Use demo@matchiq.ai if testing'] },
    { icon: Activity, color: 'text-primary', title: 'Analysis not loading', steps: ['Ensure status shows "Analyzed"', 'Refresh the page', 'Check internet connection', 'Try a different browser'] },
];

const FaqItem = ({ q, a, index }: { q: string; a: string; index: number }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            onClick={() => setOpen(!open)}
            className={`border rounded-xl cursor-pointer overflow-hidden transition-colors duration-200 ${open ? 'border-primary/30 bg-surface-2/50' : 'border-border hover:border-primary/20'}`}
        >
            <div className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-muted min-w-[2rem]">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-sm font-semibold text-foreground">{q}</span>
                </div>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-muted shrink-0"
                >
                    <ChevronDown className="h-4 w-4" />
                </motion.span>
            </div>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                        <div className="px-4 pb-4 pt-0 border-t border-border ml-[3.25rem]">
                            <p className="text-xs text-muted leading-relaxed mt-3">{a}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Support = () => {
    const [search, setSearch] = useState('');

    const filteredCategories = faqCategories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="relative min-h-screen pt-32 pb-24 overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/4 blur-[120px]" />
                <div className="dot-grid absolute inset-0" />
            </div>
            <span aria-hidden className="corner-marker top-24 left-6 z-10">+</span>
            <span aria-hidden className="corner-marker top-24 right-6 z-10">+</span>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">

                {/* Header */}
                <BlurIn className="text-center mb-12">
                    <SectionLabel number="01" path="~/help" className="justify-center mb-6" />
                    <h1 className="font-display font-black text-4xl md:text-5xl text-foreground mt-6">
                        Help & <span className="text-primary">Support.</span>
                    </h1>
                    <p className="text-muted text-sm mt-3">Find answers, troubleshooting tips, and contact our support team.</p>

                    {/* Search */}
                    <div className="relative max-w-lg mx-auto mt-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search FAQs…"
                            className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors duration-200"
                        />
                    </div>
                </BlurIn>

                {/* FAQs */}
                <div className="mb-16">
                    <BlurIn>
                        <SectionLabel number="02" path="~/faq" className="mb-6" />
                    </BlurIn>
                    <div className="space-y-10 mt-6">
                        {filteredCategories.map((cat, ci) => (
                            <BlurIn key={ci} delay={ci * 0.1}>
                                <div className="flex items-center gap-2 mb-4">
                                    <cat.icon className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest">{cat.label}</span>
                                </div>
                                <div className="space-y-2">
                                    {cat.items.map((item, ii) => (
                                        <FaqItem key={ii} q={item.q} a={item.a} index={ii} />
                                    ))}
                                </div>
                            </BlurIn>
                        ))}
                        {filteredCategories.length === 0 && (
                            <GlassCard className="p-12 text-center">
                                <p className="text-muted text-sm">No FAQs match your search. Try different keywords.</p>
                            </GlassCard>
                        )}
                    </div>
                </div>

                {/* Troubleshooting */}
                <div className="mb-16">
                    <BlurIn>
                        <SectionLabel number="03" path="~/troubleshooting" className="mb-6" />
                    </BlurIn>
                    <div className="flex items-center gap-2 mt-6 mb-4">
                        <Wrench className="h-4 w-4 text-primary" />
                        <span className="font-display font-bold text-lg text-foreground">Troubleshooting Guide</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {troubleItems.map((item, i) => (
                            <BlurIn key={i} delay={i * 0.1}>
                                <GlassCard hoverable className="p-6 h-full">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border mb-4">
                                        <item.icon className={`h-4 w-4 ${item.color}`} />
                                    </div>
                                    <h3 className="font-display font-bold text-sm text-foreground mb-3">{item.title}</h3>
                                    <ol className="space-y-2 list-decimal list-inside">
                                        {item.steps.map((s, si) => (
                                            <li key={si} className="font-mono text-[10px] text-muted leading-relaxed">{s}</li>
                                        ))}
                                    </ol>
                                </GlassCard>
                            </BlurIn>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <BlurIn>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <SectionLabel number="04" path="~/contact" />
                    </div>
                    <GlassCard className="overflow-hidden mt-6">
                        {/* Header bar */}
                        <div className="bg-surface-2 flex items-center justify-between px-6 py-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                                <span className="font-mono text-xs text-muted">support@matchiq.ai</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="font-mono text-[10px] text-muted">Avg response: 24h</span>
                            </div>
                        </div>

                        <form className="p-8 space-y-5" onSubmit={e => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {['Name', 'Email'].map(field => (
                                    <input
                                        key={field}
                                        type={field === 'Email' ? 'email' : 'text'}
                                        placeholder={field === 'Email' ? 'your@email.com' : 'Your name'}
                                        className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors duration-200"
                                    />
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Subject — what's your issue about?"
                                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors duration-200"
                            />
                            <textarea
                                rows={5}
                                placeholder="Describe your issue in detail…"
                                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors duration-200 resize-none"
                            />
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary h-12 w-full text-sm"
                            >
                                Send Message
                            </motion.button>
                        </form>
                    </GlassCard>
                </BlurIn>
            </div>
        </div>
    );
};

export default Support;
