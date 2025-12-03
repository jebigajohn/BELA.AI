'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Scissors,
  Users,
  UserCog,
  Calendar,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useSidebar } from './SidebarContext'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
  requiresLogin?: boolean
}

const navItems: NavItem[] = [
  {
    href: '/demo/services',
    label: 'Services',
    icon: <Scissors size={20} />,
  },
  {
    href: '/demo/customers',
    label: 'Customers',
    icon: <Users size={20} />,
    requiresLogin: true,
  },
  {
    href: '/demo/ai-dm',
    label: 'AI DM Demo',
    icon: <Sparkles size={20} />,
  },
  {
    href: '/admin/staff',
    label: 'Staff',
    icon: <UserCog size={20} />,
    requiresLogin: true,
  },
  {
    href: '/admin/appointments',
    label: 'Appointments',
    icon: <Calendar size={20} />,
    adminOnly: true,
  },
  {
    href: '/admin/services',
    label: 'Manage Services',
    icon: <Settings size={20} />,
    adminOnly: true,
  },
]

export default function SidebarClient({
  isAdmin,
  isLoggedIn,
  profile,
}: {
  isAdmin: boolean
  isLoggedIn: boolean
  profile: { name: string; email: string } | null
}) {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false
    if (item.requiresLogin && !isLoggedIn) return false
    return true
  })

  // Close mobile menu when navigating
  const handleNavClick = () => {
    if (mobileOpen) setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-neutral-900 text-white md:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen flex flex-col justify-between 
          bg-neutral-900 text-neutral-100 z-40 transition-all duration-300
          ${collapsed ? 'w-16 p-2' : 'w-64 p-4'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header - extra padding on mobile when menu is open */}
        <div className={mobileOpen ? 'pt-14 md:pt-0' : ''}>
          <div
            className={`flex items-center mb-8 ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!collapsed && (
              <Link href="/" className="text-xl font-bold tracking-tight">
                23 Nailroom
              </Link>
            )}
            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-2 rounded-lg hover:bg-neutral-800 transition-colors items-center justify-center"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {filteredItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center rounded-lg transition-colors
                    ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                    ${
                      isActive
                        ? 'bg-neutral-700 text-white'
                        : 'hover:bg-neutral-800 text-neutral-300'
                    }
                  `}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="truncate text-sm">{item.label}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer / Profile */}
        <div>
          {isLoggedIn && profile ? (
            <div
              className={`
                flex rounded-lg bg-neutral-800
                ${
                  collapsed
                    ? 'flex-col items-center gap-2 p-2'
                    : 'items-center gap-2 p-2'
                }
              `}
            >
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {profile.name}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">
                    {profile.email}
                  </div>
                </div>
              )}

              <div
                className={`flex ${collapsed ? 'flex-col' : 'flex-row'} gap-1`}
              >
                <Link
                  href="/profile"
                  onClick={handleNavClick}
                  title="Edit Profile"
                  className="p-2 rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center"
                >
                  <User size={18} />
                </Link>

                <form action="/logout" method="get">
                  <button
                    type="submit"
                    title="Logout"
                    className="p-2 rounded-lg hover:bg-neutral-700 text-red-400 transition-colors flex items-center justify-center"
                  >
                    <LogOut size={18} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div
              className={`flex ${collapsed ? 'flex-col' : 'flex-row'} gap-2`}
            >
              <Link
                href="/login"
                onClick={handleNavClick}
                title="Login"
                className={`
                  flex items-center justify-center rounded-lg border border-neutral-700 
                  text-sm hover:bg-neutral-800 transition-colors
                  ${collapsed ? 'p-2' : 'px-3 py-2 flex-1'}
                `}
              >
                {collapsed ? <User size={18} /> : 'Login'}
              </Link>
              <Link
                href="/signup"
                onClick={handleNavClick}
                title="Sign Up"
                className={`
                  flex items-center justify-center rounded-lg bg-white text-neutral-900
                  text-sm hover:opacity-90 transition-opacity
                  ${collapsed ? 'p-2' : 'px-3 py-2 flex-1'}
                `}
              >
                {collapsed ? <User size={18} /> : 'Sign Up'}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
