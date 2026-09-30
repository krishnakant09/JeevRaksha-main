import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f4fb] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
        <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🐮</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">404</h2>
        <p className="text-gray-500 mb-8 font-medium">Oops! It looks like this page wandered off from the herd.</p>
        
        <Link 
          href="/" 
          className="block w-full py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition shadow-md"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
