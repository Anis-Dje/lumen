import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, Award, Truck, ShieldCheck, Headphones } from 'lucide-react';
import { useCatalogStore } from '../stores/catalogStore';
import { productsApi } from '../lib/api';
import { ProductCard } from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/ui/SkeletonLoader';
import { HeroSection } from '../components/landing/HeroSection';
import { ProductCarousel } from '../components/landing/ProductCarousel';
import { Reveal } from '../components/ui/Reveal';
import type { Product } from '../types';

const VALUE_PROPS = [
  { icon: Award, title: 'Fidelity rewards', desc: 'Earn points on every order and unlock higher tiers.' },
  { icon: Truck, title: 'Fast, free shipping', desc: 'Complimentary delivery on qualifying orders.' },
  { icon: ShieldCheck, title: 'Authentic & secure', desc: 'Genuine products with protected checkout.' },
  { icon: Headphones, title: 'Expert support', desc: 'Real specialists, ready when you need them.' },
];

export const CatalogPage: React.FC = () => {
  const {
    products,
    categories,
    filters,
    totalPages,
    total,
    isLoading,
    fetchProducts,
    fetchCategories,
    setFilter,
    resetFilters,
  } = useCatalogStore();

  const [featured, setFeatured] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();

    // Featured rail: a lightweight, filter-independent pull of products.
    productsApi
      .getProducts({ per_page: 10 })
      .then((res) => setFeatured(res.data.data))
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Featured carousel ────────────────────────────────── */}
      <div id="featured" className="scroll-mt-20">
        <ProductCarousel
          title="Featured & best-selling"
          subtitle="Hand-picked gear our community loves"
          products={featured}
          loading={featuredLoading}
        />
      </div>

      {/* ── Value props ──────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((v, i) => (
            <Reveal key={v.title} delay={i * 80}>
              <div className="glass-card flex h-full items-start gap-4 p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-primary/15 text-accent-primary">
                  <v.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-text-primary">{v.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{v.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Catalog ──────────────────────────────────────────── */}
      <section id="catalog" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-12">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-text-primary">Shop all tech</h2>
          <p className="mt-1 text-text-secondary">
            {total} product{total !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar filters */}
          <aside className="w-full shrink-0 space-y-6 lg:sticky lg:top-20 lg:h-fit lg:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                className="input pl-10"
              />
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-secondary">
                <SlidersHorizontal className="h-4 w-4" />
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setFilter('category', null)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors"
                  style={{
                    background: !filters.category ? 'var(--accent-primary)' : 'transparent',
                    color: !filters.category ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter('category', cat.slug)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors"
                    style={{
                      background: filters.category === cat.slug ? 'var(--accent-primary)' : 'transparent',
                      color: filters.category === cat.slug ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {cat.name}
                    {cat.products_count !== undefined && (
                      <span className="float-right opacity-60">{cat.products_count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {(filters.category || filters.search) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm text-accent-danger transition-colors"
              >
                <X className="h-4 w-4" /> Clear Filters
              </button>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="space-y-4 py-16 text-center text-text-secondary">
                <Search className="mx-auto h-12 w-12 opacity-30" />
                <p className="text-lg">No products found</p>
                <p className="text-sm">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product, i) => (
                    <Reveal key={product.id} delay={(i % 3) * 70}>
                      <ProductCard product={product} />
                    </Reveal>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setFilter('page', page)}
                        className="h-10 w-10 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: filters.page === page ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                          color: filters.page === page ? '#fff' : 'var(--text-secondary)',
                          border: `1px solid ${filters.page === page ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
