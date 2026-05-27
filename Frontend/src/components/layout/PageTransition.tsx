import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const PageTransition = ({ children }: { children: ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        exit={{ opacity: 0, filter: 'blur(8px)', y: -12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

export default PageTransition;
