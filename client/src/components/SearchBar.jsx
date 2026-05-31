function SearchBar({ service, setService, searchService, loading }) {
  return (
    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Example: MRI Scan, CT Scan, X-Ray"
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="flex-1 border p-3 rounded-lg"
      />

      <button
        onClick={searchService}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </div>
  );
}

export default SearchBar;