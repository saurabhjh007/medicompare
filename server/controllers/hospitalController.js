import Hospital from "../models/Hospital.js";

export const addHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json({
      message: "Hospital added successfully",
      hospital,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();

    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchService = async (req, res) => {
  try {
    const { service } = req.query;

    if (!service) {
      return res.status(400).json({
        message: "Service name is required",
      });
    }

    const hospitals = await Hospital.find({
      "services.serviceName": { $regex: service, $options: "i" },
    });

    const results = [];

    hospitals.forEach((hospital) => {
      hospital.services.forEach((item) => {
        if (
          item.serviceName.toLowerCase().includes(service.toLowerCase())
        ) {
          results.push({
            hospitalId: hospital._id,
            hospitalName: hospital.name,
            address: hospital.address,
            city: hospital.city,
            image: hospital.image,
            rating: hospital.rating,
            serviceName: item.serviceName,
            price: item.price,
            coordinates: hospital.coordinates,
          });
        }
      });
    });

    results.sort((a, b) => a.price - b.price);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.json({
      message: "Hospital deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.json({
      message: "Hospital updated successfully",
      hospital,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.json(hospital);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};