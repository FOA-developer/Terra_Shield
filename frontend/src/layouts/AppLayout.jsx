import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { NAV_ITEMS, TAB_ITEMS, activeKeyForPath } from '../nav'

function navButtonClasses(active, mobile) {
  const base = 'flex items-center gap-2.5 rounded-lg border-none text-left cursor-pointer'
  const size = mobile ? 'px-3.5 py-4 text-base' : 'px-3 py-2.5 text-sm'
  const weight = active ? 'font-semibold' : 'font-medium'
  const color = active ? 'bg-forest-600 text-white' : 'bg-transparent text-forest-200 hover:bg-forest-700/60'
  return `${base} ${size} ${weight} ${color}`
}

function NavList({ mobile, onNavigate }) {
  const location = useLocation()
  const active = activeKeyForPath(location.pathname)
  return (
    <div className="grid gap-1">
      {NAV_ITEMS.map((n) => (
        <NavLink
          key={n.key}
          to={n.to}
          onClick={onNavigate}
          className={navButtonClasses(active === n.key, mobile)}
        >
          <span className="inline-block w-5 text-center text-[13px] opacity-90">{n.icon}</span>
          <span className="flex-1">{n.label}</span>
          {n.badge && (
            <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {n.badge}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  )
}

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = activeKeyForPath(location.pathname)

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen w-[236px] flex-none flex-col bg-forest-800 p-3.5 lg:flex">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-5 flex cursor-pointer items-center gap-2.5 border-none bg-transparent p-1.5 text-left"
        >
          <Logo variant="light" size="sm" />
        </button>
        <NavList mobile={false} />
        <div className="flex-1" />
        <div className="flex items-center gap-2.5 border-t border-forest-600 pt-3.5">
          <div
            className="flex items-center justify-center rounded-full bg-forest-600 text-[13px] font-bold text-forest-100"
            style={{ width: 34, height: 34 }}
          >
            EO
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white">E. Okonkwo</div>
            <div className="flex items-center gap-1.5 text-[11px] text-forest-200">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600" />
              Field Engineer
            </div>
          </div>
        </div>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col pb-[78px] lg:pb-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-forest-800 px-3.5 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-forest-600 bg-forest-700 text-lg text-white"
          >
            ☰
          </button>
          <Logo variant="light" size="sm" />
          <div className="flex-1" />
          <NavLink
            to="/alerts"
            className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-forest-600 bg-forest-700 text-[15px] text-white"
          >
            ◉
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              6
            </span>
          </NavLink>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-[60] bg-forest-950/60"
            onClick={() => setDrawerOpen(false)}
          >
            <div
              className="flex h-full w-[282px] flex-col bg-forest-800 p-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-1.5 pb-5">
                <Logo variant="light" size="sm" />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-forest-600 bg-forest-700 text-base text-white"
                >
                  ✕
                </button>
              </div>
              <NavList mobile onNavigate={() => setDrawerOpen(false)} />
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => { setDrawerOpen(false); navigate('/') }}
                className="rounded-lg border border-forest-600 bg-transparent px-4 py-4 text-left text-[15px] text-forest-100"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <Outlet />
      </div>

      {/* Mobile bottom tab bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-forest-600 bg-forest-800 px-1 pb-2 pt-1.5 lg:hidden">
        {TAB_ITEMS.map((t) => {
          const on = activeTab === t.key
          return (
            <NavLink
              key={t.key}
              to={t.to}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border-none bg-transparent ${on ? 'text-forest-400' : 'text-forest-200'}`}
            >
              <span className="text-base leading-none">{t.icon}</span>
              <span className="text-[11px] font-semibold">{t.label}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
