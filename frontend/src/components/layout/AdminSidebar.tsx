import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, BarChart3, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, end: false },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, end: false },
];

export function AdminSidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-bg-card border-r border-border-subtle flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border-subtle flex-shrink-0">
        <span className="font-display text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
          TechVault
        </span>
        <span className="text-xs font-medium text-text-secondary bg-bg-elevated px-2 py-0.5 rounded-md">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'text-accent-primary bg-accent-primary/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-accent-primary rounded-r-full" />
                )}
                <Icon
                  className={clsx(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary',
                  )}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom link */}
      <div className="px-3 py-4 border-t border-border-subtle flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
