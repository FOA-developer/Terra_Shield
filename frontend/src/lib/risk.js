export const RISK_COLOR = {
  High: '#dc2626',
  Medium: '#d97706',
  Low: '#16a34a',
}

export const RISK_SOFT = {
  High: '#fee2e2',
  Medium: '#fef3c7',
  Low: '#dcfce7',
}

export function riskColor(level) {
  return RISK_COLOR[level] || '#6b7280'
}

export function riskSoft(level) {
  return RISK_SOFT[level] || '#f3f4f6'
}
