import crypto from "crypto";
import { getRazorpayInstance } from "../config/razorpay.js";
import Appointment from "../models/Appointment.js";

// @desc    Get Razorpay Public Key ID
// @route   GET /api/payments/key
export const getRazorpayKey = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholderKey";
    res.json({ keyId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    const orderReceipt = receipt || `rcpt_${Date.now().toString().slice(-8)}`;

    // If live/test Razorpay API keys are configured, use Razorpay SDK
    if (keyId && keySecret && !keyId.includes("placeholder")) {
      const razorpay = getRazorpayInstance();
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: orderReceipt,
        payment_capture: 1,
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        order,
        keyId,
        isSimulated: false,
      });
    }

    // Dev/Sandbox Fallback: If keys are not set yet, simulate an official Razorpay order format
    const mockOrder = {
      id: `order_test_${Date.now()}`,
      entity: "order",
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: "INR",
      receipt: orderReceipt,
      status: "created",
      attempts: 0,
      created_at: Math.floor(Date.now() / 1000),
    };

    return res.status(200).json({
      success: true,
      order: mockOrder,
      keyId: keyId || "rzp_test_demoKey",
      isSimulated: true,
      message: "Development mode order created. Configure real keys in .env for live Razorpay checkout.",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message || "Failed to create payment order" });
  }
};

// @desc    Verify Razorpay Signature & Save Confirmed Appointment
// @route   POST /api/payments/verify
export const verifyPaymentAndBook = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentData,
      isSimulated,
    } = req.body;

    if (!appointmentData) {
      return res.status(400).json({ message: "Appointment details are required" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify signature if real Razorpay transaction
    if (!isSimulated && keySecret && !keySecret.includes("placeholder")) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed: Invalid transaction signature",
        });
      }
    }

    // Generate unique booking reference
    const bookingRef =
      appointmentData.bookingRef ||
      `MED-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the confirmed appointment in MongoDB with payment metadata
    const newAppointment = await Appointment.create({
      userId: appointmentData.userId,
      patientName: appointmentData.patientName,
      hospitalName: appointmentData.hospitalName,
      hospitalAddress: appointmentData.hospitalAddress || "Main Facility Desk",
      serviceName: appointmentData.serviceName,
      price: appointmentData.price || 0,
      appointmentDate: appointmentData.appointmentDate,
      bookingRef,
      status: "Confirmed",
      paymentStatus: appointmentData.paymentStatus || "PAID",
      paymentId: razorpay_payment_id || `PAY-${Date.now().toString().slice(-8)}`,
      orderId: razorpay_order_id || `ORD-${Date.now().toString().slice(-8)}`,
      paymentMethod: appointmentData.paymentMethod || "Razorpay (UPI / Card / NetBanking)",
      paidAmount: appointmentData.price || 0,
    });

    res.status(201).json({
      success: true,
      message: "Payment verified and appointment booked successfully!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment and confirm appointment",
    });
  }
};
