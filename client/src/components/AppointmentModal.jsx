import { useState } from "react";
import api from "../api.js";
import AppointmentSlipModal from "./AppointmentSlipModal.jsx";
import { loadRazorpayScript } from "../utils/loadRazorpay.js";

function AppointmentModal({ selectedHospital, closeModal }) {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("online"); // 'online' (Razorpay) or 'offline' (Pay at Hospital)
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [bookedAppointment, setBookedAppointment] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Direct Booking without Online Payment (Pay at Hospital Desk)
  const handleOfflineBooking = async () => {
    try {
      setLoading(true);
      setStatusMessage("Securing your appointment slot...");

      const res = await api.post("/appointments", {
        userId: user.id || user._id,
        patientName,
        hospitalName: selectedHospital.hospitalName,
        hospitalAddress: `${selectedHospital.address || ""}, ${selectedHospital.city || ""}`.trim(),
        serviceName: selectedHospital.serviceName,
        price: selectedHospital.price,
        appointmentDate,
        paymentStatus: "PAY_AT_HOSPITAL",
        paymentMethod: "Pay at Hospital Desk",
        paidAmount: 0,
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
          paymentStatus: "PAY_AT_HOSPITAL",
          paymentMethod: "Pay at Hospital Desk",
        }
      );
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.message || "Appointment booking failed. Please try again.");
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  // Online Payment via Razorpay
  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      setStatusMessage("Loading Razorpay Secure Gateway...");

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        setLoading(false);
        return;
      }

      setStatusMessage("Creating secure payment order...");

      // 1. Create order on backend
      const orderRes = await api.post("/payments/create-order", {
        amount: selectedHospital.price,
        receipt: `rcpt_${Date.now().toString().slice(-6)}`,
      });

      const { order, keyId, isSimulated } = orderRes.data;

      // 2. Prepare appointment payload
      const appointmentPayload = {
        userId: user.id || user._id,
        patientName,
        hospitalName: selectedHospital.hospitalName,
        hospitalAddress: `${selectedHospital.address || ""}, ${selectedHospital.city || ""}`.trim(),
        serviceName: selectedHospital.serviceName,
        price: selectedHospital.price,
        appointmentDate,
        paymentStatus: "PAID",
        paymentMethod: "Razorpay (UPI / Card / NetBanking)",
        paidAmount: selectedHospital.price,
      };

      // 3. Handle Sandbox / Simulated Key mode gracefully if real Razorpay keys are not provided
      if (isSimulated || !keyId || keyId.includes("placeholder") || keyId.includes("demoKey")) {
        setStatusMessage("Processing simulated Razorpay payment...");
        setTimeout(async () => {
          try {
            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: order.id,
              razorpay_payment_id: `pay_sim_${Date.now().toString().slice(-8)}`,
              razorpay_signature: "simulated_signature",
              appointmentData: appointmentPayload,
              isSimulated: true,
            });

            setBookedAppointment(verifyRes.data.appointment);
          } catch (err) {
            alert(err.response?.data?.message || "Payment verification failed.");
          } finally {
            setLoading(false);
            setStatusMessage("");
          }
        }, 1200);
        return;
      }

      // 4. Trigger Official Razorpay Modal
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "MediCompare Healthcare",
        description: `Booking for ${selectedHospital.serviceName} at ${selectedHospital.hospitalName}`,
        image: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
        order_id: order.id,
        handler: async function (response) {
          try {
            setLoading(true);
            setStatusMessage("Verifying payment signature with server...");

            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentData: appointmentPayload,
              isSimulated: false,
            });

            setBookedAppointment(verifyRes.data.appointment);
          } catch (verifyErr) {
            alert(
              verifyErr.response?.data?.message ||
                "Payment was successful, but server verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
            setStatusMessage("");
          }
        },
        prefill: {
          name: patientName,
          email: user.email || "patient@medicompare.com",
          contact: patientPhone || "9999999999",
        },
        theme: {
          color: "#4f46e5", // Indigo-600 to match MediCompare theme
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setStatusMessage("");
          },
        },
      };

      const razorpayPaymentWindow = new window.Razorpay(options);
      razorpayPaymentWindow.on("payment.failed", function (response) {
        alert(`Payment Failed: ${response.error.description || "Transaction cancelled"}`);
        setLoading(false);
        setStatusMessage("");
      });

      razorpayPaymentWindow.open();
      setLoading(false);
      setStatusMessage("");
    } catch (error) {
      console.error("Razorpay initiation error:", error);
      alert(error.response?.data?.message || "Failed to initiate Razorpay payment");
      setLoading(false);
      setStatusMessage("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert("Please enter the patient's full name.");
      return;
    }
    if (!appointmentDate) {
      alert("Please select a preferred appointment date.");
      return;
    }

    if (paymentMode === "online") {
      handleRazorpayPayment();
    } else {
      handleOfflineBooking();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-xs">
              🏥
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Schedule & Confirm</h3>
              <p className="text-xs text-slate-500 font-medium">Guaranteed price transparency reservation</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Selected Procedure & Hospital Preview */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 rounded-2xl border border-indigo-100/60 mb-5 space-y-2.5 text-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium">Hospital / Center:</span>
            <span className="font-bold text-slate-900 text-right max-w-[65%]">
              {selectedHospital.hospitalName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Medical Procedure:</span>
            <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md text-xs">
              {selectedHospital.serviceName}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200/80">
            <span className="text-slate-600 font-semibold">Total Locked Price:</span>
            <span className="text-xl font-black text-emerald-600">
              ₹{selectedHospital.price?.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Details */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Payment Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Razorpay Option */}
              <div
                onClick={() => setPaymentMode("online")}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMode === "online"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    Razorpay Online
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Fast Pass
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  UPI (GPay / PhonePe), Cards & NetBanking with instant verified slip.
                </p>
              </div>

              {/* Pay at Hospital Option */}
              <div
                onClick={() => setPaymentMode("offline")}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMode === "offline"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Pay at Hospital
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pay directly at the hospital counter during your appointment visit.
                </p>
              </div>
            </div>
          </div>

          {/* Status feedback message */}
          {statusMessage && (
            <div className="text-xs font-medium text-indigo-600 bg-indigo-50 p-2.5 rounded-xl flex items-center gap-2 animate-pulse">
              <svg className="animate-spin h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : paymentMode === "online" ? (
                <span>Pay ₹{selectedHospital.price?.toLocaleString()} via Razorpay</span>
              ) : (
                <span>Confirm & Reserve Slot</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentModal;