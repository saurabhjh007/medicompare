import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import AppointmentModal from "../components/AppointmentModal.jsx";

function HospitalDetails() {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  const defaultImage =
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d";

  useEffect(() => {
    const getHospital = async () => {
      try {
        const res = await axios.get(
          `https://medicompare-7rv1.onrender.com/api/hospitals/${id}`
        );

        setHospital(res.data);
      } catch (error) {
        alert("Failed to load hospital details");
      } finally {
        setLoading(false);
      }
    };

    getHospital();
  }, [id]);

  const openBooking = (service) => {
    setSelectedService({
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      address: hospital.address,
      city: hospital.city,
      rating: hospital.rating,
      image: hospital.image,
      coordinates: hospital.coordinates,
      serviceName: service.serviceName,
      price: service.price,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">
          Loading hospital details...
        </p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Hospital not found</h1>

          <Link
            to="/dashboard"
            className="inline-block mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">MediCompare</h1>
            <p className="text-sm text-gray-500">Hospital Details</p>
          </div>

          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <img
            src={hospital.image || defaultImage}
            alt={hospital.name}
            className="w-full h-80 object-cover"
          />

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">
                  {hospital.name}
                </h2>

                <p className="text-gray-600 mt-3">{hospital.address}</p>
                <p className="text-gray-500">{hospital.city}</p>
              </div>

              <span className="self-start bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">
                ⭐ {hospital.rating}
              </span>
            </div>

            <div className="mt-6">
              <a
                href={`https://www.google.com/maps?q=${hospital.coordinates?.lat},${hospital.coordinates?.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block border border-blue-600 text-blue-600 px-5 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>

        <section className="mt-8 bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold">Available Services</h2>
              <p className="text-gray-600 mt-1">
                Compare available medical services and book an appointment.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {hospital.services.map((service) => (
              <div
                key={service._id}
                className="border rounded-xl p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div>
                  <h3 className="text-xl font-bold">
                    {service.serviceName}
                  </h3>

                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ₹{service.price}
                  </p>
                </div>

                <button
                  onClick={() => openBooking(service)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {selectedService && (
        <AppointmentModal
          selectedHospital={selectedService}
          closeModal={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

export default HospitalDetails;