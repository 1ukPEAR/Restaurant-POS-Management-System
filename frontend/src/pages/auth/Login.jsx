import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import picAuth from "../../assets/pic-login/pic-login.jpg";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // นำเข้าจาก Lucide

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 🔹 สถานะโชว์รหัส
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginUser(username, password);
    setLoading(false);

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: "Welcome back!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/dashboard");
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed 😢",
        text: result.message || "Invalid username or password.",
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 🔹 ด้านซ้ายเป็นภาพพื้นหลัง */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${picAuth})` }}
      ></div>

      {/* 🔹 ด้านขวาเป็นฟอร์ม */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <h1 className="text-h0 font-extrabold text-gray-900 mb-2">
            Ready to serve{" "}
            <span className="text-sky-500 text-h0">Happiness ?</span>
          </h1>
          <p className="text-gray-500 pt-3">Log in and let’s start the day!</p>

          <form onSubmit={handleLogin} className="space-y-5 pt-10">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Username here."
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>

              <div className="flex items-center gap-2">
                {/* Input */}
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password here."
                  required
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:outline-none h-12"
                />

                {/* ปุ่มดูรหัส */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 focus:outline-none h-12"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-right mt-1">
                <Link
                  to="/forgot-password"
                  className="text-sm text-sky-500 hover:underline"
                >
                  *Forgot your password?
                </Link>
              </div>
            </div>

            {/* ปุ่ม Login */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg shadow-ACACAC font-prompt flex items-center justify-center gap-2 transition-all
                 ${
                   loading
                     ? "bg-secondary cursor-not-allowed"
                     : "bg-button text-gray-100 border border-transparent hover:bg-white hover:text-button hover:border-button"
                 }`}
            >
              {loading ? "Signing in..." : "Confirm"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-sky-500 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
