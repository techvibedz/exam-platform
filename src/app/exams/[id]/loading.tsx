export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 h-[68px] flex items-center">
          <div className="h-5 w-40 bg-white/20 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card">
            <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
