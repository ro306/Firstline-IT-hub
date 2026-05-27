import { useLocation } from 'react-router-dom'
import * as motion from 'motion/react-client'
import { AnimatePresence } from 'motion/react'
import { type ReactNode } from 'react'

// Subtle fade + 4px slide whenever the route changes. Re-keyed on pathname
// so AnimatePresence runs the exit + enter cycle on every navigation.
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
