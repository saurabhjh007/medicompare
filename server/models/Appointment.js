import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    hospitalName: {
      type: String,
      required: true,
    },

    hospitalAddress: {
      type: String,
      default: "Main Hospital Facility",
    },

    serviceName: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    appointmentDate: {
      type: String,
      required: true,
    },

    bookingRef: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      default: "Confirmed",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;