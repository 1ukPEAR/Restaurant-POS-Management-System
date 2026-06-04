import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import picAuth from "../../assets/pic-login/pic-login.jpg";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import {
  UserPlus,
  Store,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    email: "",
    phone: "",
    username: "",
    password: "",
    shop_name: "",
    shop_address: "",
    open_time: "",
    close_time: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    validateField(key, value);
  };

  // ---------------- VALIDATION ----------------
  const validateField = (name, value) => {
    let msg = "";

    if (name === "username") {
      if (!value.trim()) msg = "กรุณากรอกชื่อผู้ใช้";
      else if (value.length < 3) msg = "ต้องมีอย่างน้อย 3 ตัว";
      else if (!/^[a-zA-Z0-9]+$/.test(value))
        msg = "ใช้ได้เฉพาะภาษาอังกฤษและตัวเลขเท่านั้น";
    }

    if (name === "password") {
      if (!value) msg = "กรุณากรอกรหัสผ่าน";
      else if (/\s/.test(value)) msg = "ห้ามมีช่องว่าง";
      else if (value.length < 8) msg = "รหัสผ่านต้องมีอย่างน้อย 8 ตัว";
    }

    if (name === "email") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) msg = "กรุณากรอกอีเมล";
      else if (!regex.test(value)) msg = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (name === "phone") {
      if (!/^\d{10}$/.test(value)) msg = "ต้องเป็นตัวเลข 10 หลัก";
    }

    if (name === "shop_name") {
      if (!value.trim()) msg = "กรุณากรอกชื่อร้าน";
    }

    if (name === "shop_address") {
      if (!value.trim()) msg = "กรุณากรอกที่อยู่ร้าน";
    }

    if (name === "open_time" || name === "close_time") {
      if (!form.open_time || !form.close_time) {
        msg = "";
      } else if (form.close_time <= form.open_time) {
        msg = "เวลาปิดต้องมากกว่าเวลาเปิด";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const canGoNext =
    !errors.username &&
    !errors.password &&
    !errors.email &&
    !errors.phone &&
    form.username &&
    form.password &&
    form.email &&
    form.phone;

  const canRegister =
    !errors.shop_name &&
    !errors.shop_address &&
    !errors.open_time &&
    !errors.close_time &&
    form.shop_name &&
    form.shop_address &&
    form.open_time &&
    form.close_time;

  // ---------------- REGISTER FUNCTION ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        try {
          await loginUser(form.email, form.password);
        } catch (loginError) {
          Swal.fire({
            icon: "warning",
            title: "Account Created, but login failed ⚠️",
            text: "Please login manually.",
          });
          navigate("/login");
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Account Created 🎉",
          text: "Redirecting...",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Register Failed 😢",
          text: data.error || "Please check your inputs.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error ⚠️",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT IMAGE */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${picAuth})` }}
      />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          {/* STEP INDICATOR */}
          <StepIndicator step={step} />

          {/* HEADINGS */}
          {step === 1 ? (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                Create Your <span className="text-sky-500">Account</span>
              </h1>
              <p className="text-gray-500 mb-6 tracking-wide">
                Step 1 – Personal details
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                Your <span className="text-sky-500">Shop Info</span>
              </h1>
              <p className="text-gray-500 mb-6 tracking-wide">
                Step 2 – Business details
              </p>
            </>
          )}

          {/* FORM */}
          <form
            onSubmit={step === 2 ? handleRegister : (e) => e.preventDefault()}
            className="space-y-5"
          >
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <InputField
                  label="Username"
                  value={form.username}
                  onChange={(v) => handleChange("username", v)}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}

                <InputField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(v) => handleChange("password", v)}
                  placeholder="Create password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}

                <InputField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => handleChange("email", v)}
                  placeholder="example@gmail.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}

                <InputField
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => handleChange("phone", v.slice(0, 10))}
                  placeholder="08x-xxx-xxxx"
                  maxLength={10}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}

                <button
                  type="button"
                  disabled={!canGoNext}
                  className={`w-full px-4 py-2 rounded-lg shadow font-prompt flex items-center justify-center gap-2 transition-all
                    ${canGoNext
                      ? "bg-button text-white hover:bg-white hover:text-button border hover:border-button"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  onClick={() => setStep(2)}
                >
                  Next <ArrowRight size={18} />
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <InputField
                  label="Shop Name"
                  value={form.shop_name}
                  onChange={(v) => handleChange("shop_name", v)}
                  placeholder="ชื่อร้าน"
                />
                {errors.shop_name && (
                  <p className="text-red-500 text-xs">{errors.shop_name}</p>
                )}

                <TextareaField
                  label="Shop Address"
                  value={form.shop_address}
                  onChange={(v) => handleChange("shop_address", v)}
                  placeholder="ที่อยู่ร้าน"
                />
                {errors.shop_address && (
                  <p className="text-red-500 text-xs">{errors.shop_address}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Open Time"
                    type="time"
                    value={form.open_time}
                    onChange={(v) => handleChange("open_time", v)}
                  />
                  <InputField
                    label="Close Time"
                    type="time"
                    value={form.close_time}
                    onChange={(v) => handleChange("close_time", v)}
                  />
                </div>
                {(errors.open_time || errors.close_time) && (
                  <p className="text-red-500 text-xs">
                    เวลาปิดต้องมากกว่าเวลาเปิด
                  </p>
                )}

                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 flex items-center gap-2 rounded-lg font-semibold text-button border border-button hover:bg-sky-50 transition"
                  >
                    <ArrowLeft size={18} /> Back
                  </button>

                  <button
                    type="submit"
                    disabled={!canRegister || loading}
                    className={`px-4 py-2 rounded-lg shadow font-prompt flex items-center justify-center gap-2 transition-all
                      ${canRegister && !loading
                        ? "bg-button text-white hover:bg-white hover:text-button border-button border"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    {loading ? "Registering..." : <><CheckCircle size={18} /> Register</>}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* LOGIN LINK */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-sky-500 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */
function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center mb-10 relative">
      <div className="flex items-center space-x-8">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step >= 1
                ? "bg-sky-500 border-sky-500 text-white"
                : "bg-gray-100 border-gray-300 text-gray-400"
              }`}
          >
            <UserPlus size={20} />
          </div>
          <p
            className={`text-xs mt-1 ${step >= 1 ? "text-sky-600" : "text-gray-400"
              }`}
          >
            Account
          </p>
        </div>

        <div
          className={`w-12 h-[2px] ${step >= 2 ? "bg-sky-500" : "bg-gray-200"
            }`}
        ></div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step === 2
                ? "bg-sky-500 border-sky-500 text-white"
                : "bg-gray-100 border-gray-300 text-gray-400"
              }`}
          >
            <Store size={20} />
          </div>

          <p
            className={`text-xs mt-1 ${step === 2 ? "text-sky-600" : "text-gray-400"
              }`}
          >
            Shop Info
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none"
      />
    </div>
  );
}
