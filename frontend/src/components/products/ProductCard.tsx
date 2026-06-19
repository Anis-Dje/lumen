import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const variants = product.variants || [];
  const prices = variants.filter((v) => v.is_active).map((v) => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const hasStock = variants.some((v) => v.is_in_stock);
  const hasLowStock = variants.some((v) => v.is_low_stock && v.is_in_stock);

  const priceDisplay =
    minPrice === maxPrice
      ? `$${minPrice.toFixed(2)}`
      : `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="glass-card block overflow-hidden group"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16"
              style={{ color: 'var(--text-secondary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-3 right-3">
          {!hasStock ? (
            <Badge variant="danger">Out of Stock</Badge>
          ) : hasLowStock ? (
            <Badge variant="warning" className="pulse-warning">Low Stock</Badge>
          ) : (
            <Badge variant="success">In Stock</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Category */}
        {product.category && (
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--accent-secondary)' }}
          >
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <h3
          className="font-semibold text-lg leading-tight line-clamp-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {product.name}
        </h3>

        {/* Short description */}
        {product.short_description && (
          <p
            className="text-sm line-clamp-2 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {product.short_description}
          </p>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2">
          <span
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {priceDisplay}
          </span>
          <span
            className="text-sm font-medium transition-colors duration-150"
            style={{ color: 'var(--accent-primary)' }}
          >
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};
