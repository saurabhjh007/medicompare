import { useState, useEffect } from "react";
import api from "../api.js";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Wake up the backend API as soon as the Register page mounts
  useEffect(() => {
    api.get("/").catch(() => {
      // Ignore errors as it is just a pre-warming request
    });
  }, []);

  const register = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful. Please login now.");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>

      <div className="relative w-full max-w-md mx-4 z-10">
        {/* Brand Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mb-3 shadow-inner">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-emerald-200 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
            MediCompare
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Healthcare Transparency, Reimagined.
          </p>
        </div>

        {/* Register Form Container */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Create Account
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              onClick={register}
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          <div className="mt-8 text-center text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 decoration-2 decoration-emerald-500/30 hover:decoration-emerald-400 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;