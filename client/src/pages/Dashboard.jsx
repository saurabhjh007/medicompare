import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar.jsx";
import HospitalCard from "../components/HospitalCard.jsx";
import AppointmentModal from "../components/AppointmentModal.jsx";

function Dashboard() {
  const [service, setService] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const searchService = async (serviceName = service) => {
    if (!serviceName) {
      alert("Please enter a service name");
      return;
    }

    try {
      setLoading(true);
      setService(serviceName);

      const res = await axios.get(
        `https://medicompare-7rv1.onrender.com/api/hospitals/search?service=${serviceName}`
      );

      setResults(res.data);
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = () => {
    if (results.length < 2) return 0;
    return results[results.length - 1].price - results[0].price;
  };

  const popularServices = [
    "MRI Scan",
    "CT Scan",
    "X-Ray",
    "Blood Test",
    "ECG",
    "Ultrasound",
  ];

  const featuredHospitals = [
    {
      name: "Apollo Hospital",
      location: "Sector 26, Noida",
      rating: 4.8,
    },
    {
      name: "Fortis Hospital",
      location: "Sector 62, Noida",
      rating: 4.3,
    },
    {
      name: "Max Hospital",
      location: "Sector 19, Noida",
      rating: 4.4,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">MediCompare</h1>
            <p className="text-sm text-gray-500">
              Healthcare Price Transparency
            </p>
          </div>

          <div className="hidden md:flex gap-8 font-medium text-gray-700">
            <a href="#dashboard" className="hover:text-blue-600">
              Dashboard
            </a>

            <a href="#services" className="hover:text-blue-600">
              Services
            </a>

            <Link to="/profile" className="hover:text-blue-600">
              Appointments
            </Link>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700"
          >
            <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <span>{user?.name || "Profile"}</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section
        id="dashboard"
        className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <div>
          <p className="text-blue-600 font-semibold mb-2">
            Welcome back, {user?.name}
          </p>

          <h2 className="text-5xl font-bold text-gray-900 leading-tight">
            Compare Healthcare Prices with Confidence
          </h2>

          <p className="text-gray-600 mt-5 text-lg">
            Find affordable medical services across trusted hospitals, compare
            prices, view locations, and book appointments online.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="#services"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Compare Prices
            </a>

            <Link
              to="/profile"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              My Appointments
            </Link>
          </div>

          <div className="mt-8 bg-white p-5 rounded-xl shadow">
            <SearchBar
              service={service}
              setService={setService}
              searchService={() => searchService()}
              loading={loading}
            />
          </div>
        </div>

        <div className="bg-blue-100 rounded-3xl p-8 text-center">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3"
            alt="Healthcare"
            className="rounded-2xl h-80 w-full object-cover shadow"
          />

          <div className="bg-white mt-5 p-4 rounded-xl shadow">
            <h3 className="font-bold text-xl text-gray-800">
              Save more on healthcare
            </h3>

            <p className="text-gray-600 mt-1">
              Compare prices before booking your appointment.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Hospitals</p>
          <h3 className="text-3xl font-bold text-blue-700">50+</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Medical Services</p>
          <h3 className="text-3xl font-bold text-green-700">100+</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Appointments</p>
          <h3 className="text-3xl font-bold text-purple-700">500+</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Average Savings</p>
          <h3 className="text-3xl font-bold text-red-700">40%</h3>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="max-w-7xl mx-auto px-8 mt-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-4">Popular Services</h2>

          <div className="flex flex-wrap gap-3">
            {popularServices.map((item) => (
              <button
                key={item}
                onClick={() => searchService(item)}
                className="bg-blue-50 text-blue-700 px-5 py-3 rounded-full font-semibold hover:bg-blue-100"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      {results.length > 0 && (
        <section className="max-w-7xl mx-auto px-8 mt-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-2xl font-bold mb-4">
              Price Comparison for {service}
            </h3>

            <div className="bg-green-100 border border-green-300 p-4 rounded-lg mb-6">
              <p className="font-semibold text-green-800">
                Potential Savings: ₹{calculateSavings()}
              </p>

              <p className="text-sm text-green-700">
                By choosing the lowest priced hospital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {results.map((item) => (
                <HospitalCard
                  key={item.hospitalId}
                  item={item}
                  onBook={setSelectedHospital}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Hospitals */}
      <section className="max-w-7xl mx-auto px-8 mt-10">
        <h2 className="text-3xl font-bold mb-6">Featured Hospitals</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredHospitals.map((hospital) => (
            <div
              key={hospital.name}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold text-gray-900">
                {hospital.name}
              </h3>

              <p className="text-gray-600 mt-2">{hospital.location}</p>

              <p className="text-yellow-600 font-semibold mt-3">
                ⭐ {hospital.rating}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="max-w-7xl mx-auto px-8 mt-10 pb-12">
        <h2 className="text-3xl font-bold mb-6">Why Choose MediCompare?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold text-blue-700">Compare Prices</h3>

            <p className="text-gray-600 mt-2">
              Compare medical service prices across multiple hospitals before
              making a decision.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold text-green-700">
              Trusted Hospitals
            </h3>

            <p className="text-gray-600 mt-2">
              View hospital ratings, locations, and available healthcare
              services.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold text-purple-700">
              Easy Appointments
            </h3>

            <p className="text-gray-600 mt-2">
              Book appointments online and manage them from your profile page.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h2 className="text-xl font-bold text-blue-700">MediCompare</h2>

          <p className="text-gray-600 mt-2">
            Compare healthcare prices across trusted hospitals.
          </p>

          <p className="text-sm text-gray-500 mt-4">
            © 2026 MediCompare. All rights reserved.
          </p>
        </div>
      </footer>

      {selectedHospital && (
        <AppointmentModal
          selectedHospital={selectedHospital}
          closeModal={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;