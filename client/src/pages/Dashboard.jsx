import { useState } from "react";
import api from "../api.js";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar.jsx";
import HospitalCard from "../components/HospitalCard.jsx";
import AppointmentModal from "../components/AppointmentModal.jsx";
import PriceComparisonChart from "../components/PriceComparisonChart.jsx";

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

      const res = await api.get(
        `/hospitals/search?service=${serviceName}`
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
    { name: "MRI Scan", icon: "🧠" },
    { name: "CT Scan", icon: "🩻" },
    { name: "X-Ray", icon: "🦴" },
    { name: "Blood Test", icon: "🩸" },
    { name: "ECG", icon: "💓" },
    { name: "Ultrasound", icon: "🩺" },
  ];

  const featuredHospitals = [
    {
      name: "Apollo Hospital",
      location: "Sector 26, Noida",
      rating: 4.8,
      specialty: "Multispeciality & Surgery",
    },
    {
      name: "Fortis Hospital",
      location: "Sector 62, Noida",
      rating: 4.3,
      specialty: "Cardiology & Diagnostics",
    },
    {
      name: "Max Hospital",
      location: "Sector 19, Noida",
      rating: 4.4,
      specialty: "Oncology & Orthopedics",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Medi<span className="text-indigo-600">Compare</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Transparent Healthcare Rates
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 font-medium text-sm text-slate-600">
            <a href="#dashboard" className="px-4 py-1.5 rounded-full bg-white text-indigo-600 shadow-xs font-semibold">
              Dashboard
            </a>
            <a href="#services" className="px-4 py-1.5 rounded-full hover:text-indigo-600 transition-colors">
              Services
            </a>
            <Link to="/profile" className="px-4 py-1.5 rounded-full hover:text-indigo-600 transition-colors">
              Appointments
            </Link>
          </nav>

          <Link
            to="/profile"
            className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 pl-2 pr-4 py-1.5 rounded-full font-semibold text-sm transition-all border border-slate-200/80"
          >
            <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span>{user?.name || "Profile"}</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="dashboard"
        className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-10 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
      >
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full text-indigo-700 text-xs font-semibold mb-4 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Welcome back, {user?.name}
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Find the Best Healthcare Prices{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 bg-clip-text text-transparent">
              in Seconds.
            </span>
          </h2>

          <p className="text-slate-600 mt-4 text-base sm:text-lg leading-relaxed">
            Compare diagnostic and treatment costs across verified hospitals near you. Make informed decisions and save up to 40% on out-of-pocket bills.
          </p>

          <div className="mt-8 bg-white p-4 sm:p-5 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
            <SearchBar
              service={service}
              setService={setService}
              searchService={() => searchService()}
              loading={loading}
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80"
                alt="Healthcare Facility"
                className="h-64 sm:h-72 w-full object-cover"
              />
              <div className="p-5 bg-gradient-to-b from-white to-slate-50">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Pricing
                </div>
                <h3 className="font-bold text-lg text-slate-800 mt-1">
                  Transparent Hospital Rates
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Instant, reliable quotes before booking consultations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hospitals Listed</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">50+</h3>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medical Services</p>
            <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">100+</h3>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointments Made</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">500+</h3>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Savings</p>
            <h3 className="text-3xl font-extrabold text-amber-500 mt-1">40%</h3>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="max-w-7xl mx-auto px-6 sm:px-8 w-full mt-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Popular Procedures</h2>

          <div className="flex flex-wrap gap-2.5">
            {popularServices.map((item) => (
              <button
                key={item.name}
                onClick={() => searchService(item.name)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-95"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      {results.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full mt-10">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Comparison Results for <span className="text-indigo-600">{service}</span>
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Found {results.length} hospitals providing this procedure.
                </p>
              </div>

              {calculateSavings() > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                    ₹
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Max Potential Savings</p>
                    <p className="text-base font-extrabold text-emerald-700">₹{calculateSavings().toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            <PriceComparisonChart data={results} serviceName={service} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
      <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Centers</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredHospitals.map((hospital) => (
            <div
              key={hospital.name}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-900">
                    {hospital.name}
                  </h3>
                  <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                    ★ {hospital.rating}
                  </span>
                </div>

                <p className="text-slate-400 text-xs mt-1">{hospital.specialty}</p>
                <p className="text-slate-600 text-sm mt-3 flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{hospital.location}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full mt-12 mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Patients Choose MediCompare</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 text-lg">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900">Clear Rate Comparisons</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              No hidden charges. Compare procedure prices across hospitals before you schedule an appointment.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-lg">
              🏥
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Healthcare Providers</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              All listed hospitals and diagnostic labs undergo verification for quality and accreditation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 text-lg">
              📅
            </div>
            <h3 className="text-lg font-bold text-slate-900">Direct Online Booking</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Book your slot seamlessly with real-time confirmations right from your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold">MediCompare</h2>
            <p className="text-slate-400 text-xs mt-1">
              Transparent, Accessible, and Reliable Healthcare.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MediCompare. All rights reserved.
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