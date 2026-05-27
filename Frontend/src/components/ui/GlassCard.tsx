import type { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    elevated?: boolean;
    hoverable?: boolean;
    className?: string;
    onClick?: () => void;
}

/**
 * GlassCard — backdrop-blur glass surface following the Portfolio's aesthetic
 */
const GlassCard = ({ children, elevated = false, hoverable = false, className = '', onClick }: GlassCardProps) => (
    <div
        onClick={onClick}
        className={[
            'rounded-2xl border border-border backdrop-blur-md transition-all duration-300',
            elevated ? 'bg-surface-2/80' : 'bg-surface/80',
            hoverable ? 'hover:border-primary/30 hover:shadow-[0_0_30px_rgba(0,230,118,0.08)] cursor-pointer' : '',
            className,
        ].join(' ')}
    >
        {children}
    </div>
);

export default GlassCard;
