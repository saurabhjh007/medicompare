import React from "react";

function AppointmentSlipModal({ appointment, onClose }) {
  if (!appointment) return null;

  const bookingRef =
    appointment.bookingRef ||
    `MED-${(appointment._id || Date.now().toString()).slice(-6).toUpperCase()}`;

  const qrData = encodeURIComponent(
    `MEDICOMPARE-VERIFIED|REF:${bookingRef}|PATIENT:${appointment.patientName}|HOSPITAL:${appointment.hospitalName}|SERVICE:${appointment.serviceName}|DATE:${appointment.appointmentDate}`
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        {/* Printable Pass Container */}
        <div id="printable-slip" className="p-6 sm:p-8 bg-white text-slate-900">
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Medi<span className="text-indigo-600">Compare</span>
                </h3>
                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Verified Healthcare Booking Pass
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {appointment.status || "Confirmed"}
              </span>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Ref: <span className="font-bold text-slate-700">{bookingRef}</span>
              </p>
            </div>
          </div>

          {/* QR Code & Main Pass Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-200 items-center">
            {/* Left QR Code Box */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&color=1e1b4b&bgcolor=f8fafc`}
                alt="Verification QR Code"
                className="w-32 h-32 rounded-xl shadow-xs border border-slate-200/50"
              />
              <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wider">
                Scan for Verification
              </p>
            </div>

            {/* Right Information Details */}
            <div className="sm:col-span-2 space-y-3.5">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Patient Name
                </span>
                <p className="text-base font-bold text-slate-900">
                  {appointment.patientName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Appointment Date
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {appointment.appointmentDate}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Time Slot
                  </span>
                  <p className="text-sm font-bold text-indigo-600">
                    10:00 AM - 12:30 PM
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Medical Procedure / Service
                </span>
                <p className="text-sm font-bold text-slate-800">
                  {appointment.serviceName}
                </p>
              </div>
            </div>
          </div>

          {/* Hospital & Pricing Info */}
          <div className="py-5 border-b border-slate-200 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned Center
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  {appointment.hospitalName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {appointment.hospitalAddress || "Main Reception Desk / OPD"}
                </p>
              </div>

              {appointment.price ? (
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Guaranteed Rate
                  </span>
                  <p className="text-xl font-extrabold text-emerald-600">
                    ₹{appointment.price.toLocaleString()}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Instructions & Security Watermark */}
          <div className="pt-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mt-4 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Patient Instructions:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Present this QR code or booking reference at the hospital admission desk.</li>
              <li>Please arrive 15 minutes prior to your scheduled slot with a valid government ID.</li>
              <li>Pre-locked rate guaranteed via MediCompare transparency network.</li>
            </ul>
          </div>
        </div>

        {/* Action Controls (Hidden on Print) */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentSlipModal;
