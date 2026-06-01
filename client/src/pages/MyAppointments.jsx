import { useEffect, useState } from "react";
import axios from "axios";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  const getAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments");
      setAppointments(res.data);
    } catch (error) {
      alert("Failed to fetch appointments");
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">My Appointments</h2>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments booked yet.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((item) => (
            <div key={item._id} className="border p-4 rounded-lg">
              <h3 className="text-lg font-bold">{item.serviceName}</h3>
              <p>{item.hospitalName}</p>
              <p className="text-gray-600">Patient: {item.patientName}</p>
              <p className="text-gray-600">Date: {item.appointmentDate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;