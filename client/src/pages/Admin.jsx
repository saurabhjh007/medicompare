import { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingHospital, setEditingHospital] = useState(null);

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

  const [editData, setEditData] = useState({
    rating: "",
    mriPrice: "",
    ctPrice: "",
    xrayPrice: "",
  });

  const getHospitals = async () => {
    try {
      const res = await axios.get("https://medicompare-7rv1.onrender.com/api/hospitals");
      setHospitals(res.data);
    } catch (error) {
      alert("Failed to fetch hospitals");
    }
  };

  const getAppointments = async () => {
    try {
      const res = await axios.get("https://medicompare-7rv1.onrender.com/api/appointments");
      setAppointments(res.data);
    } catch (error) {
      alert("Failed to fetch appointments");
    }
  };

  useEffect(() => {
    getHospitals();
    getAppointments();
  }, []);

  const getMRIPrices = () => {
    return hospitals
      .map((hospital) => {
        const mri = hospital.services.find(
          (service) => service.serviceName === "MRI Scan"
        );
        return mri?.price;
      })
      .filter((price) => price !== undefined);
  };

  const mriPrices = getMRIPrices();
  const lowestMRI = mriPrices.length > 0 ? Math.min(...mriPrices) : 0;
  const highestMRI = mriPrices.length > 0 ? Math.max(...mriPrices) : 0;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const addHospital = async () => {
    try {
      await axios.post("https://medicompare-7rv1.onrender.com/api/hospitals", {
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
      await axios.delete(`https://medicompare-7rv1.onrender.com/api/hospitals/${id}`);
      alert("Hospital deleted successfully");
      getHospitals();
    } catch (error) {
      alert("Failed to delete hospital");
    }
  };

  const startEdit = (hospital) => {
    setEditingHospital(hospital);

    const mri = hospital.services.find(
      (service) => service.serviceName === "MRI Scan"
    );
    const ct = hospital.services.find(
      (service) => service.serviceName === "CT Scan"
    );
    const xray = hospital.services.find(
      (service) => service.serviceName === "X-Ray"
    );

    setEditData({
      rating: hospital.rating,
      mriPrice: mri?.price || "",
      ctPrice: ct?.price || "",
      xrayPrice: xray?.price || "",
    });
  };

  const updateHospital = async () => {
    try {
      await axios.put(
        `https://medicompare-7rv1.onrender.com/api/hospitals/${editingHospital._id}`,
        {
          rating: Number(editData.rating),
          services: [
            { serviceName: "MRI Scan", price: Number(editData.mriPrice) },
            { serviceName: "CT Scan", price: Number(editData.ctPrice) },
            { serviceName: "X-Ray", price: Number(editData.xrayPrice) },
          ],
        }
      );

      alert("Hospital updated successfully");
      setEditingHospital(null);
      getHospitals();
    } catch (error) {
      alert("Failed to update hospital");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-700 text-white py-5 px-8">
        <h1 className="text-3xl font-bold">MediCompare Admin Panel</h1>
        <p>Add, edit and manage hospital price data</p>
      </div>

      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Total Hospitals</p>
          <h2 className="text-3xl font-bold text-purple-700">
            {hospitals.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Appointments</p>
          <h2 className="text-3xl font-bold text-blue-700">
            {appointments.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Lowest MRI</p>
          <h2 className="text-3xl font-bold text-green-700">
            ₹{lowestMRI}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Highest MRI</p>
          <h2 className="text-3xl font-bold text-red-700">
            ₹{highestMRI}
          </h2>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Add New Hospital</h2>

        <div className="grid grid-cols-2 gap-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Hospital Name" className="border p-3 rounded" />
          <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="border p-3 rounded" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-3 rounded col-span-2" />
          <input name="rating" value={formData.rating} onChange={handleChange} placeholder="Rating e.g. 4.5" className="border p-3 rounded" />
          <input name="lat" value={formData.lat} onChange={handleChange} placeholder="Latitude" className="border p-3 rounded" />
          <input name="lng" value={formData.lng} onChange={handleChange} placeholder="Longitude" className="border p-3 rounded" />
          <input name="mriPrice" value={formData.mriPrice} onChange={handleChange} placeholder="MRI Scan Price" className="border p-3 rounded" />
          <input name="ctPrice" value={formData.ctPrice} onChange={handleChange} placeholder="CT Scan Price" className="border p-3 rounded" />
          <input name="xrayPrice" value={formData.xrayPrice} onChange={handleChange} placeholder="X-Ray Price" className="border p-3 rounded" />
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

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(hospital)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteHospital(hospital._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
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

      {editingHospital && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-2xl font-bold mb-4">
              Edit {editingHospital.name}
            </h2>

            <input
              name="rating"
              value={editData.rating}
              onChange={handleEditChange}
              placeholder="Rating"
              className="w-full border p-3 rounded mb-3"
            />

            <input
              name="mriPrice"
              value={editData.mriPrice}
              onChange={handleEditChange}
              placeholder="MRI Scan Price"
              className="w-full border p-3 rounded mb-3"
            />

            <input
              name="ctPrice"
              value={editData.ctPrice}
              onChange={handleEditChange}
              placeholder="CT Scan Price"
              className="w-full border p-3 rounded mb-3"
            />

            <input
              name="xrayPrice"
              value={editData.xrayPrice}
              onChange={handleEditChange}
              placeholder="X-Ray Price"
              className="w-full border p-3 rounded mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={updateHospital}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>

              <button
                onClick={() => setEditingHospital(null)}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;