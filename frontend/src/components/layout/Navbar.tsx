import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, ChevronDown, LogOut, Package, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { startOAuth } from '@/lib/oauth';

const GoogleGlyph = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-8 20-20 0-1.3-.1-2.3-.4-3.5z" transform="scale(0.5)" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" transform="scale(0.5)" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" transform="scale(0.5)" />
    <path fill="#1976D2" d="M43.6 20.5H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C40.9 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" transform="scale(0.5)" />
  </svg>
);

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { openCart } = useCartStore();
  const itemCountFn = useCartStore((s) => s.itemCount);
  const count = itemCountFn();
  const { categories, fetchCategories, setFilter } = useCatalogStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(count);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (count !== prevCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 350);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
  }, [count]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilter('search', value);
      }, 400);
    },
    [setFilter],
  );

  const handleCategoryClick = (categorySlug: string) => {
    setFilter('category', categorySlug);
    setMobileOpen(false);
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdown(false);
    navigate('/');
  };

  return (
    <>
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle shadow-lg shadow-black/10'
            : 'bg-bg-primary/50 backdrop-blur-md',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 select-none">
              <span className="font-display text-2xl font-extrabold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                TechVault
              </span>
            </Link>

            {/* Desktop category links */}
            <div className="hidden lg:flex items-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="hidden sm:flex flex-1 max-w-xs relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all"
              />
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span
                    key={count}
                    className={clsx(
                      'absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-accent-primary rounded-full transition-transform duration-300',
                      cartBounce && 'animate-[cart-bounce_0.35s_ease-out]',
                    )}
                    style={{
                      animation: cartBounce ? 'cart-bounce 0.35s ease-out' : undefined,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>

              {/* User section - desktop */}
              <div className="hidden sm:block relative" ref={dropdownRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserDropdown((p) => !p)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{user.name}</span>
                      <ChevronDown
                        className={clsx('w-3.5 h-3.5 transition-transform', userDropdown && 'rotate-180')}
                      />
                    </button>

                    {userDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-border-subtle rounded-xl shadow-xl shadow-black/20 overflow-hidden py-1 animate-[fade-in_0.15s_ease-out]">
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          Orders
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-accent-danger hover:bg-accent-danger/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startOAuth('google')}
                      title="Continue with Google"
                      aria-label="Continue with Google"
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border-subtle transition-colors hover:border-accent-primary hover:bg-white/5"
                    >
                      <GoogleGlyph />
                    </button>
                    <Link
                      to="/login"
                      className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((p) => !p)}
                className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-bg-elevated border-b border-border-subtle shadow-xl shadow-black/20 max-h-[calc(100vh-4rem)] overflow-y-auto animate-[slide-down_0.2s_ease-out]">
            {/* Mobile search */}
            <div className="p-4 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products…"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-primary transition-all"
                />
              </div>
            </div>

            {/* Mobile categories */}
            <div className="px-4 pb-2">
              <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary/60">
                Categories
              </p>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="block w-full text-left px-2 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Mobile auth */}
            <div className="p-4 border-t border-border-subtle sm:hidden">
              {user ? (
                <div className="space-y-1">
                  <p className="px-2 py-1 text-xs font-semibold text-text-secondary/60">
                    {user.name}
                  </p>
                  <Link
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="block px-2 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-2 py-2.5 text-sm text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { startOAuth('google'); }}
                    className="btn-oauth"
                  >
                    <GoogleGlyph />
                    Continue with Google
                  </button>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary text-center text-sm py-2.5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary text-center text-sm py-2.5"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      <style>{`
        @keyframes cart-bounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.4); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
