export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦', to: '/dashboard' },
  { key: 'map', label: 'Pipeline Map', icon: '◈', to: '/map' },
  { key: 'segments', label: 'Segments', icon: '≡', to: '/segments' },
  { key: 'incidents', label: 'Incidents', icon: '△', to: '/incidents', badge: '4' },
  { key: 'alerts', label: 'Alerts', icon: '◉', to: '/alerts', badge: '6' },
  { key: 'reports', label: 'Reports', icon: '▤', to: '/reports' },
  { key: 'settings', label: 'Settings', icon: '⚙', to: '/settings' },
]

export const TAB_ITEMS = [
  { key: 'dashboard', label: 'Home', icon: '▦', to: '/dashboard' },
  { key: 'map', label: 'Map', icon: '◈', to: '/map' },
  { key: 'segments', label: 'Segments', icon: '≡', to: '/segments' },
  { key: 'alerts', label: 'Alerts', icon: '◉', to: '/alerts' },
  { key: 'incidents', label: 'Incidents', icon: '△', to: '/incidents' },
]

export function activeKeyForPath(pathname) {
  if (pathname.startsWith('/segments')) return 'segments'
  const seg = pathname.split('/')[1]
  return seg || 'dashboard'
}
