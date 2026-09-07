import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholderKey";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholderSecret";

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (error) {
    console.error("Razorpay initialization error:", error.message);
  }

  return razorpayInstance;
};

export default getRazorpayInstance;
