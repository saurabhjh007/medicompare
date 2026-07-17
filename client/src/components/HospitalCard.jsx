import { Link } from "react-router-dom";

function HospitalCard({ item, onBook }) {
  const defaultImage =
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d";

  return (
    <div className="bg-white border rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      <img
        src={item.image || defaultImage}
        alt={item.hospitalName}
        className="w-full h-48 object-cover"
      />

      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="text-xl font-bold">{item.hospitalName}</h4>
            <p className="text-gray-600 mt-1">{item.address}</p>
            <p className="text-sm text-gray-500">{item.city}</p>
          </div>

          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
            ⭐ {item.rating}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">{item.serviceName}</p>
          <p className="text-3xl font-bold text-blue-600">₹{item.price}</p>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to={`/hospital/${item.hospitalId}`}
            className="text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
          >
            Details
          </Link>

          <a
            href={`https://www.google.com/maps?q=${item.coordinates?.lat},${item.coordinates?.lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-center border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50"
          >
            Map
          </a>

          <button
            onClick={() => onBook(item)}
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default HospitalCard;