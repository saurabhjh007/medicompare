import { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
  const [hospitals, setHospitals] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    rating: "",
    lat: "",
    lng: "",
    mriPrice: "",
    ctPrice: "",
    xrayPrice: "",
  });

  const getHospitals = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/hospitals");
      setHospitals(res.data);
    } catch (error) {
      alert("Failed to fetch hospitals");
    }
  };

  useEffect(() => {
    getHospitals();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addHospital = async () => {
    try {
      await axios.post("http://localhost:5000/api/hospitals", {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        rating: Number(formData.rating),
        coordinates: {
          lat: Number(formData.lat),
          lng: Number(formData.lng),
        },
        services: [
          { serviceName: "MRI Scan", price: Number(formData.mriPrice) },
          { serviceName: "CT Scan", price: Number(formData.ctPrice) },
          { serviceName: "X-Ray", price: Number(formData.xrayPrice) },
        ],
      });

      alert("Hospital added successfully");

      setFormData({
        name: "",
        address: "",
        city: "",
        rating: "",
        lat: "",
        lng: "",
        mriPrice: "",
        ctPrice: "",
        xrayPrice: "",
      });

      getHospitals();
    } catch (error) {
      alert("Failed to add hospital");
    }
  };

  const deleteHospital = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/hospitals/${id}`);

      alert("Hospital deleted successfully");
      getHospitals();
    } catch (error) {
      alert("Failed to delete hospital");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-700 text-white py-5 px-8">
        <h1 className="text-3xl font-bold">MediCompare Admin Panel</h1>
        <p>Add and manage hospital price data</p>
      </div>

      <div className="max-w-5xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Add New Hospital</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Hospital Name"
            className="border p-3 rounded"
          />

          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="border p-3 rounded"
          />

          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="border p-3 rounded col-span-2"
          />

          <input
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            placeholder="Rating e.g. 4.5"
            className="border p-3 rounded"
          />

          <input
            name="lat"
            value={formData.lat}
            onChange={handleChange}
            placeholder="Latitude"
            className="border p-3 rounded"
          />

          <input
            name="lng"
            value={formData.lng}
            onChange={handleChange}
            placeholder="Longitude"
            className="border p-3 rounded"
          />

          <input
            name="mriPrice"
            value={formData.mriPrice}
            onChange={handleChange}
            placeholder="MRI Scan Price"
            className="border p-3 rounded"
          />

          <input
            name="ctPrice"
            value={formData.ctPrice}
            onChange={handleChange}
            placeholder="CT Scan Price"
            className="border p-3 rounded"
          />

          <input
            name="xrayPrice"
            value={formData.xrayPrice}
            onChange={handleChange}
            placeholder="X-Ray Price"
            className="border p-3 rounded"
          />
        </div>

        <button
          onClick={addHospital}
          className="mt-5 bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800"
        >
          Add Hospital
        </button>
      </div>

      <div className="max-w-5xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">All Hospitals</h2>

        <div className="space-y-4">
          {hospitals.map((hospital) => (
            <div key={hospital._id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{hospital.name}</h3>

                  <p>{hospital.address}</p>

                  <p className="text-gray-600">
                    {hospital.city} | Rating: ⭐ {hospital.rating}
                  </p>
                </div>

                <button
                  onClick={() => deleteHospital(hospital._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3">
                <h4 className="font-semibold">Services:</h4>

                {hospital.services.map((service) => (
                  <p key={service._id}>
                    {service.serviceName}: ₹{service.price}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;