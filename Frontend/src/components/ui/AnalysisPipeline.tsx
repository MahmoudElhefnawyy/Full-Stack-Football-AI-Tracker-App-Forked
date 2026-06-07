import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Pipeline step definitions ────────────────────────────────── */
interface PipelineStep {
    label: string;
    estimatedMs: number;  // estimated duration per step
}

const STEPS: PipelineStep[] = [
    { label: 'Upload complete',      estimatedMs: 0 },      // instant (already done)
    { label: 'Player detection',     estimatedMs: 55000 },
    { label: 'Movement tracking',    estimatedMs: 30000 },
    { label: 'Possession analysis',  estimatedMs: 20000 },
    { label: 'Computing statistics', estimatedMs: 15000 },
    { label: 'Analysis complete',    estimatedMs: 0 },
];

type StepStatus = 'pending' | 'active' | 'done';

interface Props {
    /** True once the actual backend poll confirms success */
    isComplete: boolean;
    /** True if the backend poll confirms failure */
    isFailed: boolean;
    /** Error message on failure */
    errorMessage?: string;
    /** Match info */
    matchTitle?: string;
    /** File size display */
    fileSize?: string;
}

export default function AnalysisPipeline({
    isComplete,
    isFailed,
    errorMessage,
    matchTitle,
    fileSize,
}: Props) {
    const [activeStep, setActiveStep] = useState(0);
    const [stepTimers, setStepTimers] = useState<(number | null)[]>(STEPS.map(() => null));
    const startTimeRef = useRef(Date.now());
    const stepStartRef = useRef(Date.now());

    /* ── Advance through steps on timers ───────────────────────── */
    useEffect(() => {
        if (isComplete) {
            // Jump to final step
            setActiveStep(STEPS.length - 1);
            setStepTimers(prev => {
                const next = [...prev];
                for (let i = 0; i < STEPS.length; i++) {
                    if (next[i] === null) next[i] = STEPS[i].estimatedMs / 1000;
                }
                return next;
            });
            return;
        }
        if (isFailed) return;

        // Step 0 (upload) completes instantly
        if (activeStep === 0) {
            setStepTimers(prev => {
                const next = [...prev];
                next[0] = 0;
                return next;
            });
            const timer = setTimeout(() => {
                stepStartRef.current = Date.now();
                setActiveStep(1);
            }, 600);
            return () => clearTimeout(timer);
        }

        // Don't auto-advance past second-to-last step
        if (activeStep >= STEPS.length - 1) return;

        const step = STEPS[activeStep];
        const timer = setTimeout(() => {
            // Record how long this step "took"
            const elapsed = (Date.now() - stepStartRef.current) / 1000;
            setStepTimers(prev => {
                const next = [...prev];
                next[activeStep] = Math.round(elapsed * 10) / 10;
                return next;
            });
            stepStartRef.current = Date.now();
            setActiveStep(prev => prev + 1);
        }, step.estimatedMs);

        return () => clearTimeout(timer);
    }, [activeStep, isComplete, isFailed]);

    /* ── Step status helper ────────────────────────────────────── */
    const getStatus = (idx: number): StepStatus => {
        if (isComplete) return 'done';
        if (idx < activeStep) return 'done';
        if (idx === activeStep) return 'active';
        return 'pending';
    };

    /* ── Overall progress ──────────────────────────────────────── */
    const progress = isComplete ? 100 : Math.round((activeStep / (STEPS.length - 1)) * 100);

    /* ── Elapsed timer ─────────────────────────────────────────── */
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (isComplete || isFailed) return;
        const i = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
        return () => clearInterval(i);
    }, [isComplete, isFailed]);

    const fmtTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
        >
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    {matchTitle && (
                        <p className="text-foreground font-display font-bold text-sm">
                            {matchTitle}
                        </p>
                    )}
                    <p className="font-mono text-[10px] text-muted uppercase tracking-widest mt-1">
                        {fileSize && <span>{fileSize} · </span>}
                        {isComplete ? 'Complete' : isFailed ? 'Failed' : 'Processing'}
                    </p>
                </div>
                <span className="font-mono text-xs text-muted tabular-nums">
                    {fmtTime(elapsed)}
                </span>
            </div>

            {/* ── Steps ───────────────────────────────────── */}
            <div className="relative pl-4 space-y-0">
                {STEPS.map((step, idx) => {
                    const status = getStatus(idx);
                    return (
                        <div key={step.label} className="relative">
                            {/* Connector line */}
                            {idx < STEPS.length - 1 && (
                                <div
                                    className="absolute left-[3px] top-[18px] w-px h-[36px] transition-colors duration-500"
                                    style={{
                                        backgroundColor: status === 'done'
                                            ? 'var(--primary)'
                                            : 'var(--border)',
                                    }}
                                />
                            )}

                            {/* Step row */}
                            <motion.div
                                initial={false}
                                animate={{
                                    opacity: status === 'pending' ? 0.35 : 1,
                                }}
                                transition={{ duration: 0.4 }}
                                className="flex items-center gap-4 h-[54px]"
                            >
                                {/* Status dot */}
                                <div className="relative flex-shrink-0 w-[7px] h-[7px]">
                                    {status === 'done' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                            className="absolute inset-0 rounded-full"
                                            style={{ backgroundColor: 'var(--primary)' }}
                                        />
                                    )}
                                    {status === 'active' && (
                                        <>
                                            <div
                                                className="absolute inset-0 rounded-full"
                                                style={{ backgroundColor: 'var(--primary)' }}
                                            />
                                            <motion.div
                                                initial={{ scale: 1, opacity: 0.6 }}
                                                animate={{ scale: 2.8, opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                                                className="absolute inset-0 rounded-full"
                                                style={{ backgroundColor: 'var(--primary)' }}
                                            />
                                        </>
                                    )}
                                    {status === 'pending' && (
                                        <div
                                            className="absolute inset-0 rounded-full border"
                                            style={{ borderColor: 'var(--border)' }}
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className="text-sm font-medium flex-1 transition-colors duration-300"
                                    style={{
                                        color: status === 'active'
                                            ? 'var(--foreground)'
                                            : status === 'done'
                                                ? 'var(--foreground)'
                                                : 'var(--muted)',
                                    }}
                                >
                                    {step.label}
                                </span>

                                {/* Duration badge */}
                                <AnimatePresence>
                                    {status === 'done' && stepTimers[idx] !== null && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="font-mono text-[10px] text-muted tabular-nums"
                                        >
                                            {stepTimers[idx]! < 1 ? '<1s' : `${Math.round(stepTimers[idx]!)}s`}
                                        </motion.span>
                                    )}
                                    {status === 'active' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-1.5"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                                className="w-3 h-3 rounded-full border border-transparent"
                                                style={{
                                                    borderTopColor: 'var(--primary)',
                                                    borderRightColor: 'var(--primary)',
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* ── Error state ─────────────────────────────── */}
            <AnimatePresence>
                {isFailed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5"
                    >
                        <p className="text-red-400 text-sm font-medium">Analysis failed</p>
                        {errorMessage && (
                            <p className="text-red-400/70 text-xs mt-1 font-mono">{errorMessage}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Bottom progress bar ─────────────────────── */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                        Progress
                    </span>
                    <span className="font-mono text-[10px] text-muted tabular-nums">
                        {progress}%
                    </span>
                </div>
                <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{
                            background: isComplete
                                ? 'var(--primary)'
                                : 'linear-gradient(90deg, var(--primary), var(--primary-dark))',
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
