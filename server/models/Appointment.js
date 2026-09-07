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

    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "PAY_AT_HOSPITAL"],
      default: "PAID",
    },

    paymentId: {
      type: String,
      default: "",
    },

    orderId: {
      type: String,
      default: "",
    },

    paymentMethod: {
      type: String,
      default: "Razorpay Online",
    },

    paidAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;