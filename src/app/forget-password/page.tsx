"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { forgetPassword } from "@/lib/actions";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await forgetPassword(email);
      console.log("Response from resetPassword:", response);  // Yanıtı kontrol edin

      if (response) {
        alert("Password reset link has been sent to your email.");
        router.push("/login");
      } else {
        setError("No response received. Please try again.");
      }
    } catch (err:any) {
      console.error("Error during resetPassword:", err);  // Hata detaylarını kontrol et
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
};


  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 gap-6">
      <div className="flex flex-row items-center justify-start gap-4">
        <img src="5.png" alt="Logo" width={100} height={100} className="rounded-full shadow-lg" />
        <h1 className="text-4xl font-extrabold text-white">Arf Login</h1>
      </div>

      {/* Password Reset Form */}
      <form
        className="bg-white p-8 rounded-xl shadow-lg w-96 flex flex-col space-y-6"
        onSubmit={handleResetPassword}
      >
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm font-medium">{error}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-green-600 text-white p-3 rounded-lg shadow-md hover:bg-green-700 active:bg-green-800 transition-all flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v14m7-7H5"
              />
            </svg>
          ) : null}
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* Link to login page */}
        <div className="flex flex-col gap-2 text-center">
          <a href="/login" className="text-sm text-blue-500 hover:underline">
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
