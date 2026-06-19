import React from 'react';

interface SpecsTableProps {
  specifications: Record<string, string>;
}

export const SpecsTable: React.FC<SpecsTableProps> = ({ specifications }) => {
  const entries = Object.entries(specifications);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--border-subtle)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-elevated)' }}>
            <th
              colSpan={2}
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Technical Specifications
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value], index) => (
            <tr
              key={key}
              style={{
                background: index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-primary)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <td
                className="px-4 py-3 font-medium w-2/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {key}
              </td>
              <td
                className="px-4 py-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
