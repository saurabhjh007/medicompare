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
      <div className="bg-blue-600 text-white py-6 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">My Profile</h1>
            <p className="text-blue-100 mt-1">
              Manage your account and appointment history
            </p>
          </div>

          <Link
            to="/dashboard"
            className="bg-white text-blue-600 px-5 py-3 rounded-lg font-semibold hover:bg-blue-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow md:col-span-1">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-gray-600 mt-1">{user?.email}</p>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600">Total Appointments</p>
            <h3 className="text-3xl font-bold text-blue-700">
              {appointments.length}
            </h3>
          </div>

          <button
            onClick={logout}
            className="mt-6 w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">My Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No appointments booked yet.
              </p>

              <Link
                to="/dashboard"
                className="inline-block mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-xl p-5 hover:shadow transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {item.serviceName}
                      </h3>

                      <p className="text-gray-700 mt-1">
                        {item.hospitalName}
                      </p>

                      <p className="text-gray-600 mt-1">
                        Patient: {item.patientName}
                      </p>

                      <p className="text-gray-600 mt-1">
                        Date: {item.appointmentDate}
                      </p>
                    </div>

                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;