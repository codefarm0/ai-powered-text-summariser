interface LoadingIndicatorProps {
  message?: string
}

export default function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-indigo-200 rounded-full" />
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
