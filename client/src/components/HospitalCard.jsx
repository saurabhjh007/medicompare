function HospitalCard({ item, onBook }) {
  return (
    <div className="border rounded-lg p-5 flex justify-between items-center bg-white">
      <div>
        <h4 className="text-lg font-bold">{item.hospitalName}</h4>
        <p className="text-gray-600">{item.address}</p>
        <p className="text-sm text-gray-500">
          {item.city} | Rating: ⭐ {item.rating}
        </p>

        <button
          onClick={() => onBook(item)}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Book Appointment
        </button>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-blue-600">₹{item.price}</p>
        <p className="text-sm text-gray-500">{item.serviceName}</p>
      </div>
    </div>
  );
}

export default HospitalCard;