import React, { useEffect, useState } from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { Badge } from '../ui/Badge';

interface FidelityRedemptionProps {
  onApply: (points: number) => void;
  onSkip: () => void;
  currentPoints: number;
}

export const FidelityRedemption: React.FC<FidelityRedemptionProps> = ({
  onApply,
  onSkip,
  currentPoints,
}) => {
  const [balance, setBalance] = useState<number>(0);
  const [tierName, setTierName] = useState<string>('');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(currentPoints);
  const [isLoading, setIsLoading] = useState(true);

  const POINT_VALUE = 0.01; // 100 points = $1

  useEffect(() => {
    const fetchBalance = async (): Promise<void> => {
      try {
        const response = await api.fidelity.getBalance();
        setBalance(response.data.data.balance);
        setTierName(response.data.data.tier?.name || 'Bronze');
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const discount = pointsToRedeem * POINT_VALUE;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance display */}
      <div
        className="p-6 rounded-lg text-center space-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(0,210,255,0.1))',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Sparkles className="w-8 h-8 mx-auto" style={{ color: 'var(--accent-primary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Available Points
        </p>
        <p
          className="text-4xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {balance.toLocaleString()}
        </p>
        <Badge variant="info">{tierName} Tier</Badge>
      </div>

      {balance > 0 ? (
        <>
          {/* Slider */}
          <div className="space-y-3">
            <label
              className="block text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Points to redeem
            </label>
            <input
              type="range"
              min={0}
              max={balance}
              step={10}
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(Number(e.target.value))}
              className="w-full accent-[var(--accent-primary)]"
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>0</span>
              <span>{balance.toLocaleString()}</span>
            </div>

            {/* Manual input */}
            <input
              type="number"
              min={0}
              max={balance}
              value={pointsToRedeem}
              onChange={(e) =>
                setPointsToRedeem(Math.min(Number(e.target.value) || 0, balance))
              }
              className="input text-center text-lg font-semibold"
            />
          </div>

          {/* Discount preview */}
          <div
            className="p-4 rounded-lg flex items-center justify-between"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" style={{ color: 'var(--accent-success)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Discount
              </span>
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: 'var(--accent-success)' }}
            >
              -${discount.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-3">
            <button onClick={onSkip} className="btn-secondary flex-1 py-3">
              Skip
            </button>
            <button
              onClick={() => onApply(pointsToRedeem)}
              className="btn-primary flex-1 py-3"
            >
              Apply {pointsToRedeem.toLocaleString()} Points
            </button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <p style={{ color: 'var(--text-secondary)' }}>
            You don't have any points to redeem yet. Complete this order to start earning!
          </p>
          <button onClick={onSkip} className="btn-primary w-full py-3">
            Continue Without Points
          </button>
        </div>
      )}
    </div>
  );
};
