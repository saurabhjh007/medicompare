function SearchBar({ service, setService, searchService, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchService();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search medical procedures (e.g. MRI Scan, CT Scan, X-Ray)..."
          value={service}
          onChange={(e) => setService(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3.5 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
        />
      </div>

      <button
        onClick={searchService}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-8 py-3.5 rounded-2xl font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Searching...</span>
          </>
        ) : (
          <span>Search</span>
        )}
      </button>
    </div>
  );
}

export default SearchBar;