'use client';

import { PayPoint } from '@/components/context/PayPointsContext';

interface PayPointListItemProps {
  point: PayPoint;
  onRemove: () => void;
}

export default function PayPointListItem({ point, onRemove }: PayPointListItemProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-3">
      <div className="flex space-x-4">
        <span className="font-medium text-gray-700">{point.year || '--'}</span>
        <span className="font-semibold text-gray-900">
          {point.pay ? point.pay.toLocaleString('nb-NO') : '--'}
        </span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        Fjern
      </button>
    </div>
  );
}
