export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 h-[68px] flex items-center">
          <div className="h-5 w-48 bg-white/20 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card text-center">
              <div className="h-9 w-16 bg-slate-200 rounded animate-pulse mx-auto" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse mx-auto mt-3" />
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-20 animate-pulse bg-slate-50" />
          ))}
        </div>
      </main>
    </div>
  );
}
