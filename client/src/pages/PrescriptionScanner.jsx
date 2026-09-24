import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import AppointmentModal from "../components/AppointmentModal.jsx";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/heic",
  "application/pdf",
];

function PrescriptionScanner() {
  // Step state: 1 = Upload, 2 = Confirm/Edit Tests, 3 = Hospital Comparison
  const [step, setStep] = useState(1);

  // Upload state
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Extracted tests state (Step 2)
  const [extractedData, setExtractedData] = useState(null);
  const [tests, setTests] = useState([]);
  const [newTestName, setNewTestName] = useState("");
  const [newTestCategory, setNewTestCategory] = useState("Laboratory");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");

  // Comparison state (Step 3)
  const [comparing, setComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState(null);

  // File validation
  const validateAndSelectFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError(
        "Unsupported file format. Please upload an image (JPG, PNG, WEBP) or PDF prescription."
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller file.`);
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSelectFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 1. Analyze Prescription with Gemini API
  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a prescription file first.");
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);

      const formData = new FormData();
      formData.append("prescription", file);

      const res = await api.post("/prescriptions/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setExtractedData(res.data);
      setTests(res.data.tests || []);
      setStep(2); // Move to review & confirm step
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        "Failed to analyze prescription. Please ensure GEMINI_API_KEY is configured and try again.";
      setError(serverMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  // Toggle test inclusion
  const toggleTestConfirmation = (id) => {
    setTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, confirmed: !t.confirmed } : t))
    );
  };

  // Delete test
  const handleDeleteTest = (id) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  // Start editing a test name
  const startEditTest = (test) => {
    setEditingTestId(test.id);
    setEditNameValue(test.name);
  };

  // Save edited test name
  const saveEditTest = (id) => {
    if (!editNameValue.trim()) return;
    setTests((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: editNameValue.trim() } : t
      )
    );
    setEditingTestId(null);
    setEditNameValue("");
  };

  // Add a manual test
  const handleAddManualTest = (e) => {
    e.preventDefault();
    if (!newTestName.trim()) return;

    const newTest = {
      id: `manual-${Date.now()}`,
      name: newTestName.trim(),
      category: newTestCategory,
      notes: "Manually added by user",
      confirmed: true,
    };

    setTests((prev) => [...prev, newTest]);
    setNewTestName("");
    setShowAddForm(false);
  };

  // 2. Compare Confirmed Tests Across Hospitals
  const handleCompareHospitalPrices = async () => {
    const confirmedTests = tests.filter((t) => t.confirmed);
    if (confirmedTests.length === 0) {
      setError("Please select at least one test to compare hospital prices.");
      return;
    }

    try {
      setComparing(true);
      setError(null);

      const res = await api.post("/prescriptions/compare-tests", {
        tests: confirmedTests.map((t) => ({ name: t.name, category: t.category })),
      });

      setComparisonResults(res.data);
      setStep(3); // Move to comparison results step
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to compare hospital prices. Please try again."
      );
    } finally {
      setComparing(false);
    }
  };

  const confirmedCount = tests.filter((t) => t.confirmed).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3.5 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Medi<span className="text-indigo-600">Compare</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Transparent Healthcare Rates
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="px-4 py-1.5 rounded-full hover:bg-slate-100 text-slate-600 font-semibold text-sm transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-8 w-full flex-1">
        {/* Step Indicator Progress Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 z-0"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            ></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors ${
                  step >= 1 ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-white text-slate-400 border border-slate-300"
                }`}
              >
                1
              </div>
              <span className="text-xs font-semibold text-slate-600 mt-1.5">Upload</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors ${
                  step >= 2 ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-white text-slate-400 border border-slate-300"
                }`}
              >
                2
              </div>
              <span className="text-xs font-semibold text-slate-600 mt-1.5">Review Tests</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors ${
                  step >= 3 ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-white text-slate-400 border border-slate-300"
                }`}
              >
                3
              </div>
              <span className="text-xs font-semibold text-slate-600 mt-1.5">Compare Prices</span>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 shadow-xs">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold">Notice</p>
              <p className="mt-0.5 text-rose-600">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">✕</button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: UPLOAD & GEMINI SCAN */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full text-indigo-700 text-xs font-semibold mb-3 tracking-wide">
                <span>✨</span> Gemini Multimodal Vision AI
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Upload Prescription / Doctor's Note
              </h2>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Our AI will extract all prescribed lab investigations and radiology scans so you can compare hospital bundle rates.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm max-w-2xl mx-auto">
              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-indigo-600 bg-indigo-50/50 scale-[0.99]"
                      : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.heic"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl shadow-inner">
                    📄
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Click to select or drag & drop prescription
                  </h3>
                  <p className="text-sm text-slate-500 mt-1.5">
                    Supports JPG, PNG, WEBP, and PDF documents (up to {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File meta card */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3.5 truncate">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                        {file.type.includes("pdf") ? "PDF" : "IMG"}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate text-sm">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || "Document"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={analyzing}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Image preview */}
                  {previewUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 max-h-80 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Prescription preview"
                        className="max-h-80 w-auto object-contain"
                      />
                    </div>
                  )}

                  {/* Analyze Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-slate-500">
                      🔒 Processed securely in RAM. AI extracts tests without diagnosing illnesses.
                    </p>
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      {analyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Extracting Tests with Gemini AI...</span>
                        </>
                      ) : (
                        <>
                          <span>✨ Analyze Prescription</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: REVIEW & CONFIRM EXTRACTED TESTS */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-emerald-700 text-xs font-semibold mb-2">
                  <span>✅</span> AI Extraction Complete
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Review & Confirm Prescribed Tests
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Check, edit, or add tests before we compare rates across hospitals.
                </p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                🔄 Upload Different File
              </button>
            </div>

            {/* Doctor / AI observation notes if present */}
            {extractedData?.doctorNotes && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-sm text-indigo-900 flex items-start gap-3">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <span className="font-semibold text-indigo-950">AI Observation: </span>
                  <span>{extractedData.doctorNotes}</span>
                </div>
              </div>
            )}

            {/* Tests List Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-base">
                  Detected Tests ({tests.length})
                </h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {showAddForm ? "✕ Cancel" : "+ Add Missing Test"}
                </button>
              </div>

              {/* Add manual test form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddManualTest}
                  className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Enter test name (e.g. Lipid Profile, Chest X-Ray)"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-sm focus:outline-indigo-600 w-full"
                    autoFocus
                  />
                  <select
                    value={newTestCategory}
                    onChange={(e) => setNewTestCategory(e.target.value)}
                    className="bg-white border border-slate-300 px-3 py-2 rounded-xl text-sm focus:outline-indigo-600 w-full sm:w-auto"
                  >
                    <option value="Laboratory">Laboratory / Blood</option>
                    <option value="Imaging">Imaging / Radiology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="General Diagnostic">General Diagnostic</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer w-full sm:w-auto"
                  >
                    Add
                  </button>
                </form>
              )}

              {tests.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">
                    No diagnostic tests were automatically detected in this document.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100"
                  >
                    + Add Test Manually
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tests.map((test) => (
                    <div
                      key={test.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        test.confirmed
                          ? "bg-slate-50/70 border-slate-200 hover:border-indigo-300"
                          : "bg-slate-100/40 border-dashed border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1">
                        <input
                          type="checkbox"
                          checked={test.confirmed}
                          onChange={() => toggleTestConfirmation(test.id)}
                          className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0"
                          id={`test-check-${test.id}`}
                        />

                        {editingTestId === test.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              className="bg-white border border-indigo-500 px-3 py-1 rounded-lg text-sm flex-1 font-semibold"
                            />
                            <button
                              onClick={() => saveEditTest(test.id)}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTestId(null)}
                              className="px-2.5 py-1 text-slate-500 text-xs hover:text-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor={`test-check-${test.id}`}
                            className="cursor-pointer flex-1"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm sm:text-base">
                                {test.name}
                              </span>
                              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                                {test.category}
                              </span>
                            </div>
                            {test.notes && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                Note: {test.notes}
                              </p>
                            )}
                          </label>
                        )}
                      </div>

                      {editingTestId !== test.id && (
                        <div className="flex items-center gap-2 self-end sm:self-auto pl-8 sm:pl-0">
                          <button
                            type="button"
                            onClick={() => startEditTest(test)}
                            className="text-xs text-slate-500 hover:text-indigo-600 font-semibold px-2 py-1 rounded hover:bg-white"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTest(test.id)}
                            className="text-xs text-slate-400 hover:text-rose-600 font-semibold px-2 py-1 rounded hover:bg-rose-50"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  {confirmedCount} of {tests.length} tests selected for hospital price comparison
                </p>

                <button
                  type="button"
                  onClick={handleCompareHospitalPrices}
                  disabled={comparing || confirmedCount === 0}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {comparing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Comparing Hospital Rates...</span>
                    </>
                  ) : (
                    <>
                      <span>🏥 Compare Prices ({confirmedCount} Tests) →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: HOSPITAL PRICE COMPARISON RESULTS */}
        {/* ========================================================================= */}
        {step === 3 && comparisonResults && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mb-2 flex items-center gap-1"
                >
                  ← Edit Selected Tests
                </button>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Hospital Rate Comparison
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Package rates for {comparisonResults.totalTestsRequested} tests across {comparisonResults.hospitalsFoundCount} healthcare centers.
                </p>
              </div>

              {comparisonResults.maxPotentialSavings > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base font-extrabold">
                    ₹
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Max Potential Savings
                    </p>
                    <p className="text-lg font-black text-emerald-700">
                      ₹{comparisonResults.maxPotentialSavings.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Tests Tags */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                Comparing:
              </span>
              {comparisonResults.requestededTestNames?.map((name, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100"
                >
                  ✓ {name}
                </span>
              ))}
            </div>

            {/* Hospital Cards Grid */}
            {comparisonResults.hospitals?.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <div className="text-4xl mb-3">🏥</div>
                <h3 className="text-lg font-bold text-slate-800">No matching hospital rates found</h3>
                <p className="text-slate-500 text-sm mt-1">
                  None of our listed hospitals currently offer these specific diagnostic procedures.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                >
                  Adjust Test Names
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comparisonResults.hospitals.map((hospital, index) => (
                  <div
                    key={hospital.hospitalId}
                    className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      index === 0 && hospital.allMatched
                        ? "border-emerald-300 ring-2 ring-emerald-500/20"
                        : "border-slate-200/80"
                    }`}
                  >
                    <div>
                      {/* Badge header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {index === 0 && hospital.allMatched && (
                            <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              🏆 Best Total Rate
                            </span>
                          )}
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              hospital.allMatched
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {hospital.allMatched
                              ? `All ${hospital.totalTests} tests available`
                              : `${hospital.matchedCount} of ${hospital.totalTests} tests available`}
                          </span>
                        </div>

                        <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2 py-1 rounded-md border border-amber-100 shrink-0">
                          ★ {hospital.rating}
                        </span>
                      </div>

                      {/* Hospital Name & Location */}
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {hospital.hospitalName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span>📍</span> {hospital.address}, {hospital.city}
                      </p>

                      {/* Itemized Test Breakdown */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Itemized Price Breakdown:
                        </p>
                        {hospital.breakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <span className="font-medium text-slate-700 truncate mr-2">
                              {item.testName}
                            </span>
                            {item.available ? (
                              <span className="font-bold text-indigo-700 shrink-0">
                                ₹{item.price.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic shrink-0">
                                Not listed
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Total and Booking */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">
                          Package Total
                        </p>
                        <p className="text-2xl font-black text-indigo-700">
                          ₹{hospital.totalPackagePrice.toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setSelectedHospitalForBooking({
                            hospitalId: hospital.hospitalId,
                            hospitalName: hospital.hospitalName,
                            address: hospital.address,
                            city: hospital.city,
                            serviceName: comparisonResults.requestededTestNames.join(" + "),
                            price: hospital.totalPackagePrice,
                          })
                        }
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
                      >
                        Book Package →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reusable Appointment Booking Modal */}
      {selectedHospitalForBooking && (
        <AppointmentModal
          selectedHospital={selectedHospitalForBooking}
          closeModal={() => setSelectedHospitalForBooking(null)}
        />
      )}
    </div>
  );
}

export default PrescriptionScanner;
