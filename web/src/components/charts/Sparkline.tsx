import { useId } from 'react'

// Tiny inline SVG sparkline — no dependency. Renders a smoothed area + line
// for a numeric series. Perfect for stat-card mini-trends.
type Props = {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  className?: string
}

export function Sparkline({
  data,
  width = 100,
  height = 32,
  stroke = '#22d3ee',
  fill = 'url(#sparkfill)',
  className,
}: Props) {
  const reactId = useId()
  if (data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const stepX = data.length > 1 ? width / (data.length - 1) : 0

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return [x, y] as const
  })

  // Smooth catmull-rom-ish path via simple bezier with neighbor tangents.
  let path = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1]
    const [x2, y2] = points[i]
    const cpx = (x1 + x2) / 2
    path += ` Q ${cpx} ${y1} ${x2} ${y2}`
  }
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`
  const gradId = `sparkfill-${reactId.replace(/:/g, '')}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={fill === 'url(#sparkfill)' ? `url(#${gradId})` : fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
