import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);

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