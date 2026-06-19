import React from 'react';
import { Award } from 'lucide-react';

interface TierProgressProps {
  currentTier: string;
  currentSpend: number;
  nextTierName: string | null;
  nextTierSpendRemaining: number | null;
  multiplier: number;
}

const TIER_COLORS: Record<string, { from: string; to: string }> = {
  Bronze: { from: '#CD7F32', to: '#A0522D' },
  Silver: { from: '#C0C0C0', to: '#808080' },
  Gold:   { from: '#FFD700', to: '#FFA500' },
};

export const TierProgress: React.FC<TierProgressProps> = ({
  currentTier,
  currentSpend,
  nextTierName,
  nextTierSpendRemaining,
  multiplier,
}) => {
  const colors = TIER_COLORS[currentTier] || TIER_COLORS.Bronze;

  // Calculate progress percentage toward next tier
  let progress = 100;
  if (nextTierName && nextTierSpendRemaining !== null) {
    const totalNeeded = currentSpend + nextTierSpendRemaining;
    progress = totalNeeded > 0 ? Math.round((currentSpend / totalNeeded) * 100) : 0;
  }

  return (
    <div
      className="p-6 rounded-lg space-y-4"
      style={{
        background: `linear-gradient(135deg, ${colors.from}15, ${colors.to}10)`,
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Current tier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            }}
          >
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {currentTier}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {multiplier}× points multiplier
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Lifetime Spend
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            ${currentSpend.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {nextTierName && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>{currentTier}</span>
            <span>{nextTierName}</span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-card)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
              }}
            />
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            ${nextTierSpendRemaining?.toFixed(2)} more to reach {nextTierName}
          </p>
        </div>
      )}

      {!nextTierName && (
        <p className="text-sm text-center" style={{ color: 'var(--accent-warning)' }}>
          🎉 You've reached the highest tier!
        </p>
      )}

      {/* Tier perks */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-card)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {multiplier}×
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Points Rate
          </p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-card)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>
            ✓
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Free Shipping
          </p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-card)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
            ★
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Early Access
          </p>
        </div>
      </div>
    </div>
  );
};
