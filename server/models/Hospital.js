import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d",
    },

    rating: {
      type: Number,
      default: 4.0,
    },

    coordinates: {
      lat: Number,
      lng: Number,
    },

    services: [
      {
        serviceName: String,
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;