import { Link } from "react-router-dom";

function HospitalCard({ item, onBook }) {
  const defaultImage =
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d";

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Card Image Area with Hover Zoom */}
        <div className="relative overflow-hidden h-52">
          <img
            src={item.image || defaultImage}
            alt={item.hospitalName}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-slate-800 shadow-sm flex items-center gap-1 border border-white/50">
            <span className="text-yellow-500 text-base leading-none">★</span>
            <span>{item.rating || "4.5"}</span>
          </div>
          {/* Overlay to give card high-end feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold mb-3 tracking-wide">
            {item.serviceName}
          </span>
          <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-1">
            {item.hospitalName}
          </h4>
          <p className="text-slate-500 text-sm mt-1.5 flex items-start gap-1">
            <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{item.address}, {item.city}</span>
          </p>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Price</span>
            <span className="text-3xl font-extrabold text-indigo-600">₹{item.price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Button Actions Grid */}
      <div className="p-6 pt-0 grid grid-cols-3 gap-2">
        <Link
          to={`/hospital/${item.hospitalId}`}
          className="text-center border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
        >
          Details
        </Link>

        <a
          href={`https://www.google.com/maps?q=${item.coordinates?.lat},${item.coordinates?.lng}`}
          target="_blank"
          rel="noreferrer"
          className="text-center border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Map
        </a>

        <button
          onClick={() => onBook(item)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-indigo-600/10 cursor-pointer text-sm"
        >
          Book
        </button>
      </div>
    </div>
  );
}

export default HospitalCard;