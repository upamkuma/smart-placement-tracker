import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.name || !formData.email || !formData.password) {
      toast.warning("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success("Account created successfully! 🚀");
      navigate("/dashboard");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Registration failed. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { strength: 0, label: "", color: "" };
    if (pwd.length < 6) return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (pwd.length < 8) return { strength: 50, label: "Fair", color: "bg-amber-500" };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 10)
      return { strength: 100, label: "Strong", color: "bg-emerald-500" };
    return { strength: 75, label: "Good", color: "bg-blue-500" };
  };

  const pwdStrength = getPasswordStrength();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row glass-card p-0 overflow-hidden shadow-2xl animate-fade-in min-h-[650px]">
        
        {/* Left Side: Illustration */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-600/20 to-primary-600/20 relative items-center justify-center p-12 border-r border-white/10">
          <div className="absolute inset-0 bg-dark-900/40 pointer-events-none"></div>
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
            <img 
              src="/smart-placement-tracker/auth-illustration.png" 
              alt="Join SPT" 
              className="w-full h-full max-h-[400px] object-contain filter drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-float" 
            />
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-2">Kickstart Your Career</h2>
              <p className="text-dark-300 text-sm max-w-xs mx-auto">Create an account and access all premium features including AI ATS scanner and mock interviews.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center overflow-y-auto">
          {/* Header */}
          <div className="text-center lg:text-left mb-6">
            <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-primary-600 rounded-xl mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-dark-400">Start tracking your placement journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-dark-300 text-sm font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <input
                  type="text"
                  name="name"
                  id="register-name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field !pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-dark-300 text-sm font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </span>
                <input
                  type="email"
                  name="email"
                  id="register-email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field !pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" title="Choose a strong password" className="block text-dark-300 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="register-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field !pl-10 !pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pwdStrength.color}`}
                      style={{ width: `${pwdStrength.strength}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-dark-500">
                    Password strength: <span className={pwdStrength.strength >= 75 ? "text-emerald-400" : pwdStrength.strength >= 50 ? "text-amber-400" : "text-red-400"}>{pwdStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" title="Re-enter your password to confirm" className="block text-dark-300 text-sm font-medium mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  id="register-confirm-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`input-field !pl-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "!border-red-500/50" : formData.confirmPassword && formData.password === formData.confirmPassword ? "!border-emerald-500/50" : ""}`}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 !mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              id="register-submit-btn"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center lg:text-left border-t border-white/5 pt-6">
            <p className="text-dark-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors" id="register-login-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
