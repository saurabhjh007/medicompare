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

  const searchService = async () => {
    if (!service) {
      alert("Please enter a service name");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `https://medicompare-7rv1.onrender.com/api/hospitals/search?service=${service}`
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white py-5 px-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">MediCompare</h1>
          <p>Welcome, {user?.name}</p>
        </div>

        <Link
          to="/profile"
          className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold"
        >
          Profile
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Search Medical Service</h2>

        <SearchBar
          service={service}
          setService={setService}
          searchService={searchService}
          loading={loading}
        />

        {results.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">
              Price Comparison for {service}
            </h3>

            <div className="bg-green-100 border border-green-300 p-4 rounded-lg mb-5">
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
        )}
      </div>

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