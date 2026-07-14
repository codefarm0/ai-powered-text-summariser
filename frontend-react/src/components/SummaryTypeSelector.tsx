import type { SummaryType } from '../types'
import { SUMMARY_TYPE_LABELS } from '../types'

interface SummaryTypeSelectorProps {
  value: SummaryType
  onChange: (value: SummaryType) => void
}

const types = Object.keys(SUMMARY_TYPE_LABELS) as SummaryType[]

export default function SummaryTypeSelector({ value, onChange }: SummaryTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Summary Type
      </label>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-all ${
              value === type
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {SUMMARY_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  )
}
