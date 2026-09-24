import Hospital from "../models/Hospital.js";
import { extractTestsFromPrescription } from "../services/geminiService.js";

/**
 * Common medical synonym dictionary to improve matching between extracted AI test names
 * and database hospital service names.
 */
const MEDICAL_SYNONYMS = {
  cbc: ["cbc", "complete blood count", "hemogram", "blood test", "blood count"],
  mri: ["mri", "magnetic resonance imaging", "magnetic resonance", "mri scan"],
  ct: ["ct scan", "computed tomography", "cat scan", "ct"],
  xray: ["x-ray", "x ray", "radiography", "radiograph"],
  ultrasound: ["ultrasound", "usg", "sonography", "sonogram"],
  ecg: ["ecg", "ekg", "electrocardiogram"],
  lft: ["lft", "liver function test", "liver function"],
  kft: ["kft", "rft", "kidney function test", "renal function test"],
  lipid: ["lipid profile", "lipid panel", "cholesterol test", "lipid"],
  thyroid: ["thyroid profile", "thyroid test", "tsh", "t3 t4 tsh", "thyroid"],
  hba1c: ["hba1c", "glycated hemoglobin", "sugar test", "glucose test"],
};

/**
 * Finds the best matching service from a hospital's services list for a given test name.
 */
const matchService = (services, testName) => {
  if (!services || !Array.isArray(services) || !testName) return null;

  const cleanQuery = testName.toLowerCase().trim();

  // 1. Exact or direct substring match
  for (const item of services) {
    if (!item.serviceName) continue;
    const cleanServiceName = item.serviceName.toLowerCase().trim();
    if (
      cleanServiceName === cleanQuery ||
      cleanServiceName.includes(cleanQuery) ||
      cleanQuery.includes(cleanServiceName)
    ) {
      return item;
    }
  }

  // 2. Medical synonym match
  for (const [key, synonyms] of Object.entries(MEDICAL_SYNONYMS)) {
    const queryMatchesKey =
      cleanQuery.includes(key) ||
      synonyms.some((syn) => cleanQuery.includes(syn));

    if (queryMatchesKey) {
      for (const item of services) {
        if (!item.serviceName) continue;
        const cleanServiceName = item.serviceName.toLowerCase();
        if (
          cleanServiceName.includes(key) ||
          synonyms.some((syn) => cleanServiceName.includes(syn))
        ) {
          return item;
        }
      }
    }
  }

  // 3. Significant word token overlap (words with 3+ characters)
  const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 2);
  for (const item of services) {
    if (!item.serviceName) continue;
    const cleanServiceName = item.serviceName.toLowerCase();
    const tokenMatch = tokens.some((token) => cleanServiceName.includes(token));
    if (tokenMatch) {
      return item;
    }
  }

  return null;
};

/**
 * Controller to handle prescription upload and AI extraction
 */
