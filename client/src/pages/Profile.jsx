import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const getAppointments = async () => {
    try {
      const res = await axios.get(
        `https://medicompare-7rv1.onrender.com/api/appointments?userId=${user.id}`
      );

      setAppointments(res.data);
    } catch (error) {
      alert("Failed to fetch appointments");
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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white py-5 px-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p>Manage your account and appointments</p>
        </div>

        <Link
          to="/dashboard"
          className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Personal Information</h2>

        <p className="mb-2">
          <strong>Name:</strong> {user?.name}
        </p>

        <p className="mb-2">
          <strong>Email:</strong> {user?.email}
        </p>

        <p>
          <strong>Total Appointments:</strong> {appointments.length}
        </p>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
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

        <button
          onClick={logout}
          className="mt-6 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;