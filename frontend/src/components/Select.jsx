// Shared styled <select> used for every dropdown in the app.
// Removes the browser's default arrow (appearance-none) and draws a custom
// chevron as a background image with comfortable spacing from the right edge,
// with enough padding-right (pr-10) that option text never runs under it.
// Pass height (and any layout classes) via `className` to match each usage;
// border / rounded corners / font are kept here so the design is unchanged.

// Down chevron, stroke #6b7280 (gray-500). Single-quoted attrs so it embeds
// cleanly in a data URI.
const CHEVRON =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%236b7280'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E"

export default function Select({ className = '', style, children, ...props }) {
  return (
    <select
      {...props}
      className={`appearance-none cursor-pointer rounded-lg border border-gray-300 bg-white bg-no-repeat pl-2.5 pr-10 text-sm text-gray-900 outline-none focus:border-forest-600 ${className}`}
      style={{
        backgroundImage: `url("${CHEVRON}")`,
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1rem',
        ...style,
      }}
    >
      {children}
    </select>
  )
}
