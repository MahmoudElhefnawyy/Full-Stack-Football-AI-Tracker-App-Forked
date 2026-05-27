interface StatCardProps {
    value: string;
    label: string;
    suffix?: string;
    glowing?: boolean;
    className?: string;
}

/**
 * StatCard — Glowing stat number with Fira Code mono + small muted label
 */
const StatCard = ({ value, label, suffix = '', glowing = true, className = '' }: StatCardProps) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <span
            className={`font-mono font-bold text-primary text-2xl md:text-3xl tracking-tight leading-none ${glowing ? 'text-glow' : ''}`}
        >
            {value}{suffix}
        </span>
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            {label}
        </span>
    </div>
);

export default StatCard;
