import type { Variants } from 'framer-motion';

/**
 * Standard staggered container animation
 */
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

/**
 * Slide and fade up animation for children
 */
export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

/**
 * Fade in animation
 */
export const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
        },
    },
};

/**
 * Scale up animation (good for buttons/cards)
 */
export const scaleUpVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

/**
 * Hover scale effect
 */
export const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.2 },
};

/**
 * Button tap effect
 */
export const tapScale = {
    scale: 0.98,
};
