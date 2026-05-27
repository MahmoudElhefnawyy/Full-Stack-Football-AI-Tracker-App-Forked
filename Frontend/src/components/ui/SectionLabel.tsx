interface SectionLabelProps {
    number: string;          // e.g. "01"
    path: string;            // e.g. "~/features"
    right?: string;          // optional right-side label
    className?: string;
}

/**
 * SectionLabel — Portfolio-style mono navigation label
 * 01 ── ~/section-name                       OPTIONAL RIGHT
 */
const SectionLabel = ({ number, path, right, className = '' }: SectionLabelProps) => (
    <div className={`flex items-center justify-between font-mono text-xs text-muted uppercase tracking-widest ${className}`}>
        <div className="flex items-center gap-3">
            <span className="text-primary">{number}</span>
            <span className="h-px w-8 bg-border" />
            <span>{path}</span>
        </div>
        {right && <span className="hidden sm:block tracking-widest">{right}</span>}
    </div>
);

export default SectionLabel;
