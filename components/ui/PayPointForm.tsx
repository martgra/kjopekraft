'use client';

interface PayPointFormProps {
  newYear: string;
  newPay: string;
  currentYear: number;
  onYearChange: (yearStr: string) => void;
  onPayChange: (payStr: string) => void;
  onAdd: () => void;
}

export default function PayPointForm({
  newYear,
  newPay,
  currentYear,
  onYearChange,
  onPayChange,
  onAdd,
}: PayPointFormProps) {
  // parse for validation only
  const yearNum = Number(newYear);
  const payNum  = Number(newPay);
  const disabled = !newYear || !newPay || isNaN(yearNum) || isNaN(payNum) || yearNum > currentYear;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        {/* Year */}
        <div className="flex-1">
          <label htmlFor="new-year" className="block text-sm font-medium text-gray-600 mb-1">
            År
          </label>
          <input
            id="new-year"
            type="number"
            min={0}
            max={currentYear}
            value={newYear}
            onChange={e => onYearChange(e.target.value)}
            placeholder="f.eks. 2025"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 placeholder-gray-400"
            spellCheck="false"
            autoComplete="off"
            data-ms-editor="false"
          />
        </div>
        {/* Pay */}
        <div className="flex-1">
          <label htmlFor="new-pay" className="block text-sm font-medium text-gray-600 mb-1">
            Lønn (NOK)
          </label>
          <input
            id="new-pay"
            type="text"
            inputMode="numeric"
            value={newPay}
            onChange={e => {
              // Only allow digits and spaces
              const sanitized = e.target.value.replace(/[^\d\s]/g, '');
              onPayChange(sanitized);
            }}
            placeholder="f.eks. 550 000"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 placeholder-gray-400"
            spellCheck="false"
            autoComplete="off"
            data-ms-editor="false"
          />
        </div>
      </div>

      <button
        onClick={onAdd}
        disabled={disabled}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md disabled:opacity-50 transition"
      >
        Legg til punkt
      </button>
    </div>
  );
}
