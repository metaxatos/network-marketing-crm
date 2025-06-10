import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          Looks like this page went on an adventure! Let's get you back to building your success.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
} 