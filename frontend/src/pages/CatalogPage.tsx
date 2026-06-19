import React, { useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCatalogStore } from '../stores/catalogStore';
import { ProductCard } from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/ui/SkeletonLoader';

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

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Tech Catalog
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {total} product{total !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Categories */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilter('category', null)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150"
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
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150"
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

          {/* Active filters */}
          {(filters.category || filters.search) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-sm transition-colors duration-150"
              style={{ color: 'var(--accent-danger)' }}
            >
              <X className="w-4 h-4" /> Clear Filters
            </button>
          )}
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div
              className="text-center py-16 space-y-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Search className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-lg">No products found</p>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setFilter('page', page)}
                      className="w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-150"
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
    </div>
  );
};
