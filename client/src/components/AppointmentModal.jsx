import { useState } from "react";
import api from "../api.js";
import AppointmentSlipModal from "./AppointmentSlipModal.jsx";

function AppointmentModal({ selectedHospital, closeModal }) {
  const [patientName, setPatientName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const bookAppointment = async () => {
    if (!patientName || !appointmentDate) {
      alert("Please fill in the patient name and appointment date");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/appointments", {
        userId: user.id,
        patientName,
        hospitalName: selectedHospital.hospitalName,
        hospitalAddress: `${selectedHospital.address || ""}, ${selectedHospital.city || ""}`.trim(),
        serviceName: selectedHospital.serviceName,
        price: selectedHospital.price,
        appointmentDate,
      });

      setBookedAppointment(
        res.data.appointment || {
          patientName,
          hospitalName: selectedHospital.hospitalName,
          hospitalAddress: `${selectedHospital.address || ""}, ${selectedHospital.city || ""}`,
          serviceName: selectedHospital.serviceName,
          price: selectedHospital.price,
          appointmentDate,
          status: "Confirmed",
        }
      );
    } catch (error) {
      alert("Appointment booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (bookedAppointment) {
    return (
      <AppointmentSlipModal
        appointment={bookedAppointment}
        onClose={closeModal}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              📅
            </div>
            <h3 className="text-xl font-bold text-slate-900">Schedule Booking</h3>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Selected Details Preview */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Hospital:</span>
            <span className="font-bold text-slate-900 text-right">
              {selectedHospital.hospitalName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Procedure:</span>
            <span className="font-semibold text-indigo-600">
              {selectedHospital.serviceName}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Guaranteed Price:</span>
            <span className="text-lg font-extrabold text-emerald-600">
              ₹{selectedHospital.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Patient Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Appointment Date
            </label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={closeModal}
            className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={bookAppointment}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Booking...</span>
              </>
            ) : (
              <span>Confirm & Get Pass</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentModal;