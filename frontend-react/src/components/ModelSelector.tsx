const AVAILABLE_MODELS = ['mistral', 'llama3.1', 'qwen']

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        AI Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model} value={model}>
            {model.charAt(0).toUpperCase() + model.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}
