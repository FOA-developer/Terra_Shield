import logoUrl from '../assets/logo.png'

export default function Logo({ variant = 'dark', size = 'md' }) {
  // variant "dark": wordmark for light backgrounds (dark text)
  // variant "light": wordmark for dark/green backgrounds (white text)
  const dims = size === 'lg'
    ? { mark: 56, text: 'text-2xl' }
    : size === 'sm'
      ? { mark: 44, text: 'text-lg' }
      : { mark: 50, text: 'text-xl' }

  const wordColor = variant === 'light' ? 'text-white' : 'text-gray-900'
  const accentColor = variant === 'light' ? 'text-forest-400' : 'text-forest-600'

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoUrl}
        alt="TerraShield"
        className="block object-contain"
        style={{ height: dims.mark, width: 'auto' }}
      />
      <div className={`${dims.text} font-bold tracking-tight ${wordColor}`}>
        TERRA<span className={accentColor}>SHIELD</span>
      </div>
    </div>
  )
}
