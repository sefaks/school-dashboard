'use client'; // Bu, React bileşeninizin istemci tarafında çalıştığını belirtiyor.

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter burada kullanılıyor
import { resetPassword } from '@/lib/actions'; // resetPassword fonksiyonunu import ettiğinizden emin olun
import { toast } from 'react-toastify';

export default function ResetPassword({ params }: { params: { token: string } }) {

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
  
    try {
      const secret_token = params.token;
      const confirm_password = confirmPassword;
      const new_password = newPassword;
  
      const formData = { secret_token, new_password, confirm_password };
      const response = await resetPassword(formData);
  
      if (response.success) {
        setSuccess(true);
        // Başarılı mesajı için toast göster
        toast.success("Password reset successful!");
        router.push("/login");
      } else {
        setError(response.message || "Something went wrong!");
        // Hata mesajı için toast göster
        toast.error(response.message || "Something went wrong!");
      }
    } catch (err) {
      // Hata mesajını logla ve toast göster
      if (err instanceof Error) {
        console.error("Error:", err.message);  // Hata mesajını logluyoruz
        setError(err.message);
        toast.error(err.message);  // Toast ile göster
      } else {
        console.error("Unknown error", err);
        setError("Network error. Please try again.");
        toast.error("Network error. Please try again.");  // Toast ile göster
      }
    } finally {
      setLoading(false);  // İstek tamamlandığında yüklenme durumu bitiriliyor
    }
  };
  

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 gap-6">
      <h1 className="text-4xl font-extrabold text-white">Reset Your Password</h1>
      
      {success ? (
        <div className="text-green-500">Password reset successful. Redirecting to login...</div>
      ) : (
        <form
          className="bg-white p-8 rounded-xl shadow-lg w-96 flex flex-col space-y-6"
          onSubmit={handleResetPassword}
        >
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

          <button
            type="submit"
            className="bg-green-600 text-white p-3 rounded-lg shadow-md hover:bg-green-700 active:bg-green-800 transition-all flex justify-center items-center"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

