import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'

// Counts from the previous value to the new one over `duration` ms. Used in
// stat cards so changing data feels alive rather than blinking into place.
export function AnimatedNumber({
  value,
  duration = 600,
  format,
}: {
  value: number
  duration?: number
  format?: (n: number) => string
}) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    if (prev.current === value) return
    const controls = animate(prev.current, value, {
      duration: duration / 1000,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (n) => setDisplay(Math.round(n)),
    })
    prev.current = value
    return () => controls.stop()
  }, [value, duration])

  return (
    <span className="tabular-nums">
      {format ? format(display) : display.toLocaleString()}
    </span>
  )
}
