import { useEffect, useState } from "react";
import api from "../api.js";
import { Link, useParams } from "react-router-dom";
import AppointmentModal from "../components/AppointmentModal.jsx";

function HospitalDetails() {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const defaultImage =
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d";

  useEffect(() => {
    const getHospital = async () => {
      try {
        const res = await api.get(
          `/hospitals/${id}`
        );

        setHospital(res.data);
      } catch (error) {
        alert("Failed to load hospital details");
      } finally {
        setLoading(false);
      }
    };

    getHospital();
  }, [id]);

  const openBooking = (service) => {
    setSelectedService({
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      address: hospital.address,
      city: hospital.city,
      rating: hospital.rating,
      image: hospital.image,
      coordinates: hospital.coordinates,
      serviceName: service.serviceName,
      price: service.price,
    });
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const res = await api.post(`/hospitals/${id}/reviews`, {
        userId: user.id || user._id,
        userName: user.name,
        rating,
        comment,
      });

      setHospital((prev) => ({
        ...prev,
        reviews: res.data.reviews,
        rating: res.data.rating,
      }));

      setComment("");
      setRating(5);
      alert("Review submitted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">
          Loading hospital details...
        </p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Hospital not found</h1>

          <Link
            to="/dashboard"
            className="inline-block mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">MediCompare</h1>
            <p className="text-sm text-gray-500">Hospital Details</p>
          </div>

          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <img
            src={hospital.image || defaultImage}
            alt={hospital.name}
            className="w-full h-80 object-cover"
          />

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">
                  {hospital.name}
                </h2>

                <p className="text-gray-600 mt-3">{hospital.address}</p>
                <p className="text-gray-500">{hospital.city}</p>
              </div>

              <span className="self-start bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">
                ⭐ {hospital.rating}
              </span>
            </div>

            <div className="mt-6">
              <a
                href={`https://www.google.com/maps?q=${hospital.coordinates?.lat},${hospital.coordinates?.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block border border-blue-600 text-blue-600 px-5 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>

        <section className="mt-8 bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold">Available Services</h2>
              <p className="text-gray-600 mt-1">
                Compare available medical services and book an appointment.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {hospital.services.map((service) => (
              <div
                key={service._id}
                className="border rounded-xl p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div>
                  <h3 className="text-xl font-bold">
                    {service.serviceName}
                  </h3>

                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ₹{service.price}
                  </p>
                </div>

                <button
                  onClick={() => openBooking(service)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-8">
            <h2 className="text-3xl font-bold mb-6">Patient Reviews</h2>
            {!hospital.reviews || hospital.reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to leave one!</p>
            ) : (
              <div className="space-y-6">
                {hospital.reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-900">{review.userName}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex text-yellow-500 font-semibold text-sm">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="bg-white rounded-2xl shadow p-8 h-fit">
            <h3 className="text-2xl font-bold mb-4">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition ${
                      star <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                placeholder="Share your experience..."
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              onClick={submitReview}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Submit Review
            </button>
          </div>
        </section>
      </main>

      {selectedService && (
        <AppointmentModal
          selectedHospital={selectedService}
          closeModal={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

export default HospitalDetails;