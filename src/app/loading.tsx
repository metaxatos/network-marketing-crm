export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl animate-pulse">🌟</div>
          </div>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-700">
          Loading your success...
        </h2>
        <p className="mt-2 text-gray-500">
          Great things are coming!
        </p>
      </div>
    </div>
  )
} 