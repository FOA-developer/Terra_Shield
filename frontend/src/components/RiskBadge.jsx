import { riskColor, riskSoft } from '../lib/risk'

export default function RiskBadge({ level, children }) {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ background: riskSoft(level), color: riskColor(level) }}
    >
      {children ?? level}
    </span>
  )
}

export function RiskDot({ level, size = 9, className = '' }) {
  return (
    <span
      className={`inline-block flex-none rounded-full ${className}`}
      style={{ width: size, height: size, background: riskColor(level) }}
    />
  )
}
