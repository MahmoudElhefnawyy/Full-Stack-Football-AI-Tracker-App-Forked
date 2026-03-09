import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

/**
 * A wrapper component that applies a smooth fade-in and slide-up animation
 * to its children. Ideal for page-level transitions.
 */
const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] // Premium cubic-bezier easing
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
