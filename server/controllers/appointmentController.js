import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  try {
    const bookingData = { ...req.body };
    if (!bookingData.bookingRef) {
      bookingData.bookingRef = `MED-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const appointment = await Appointment.create(bookingData);

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const { userId } = req.query;

    if (userId) {
      const appointments = await Appointment.find({ userId }).sort({
        createdAt: -1,
      });

      return res.json(appointments);
    }

    const appointments = await Appointment.find().sort({
      createdAt: -1,
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};