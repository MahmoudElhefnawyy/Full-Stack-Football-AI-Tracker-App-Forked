import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Film, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';
import AnalysisPipeline from '../components/ui/AnalysisPipeline';

const Upload = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState<'video' | 'data'>('video');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [uploadFailed, setUploadFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [homeTeam, setHomeTeam] = useState('');
    const [awayTeam, setAwayTeam] = useState('');
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
    };

    const handleRemove = () => {
        if (!isUploading) {
            setFile(null);
            setUploadComplete(false);
            setUploadFailed(false);
            setErrorMessage('');
        }
    };

    const handleUpload = useCallback(async () => {
        if (!file) return;
        setIsUploading(true);
        setUploadFailed(false);
        setErrorMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('home_team', homeTeam.trim() || 'Team A');
            formData.append('away_team', awayTeam.trim() || 'Team B');

            if (uploadMode === 'video') {
                const data = await api.upload.video(formData);
                const taskId = data.task_id;
                toast.success('Video uploaded — AI analysis started');

                // Poll for completion
                pollRef.current = setInterval(async () => {
                    try {
                        const task = await api.upload.getTaskStatus(taskId);
                        if (task.status === 'success') {
                            if (pollRef.current) clearInterval(pollRef.current);
                            setUploadComplete(true);
                            setIsUploading(false);
                            toast.success('Analysis complete!');
                            setTimeout(() => navigate(`/analysis/${taskId}`), 2000);
                        } else if (task.status === 'failed') {
                            if (pollRef.current) clearInterval(pollRef.current);
                            setUploadFailed(true);
                            setIsUploading(false);
                            setErrorMessage(task.error_message || 'Unknown error');
                            toast.error('Analysis failed');
                        }
                    } catch {
                        /* polling error — keep trying */
                    }
                }, 3000);
            } else {
                const data = await api.upload.matchJson(formData);
                setUploadComplete(true);
                setIsUploading(false);
                toast.success('Match data uploaded!');
                setTimeout(() => navigate(`/analysis/${data.match_id}`), 1500);
            }
        } catch {
            setIsUploading(false);
            setUploadFailed(true);
            setErrorMessage('Upload failed — check your connection');
        }
    }, [file, homeTeam, awayTeam, uploadMode, navigate]);

    // Cleanup poll on unmount
    React.useEffect(() => () => {
        if (pollRef.current) clearInterval(pollRef.current);
    }, []);

    const inputClass = "w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors duration-200";

    const matchTitle = `${homeTeam.trim() || 'Team A'} vs ${awayTeam.trim() || 'Team B'}`;
    const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : undefined;
    const isProcessing = isUploading || uploadComplete || uploadFailed;

    return (
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-32">

            {/* Header */}
            <BlurIn className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <SectionLabel number="00" path="~/upload" className="mb-4" />
                    <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mt-4">
                        Upload <span className="text-primary">Match.</span>
                    </h1>
                    <p className="text-muted text-sm mt-2">Provide match footage or JSON data for AI analysis.</p>
                </div>

                {/* Mode toggle */}
                {!isProcessing && (
                    <GlassCard className="flex p-1 gap-1">
                        {(['video', 'data'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => { setUploadMode(mode); handleRemove(); }}
                                className={[
                                    'px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                                    uploadMode === mode ? 'bg-primary text-background' : 'text-muted hover:text-foreground',
                                ].join(' ')}
                            >
                                {mode === 'video' ? '▶ Video Analysis' : '{ } JSON Data'}
                            </button>
                        ))}
                    </GlassCard>
                )}
            </BlurIn>

            <AnimatePresence mode="wait">
                {isProcessing ? (
                    /* ── Pipeline Tracker ──────────────────────────── */
                    <motion.div
                        key="pipeline"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <GlassCard className="p-10">
                            <AnalysisPipeline
                                isComplete={uploadComplete}
                                isFailed={uploadFailed}
                                errorMessage={errorMessage}
                                matchTitle={matchTitle}
                                fileSize={fileSize}
                            />
                        </GlassCard>
                    </motion.div>
                ) : (
                    /* ── Upload Form ──────────────────────────────── */
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Drop zone */}
                        <BlurIn delay={0.1}>
                            <div className={[
                                'relative rounded-2xl border-2 border-dashed p-16 flex flex-col items-center justify-center text-center transition-all duration-300 mb-8',
                                file ? 'border-primary/50 bg-primary/3' : 'border-border hover:border-primary/30',
                            ].join(' ')}>
                                <input
                                    title="Select file"
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 z-10"
                                    accept={uploadMode === 'video' ? 'video/*' : '.json,application/json'}
                                    onChange={handleFileChange}
                                    disabled={file !== null}
                                    style={{ cursor: file ? 'default' : 'pointer' }}
                                />

                                <AnimatePresence mode="wait">
                                    {!file ? (
                                        <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center">
                                            <div className="h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
                                                <UploadIcon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-display font-bold text-foreground mb-2">
                                                Drop your {uploadMode === 'video' ? 'video' : 'JSON'} here
                                            </h3>
                                            <p className="text-muted text-sm mb-4">or click to browse files</p>
                                            <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                                                {uploadMode === 'video' ? 'MP4, AVI, MOV, MKV, WEBM · Max 2GB' : 'JSON · Match Schema v1'}
                                            </span>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="selected" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center relative z-20">
                                            <Film className="h-10 w-10 text-primary mb-3" />
                                            <h3 className="font-display font-bold text-foreground mb-1 max-w-xs truncate">{file.name}</h3>
                                            <p className="font-mono text-xs text-muted mb-4">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                            <button onClick={handleRemove} className="flex items-center gap-1.5 font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">
                                                <X className="h-3 w-3" /> Remove
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </BlurIn>

                        {/* Match details */}
                        <BlurIn delay={0.2}>
                            <GlassCard className="p-8 mb-8">
                                <SectionLabel number="01" path="~/match-details" className="mb-6" />
                                <div className="flex flex-col gap-5 mt-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Match Title</label>
                                        <input type="text" placeholder="e.g. FC Green Eagles vs Black Panthers — League Match" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="home-team-input" className="font-mono text-[10px] uppercase tracking-widest text-muted">Home Team</label>
                                            <input id="home-team-input" type="text" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} placeholder="FC Green Eagles" className={inputClass} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="away-team-input" className="font-mono text-[10px] uppercase tracking-widest text-muted">Away Team</label>
                                            <input id="away-team-input" type="text" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} placeholder="Black Panthers FC" className={inputClass} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Notes (optional)</label>
                                        <textarea rows={3} placeholder="Any additional notes about this match…" className={`${inputClass} resize-none`} />
                                    </div>
                                </div>
                            </GlassCard>
                        </BlurIn>

                        {/* Submit button */}
                        <BlurIn delay={0.3}>
                            <motion.button
                                whileHover={file ? { scale: 1.02 } : {}}
                                whileTap={file ? { scale: 0.98 } : {}}
                                onClick={handleUpload}
                                disabled={!file}
                                className={[
                                    'w-full flex items-center justify-center gap-2 font-bold text-sm h-14 rounded-2xl transition-all duration-200',
                                    file ? 'bg-primary text-background hover:bg-primary-dark shadow-[0_0_30px_rgba(0,230,118,0.2)]' : 'bg-surface border border-border text-muted cursor-not-allowed',
                                ].join(' ')}
                            >
                                <UploadIcon className="h-4 w-4" /> Upload & Analyze
                            </motion.button>
                        </BlurIn>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Upload;