export const analyzePrescription = async (req, res) => {
  try {
    // 1. File existence validation
    if (!req.file) {
      return res.status(400).json({
        message: "No prescription file uploaded. Please select an image or PDF file.",
      });
    }

    // 2. Call Gemini service with in-memory buffer
    const extractionResult = await extractTestsFromPrescription(
      req.file.buffer,
      req.file.mimetype
    );

    // 3. Robust validation & normalization of AI response
    if (!extractionResult || typeof extractionResult !== "object") {
      return res.status(502).json({
        message: "The AI service returned an unrecognized structure. Please try again.",
      });
    }

    const rawTests = Array.isArray(extractionResult.tests)
      ? extractionResult.tests
      : [];

    // Clean, sanitize, and validate each extracted test
    const sanitizedTests = rawTests
      .map((test, index) => {
        if (!test || typeof test !== "object") return null;
        const name = typeof test.name === "string" ? test.name.trim() : "";
        const category =
          typeof test.category === "string" && test.category.trim()
            ? test.category.trim()
            : "Diagnostic";
        const notes = typeof test.notes === "string" ? test.notes.trim() : "";

        if (!name) return null;

        return {
          id: `test-${Date.now()}-${index}`,
          name,
          category,
          notes,
          confirmed: true, // Default to confirmed for the confirmation review step
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      message:
        sanitizedTests.length > 0
          ? `Successfully extracted ${sanitizedTests.length} diagnostic test(s).`
          : "No diagnostic tests or scans were identified in this document.",
      isPrescriptionValid: Boolean(extractionResult.isPrescriptionValid),
      doctorNotes: extractionResult.doctorNotes || "",
      tests: sanitizedTests,
      fileMeta: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Prescription Analysis Controller Error:", error);

    // Provide friendly error message depending on error type
    let userMessage = "Failed to analyze prescription. Please try again.";
    let statusCode = 500;

    if (error.message?.includes("GEMINI_API_KEY")) {
      userMessage = "Gemini API key is missing or not configured on the server.";
      statusCode = 500;
    } else if (error.message?.includes("API key not valid") || error.status === 400) {
      userMessage = "Invalid Gemini API key or configuration error.";
      statusCode = 401;
    } else if (error.message?.includes("quota") || error.status === 429) {
      userMessage = "Gemini API rate limit or quota exceeded. Please try again in a moment.";
      statusCode = 429;
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage,
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Controller to compare prices across hospitals for user-confirmed tests from the prescription.
 */
export const comparePrescriptionTests = async (req, res) => {
  try {
    const { tests } = req.body;

    if (!tests || !Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one confirmed diagnostic test to compare.",
      });
    }

    // Extract test names list
    const testNames = tests
      .map((t) => (typeof t === "string" ? t : t.name))
      .filter(Boolean);

    if (testNames.length === 0) {
      return res.status(400).json({
        message: "No valid test names provided.",
      });
    }

    // Query all hospitals from existing MongoDB database
    const allHospitals = await Hospital.find();

    const comparisonResults = [];

    allHospitals.forEach((hospital) => {
      const breakdown = [];
      let totalPackagePrice = 0;

      testNames.forEach((testName) => {
        const matchedItem = matchService(hospital.services, testName);
        if (matchedItem) {
          breakdown.push({
            testName,
            matchedServiceName: matchedItem.serviceName,
            price: matchedItem.price,
            available: true,
          });
          totalPackagePrice += matchedItem.price;
        } else {
          breakdown.push({
            testName,
            matchedServiceName: null,
            price: null,
            available: false,
          });
        }
      });

      const matchedCount = breakdown.filter((b) => b.available).length;

      // Include hospital if it matches at least one of the tests
      if (matchedCount > 0) {
        comparisonResults.push({
          hospitalId: hospital._id,
          hospitalName: hospital.name,
          address: hospital.address,
          city: hospital.city,
          image: hospital.image,
          rating: hospital.rating,
          coordinates: hospital.coordinates,
          matchedCount,
          totalTests: testNames.length,
          allMatched: matchedCount === testNames.length,
          totalPackagePrice,
          breakdown,
        });
      }
    });

    // Sort: Full matches first, then lowest total package price
    comparisonResults.sort((a, b) => {
      if (a.allMatched !== b.allMatched) {
        return a.allMatched ? -1 : 1;
      }
      return a.totalPackagePrice - b.totalPackagePrice;
    });

    // Calculate maximum potential savings among hospitals that provide all or same number of tests
    let maxSavings = 0;
    const fullMatchHospitals = comparisonResults.filter((h) => h.allMatched);
    if (fullMatchHospitals.length >= 2) {
      maxSavings =
        fullMatchHospitals[fullMatchHospitals.length - 1].totalPackagePrice -
        fullMatchHospitals[0].totalPackagePrice;
    } else if (comparisonResults.length >= 2) {
      maxSavings =
        comparisonResults[comparisonResults.length - 1].totalPackagePrice -
        comparisonResults[0].totalPackagePrice;
    }

    res.json({
      success: true,
      totalTestsRequested: testNames.length,
      requestededTestNames: testNames,
      hospitalsFoundCount: comparisonResults.length,
      maxPotentialSavings: Math.max(0, maxSavings),
      hospitals: comparisonResults,
    });
  } catch (error) {
    console.error("Prescription Tests Comparison Error:", error);
    res.status(500).json({
      message: "Failed to compare hospital prices for the selected tests.",
      error: error.message,
    });
  }
};
