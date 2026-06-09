import { useState } from "react";
import axios from "axios";

function AppointmentModal({ selectedHospital, closeModal }) {
  const [patientName, setPatientName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const bookAppointment = async () => {
    if (!patientName || !appointmentDate) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post("https://medicompare-7rv1.onrender.com/api/appointments", {
        userId: user.id,
        patientName,
        hospitalName: selectedHospital.hospitalName,
        serviceName: selectedHospital.serviceName,
        appointmentDate,
      });

      alert("Appointment booked successfully");
      closeModal();
    } catch (error) {
      alert("Appointment booking failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>

        <p className="mb-2">
          <strong>Hospital:</strong> {selectedHospital.hospitalName}
        </p>

        <p className="mb-4">
          <strong>Service:</strong> {selectedHospital.serviceName}
        </p>

        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="w-full border p-3 rounded-lg mb-3"
        />

        <input
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={bookAppointment}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Confirm
          </button>

          <button
            onClick={closeModal}
            className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentModal;