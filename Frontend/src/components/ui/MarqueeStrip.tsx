interface MarqueeStripProps {
    items: string[];
    speed?: number;  // seconds for one full loop
    className?: string;
}

/**
 * MarqueeStrip — infinite CSS scroll ticker (same pattern as portfolio's marquee.svelte)
 * Duplicates items for seamless loop.
 */
const MarqueeStrip = ({ items, speed = 30, className = '' }: MarqueeStripProps) => {
    const allItems = [...items, ...items]; // duplicate for seamless loop

    return (
        <div className={`overflow-hidden border-y border-border py-4 ${className}`}>
            <div
                className="flex gap-12 whitespace-nowrap will-change-transform"
                style={{ animation: `marquee ${speed}s linear infinite` }}
            >
                {allItems.map((item, i) => (
                    <span key={i} className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-muted shrink-0">
                        <span className="h-1 w-1 rounded-full bg-primary inline-block" />
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default MarqueeStrip;
