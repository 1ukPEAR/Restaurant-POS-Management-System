import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // หน่วยเป็นวินาที

    // ⏱️ Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // แปลงวินาที -> นาที:วินาที
    const formatTime = (sec) => {
        const m = Math.floor(sec / 60)
            .toString()
            .padStart(2, "0");
        const s = Math.floor(sec % 60)
            .toString()
            .padStart(2, "0");
        return `${m}:${s}`;
    };

    // 🔹 Step 1: ส่ง OTP
    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");

            Swal.fire("Sent!", "Check your Gmail for OTP.", "success");
            setStep(2);
            setTimeLeft(5 * 60); // ⏱️ เริ่มจับเวลา 5 นาที
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (timeLeft <= 0)
            return Swal.fire("⏰ OTP expired", "Please resend OTP", "warning");

        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid OTP");

            Swal.fire("Verified!", "Now set your new password.", "success");
            setStep(3);
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Step 3: Reset Password
    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reset password");

            Swal.fire("Success!", "Password has been reset.", "success");
            navigate("/login");
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔁 Resend OTP
    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to resend OTP");

            Swal.fire("Resent!", "Check your Gmail again for new OTP.", "success");
            setTimeLeft(5 * 60); // เริ่มนับใหม่ 5 นาที
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 text-center text-primary">
                    Forgot Password
                </h2>

                {/* Step 1 */}
                {step === 1 && (
                    <>
                        <p className="text-gray-600 text-sm mb-4">
                            Enter your Gmail to receive an OTP.
                        </p>
                        <input
                            placeholder="Your Gmail or Username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full mb-3"
                        />
                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="btn-primary w-full py-2"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <>
                        <p className="text-gray-600 text-sm mb-3">
                            OTP sent to: <b>{email}</b>
                        </p>

                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full mb-3"
                        />

                        {/* Countdown */}
                        <div className="text-center text-sm text-gray-500 mb-3">
                            {timeLeft > 0 ? (
                                <>
                                    ⏱️ Time remaining:{" "}
                                    <span className="text-primary font-semibold">
                                        {formatTime(timeLeft)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-red-500">OTP expired</span>
                            )}
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading || timeLeft <= 0}
                            className={`btn-primary w-full py-2 ${timeLeft <= 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        {timeLeft <= 0 && (
                            <button
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="text-blue-500 text-sm mt-3 hover:underline w-full"
                            >
                                Resend OTP
                            </button>
                        )}
                    </>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <>
                        <p className="text-gray-600 text-sm mb-4">
                            Set a new password for <b>{email}</b>
                        </p>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full mb-3"
                        />
                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="btn-primary w-full py-2"
                        >
                            {loading ? "Saving..." : "Save New Password"}
                        </button>
                    </>
                )}

                {/* Back */}
                <div className="text-sm text-center mt-4">
                    <Link to="/login" className="text-primary hover:underline">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
