import * as motion from 'motion/react-client'
import { Children, type ReactNode } from 'react'

// Wraps a list/grid of children and reveals them with a staggered fade-in.
// Default delay 50ms per child gives the "card flock" effect that Linear and
// Vercel use on dashboards.
export function StaggerGrid({
  children,
  className,
  staggerMs = 50,
}: {
  children: ReactNode
  className?: string
  staggerMs?: number
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, idx) => (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.28,
            delay: (idx * staggerMs) / 1000,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
