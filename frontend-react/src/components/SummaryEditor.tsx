interface SummaryEditorProps {
  text: string
  onChange: (text: string) => void
  disabled?: boolean
}

export default function SummaryEditor({ text, onChange, disabled }: SummaryEditorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Text to Summarize
      </label>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={8}
        placeholder="Paste or type the text you want to summarize..."
        className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-400">
          {text.length > 0
            ? `${text.split(/\s+/).filter(Boolean).length} words`
            : ''}
        </span>
        {text.length > 10000 && (
          <span className="text-xs text-amber-600">
            Text is long; processing may take longer
          </span>
        )}
      </div>
    </div>
  )
}
