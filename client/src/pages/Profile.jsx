import { useEffect, useState } from "react";
import api from "../api.js";
import { Link } from "react-router-dom";
import AppointmentSlipModal from "../components/AppointmentSlipModal.jsx";

function Profile() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const getAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/appointments?userId=${user.id}`);
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header / Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3.5 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 font-bold">
              +
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Medi<span className="text-indigo-600">Compare</span>
              </h1>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full font-semibold text-sm transition-all border border-slate-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Profile Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm sticky top-24">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-3xl flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-indigo-600/20 mb-4">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
                <span className="mt-3 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Verified Patient Account
                </span>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bookings</p>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                    {appointments.length}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Digital Passes</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                    {appointments.length}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 py-3 rounded-2xl font-semibold text-sm transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Right Appointment List */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    My Appointments & Passes
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    View, download, or print official hospital booking verification slips.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm font-medium">Loading your records...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-xs flex items-center justify-center text-2xl mx-auto mb-3">
                    📋
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No Appointments Yet</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                    Search procedures on the dashboard to compare rates and book your first slot.
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-block mt-5 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-600/20"
                  >
                    Compare Procedures Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((item) => (
                    <div
                      key={item._id}
                      className="group bg-slate-50 hover:bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {item.status || "Confirmed"}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {item.bookingRef || `MED-${item._id.slice(-6).toUpperCase()}`}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.serviceName}
                        </h3>

                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          <span>🏥</span>
                          <span>{item.hospitalName}</span>
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                          <span>Patient: <strong className="text-slate-700">{item.patientName}</strong></span>
                          <span>Date: <strong className="text-slate-700">{item.appointmentDate}</strong></span>
                          {item.price ? (
                            <span>Rate: <strong className="text-emerald-600">₹{item.price.toLocaleString()}</strong></span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <button
                          onClick={() => setSelectedPass(item)}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          <span>View & Print Pass</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Appointment Slip Modal */}
      {selectedPass && (
        <AppointmentSlipModal
          appointment={selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}
    </div>
  );
}

export default Profile;