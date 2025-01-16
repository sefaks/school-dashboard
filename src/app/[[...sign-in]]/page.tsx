'use client'
import { useState } from "react"
import { useRouter } from "next/navigation" // Yönlendirme işlemi için useRouter
import { LiaChalkboardTeacherSolid } from "react-icons/lia"
import { RiSchoolLine } from "react-icons/ri"
import { signIn } from "next-auth/react" // next-auth'dan signIn fonksiyonunu import ediyoruz

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // Hata mesajını tutacağız
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !password) {
      setError("Lütfen email ve şifre giriniz.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
  
      if (response?.error) {
        if (response.error.includes("Teacher")) {
          setError(
            response.error.includes("password")
              ? "Öğretmen şifresi yanlış. Lütfen tekrar deneyiniz."
              : "Öğretmen email adresi bulunamadı."
          );
        } else if (response.error.includes("Institution admin")) {
          setError(
            response.error.includes("password")
              ? "Kurum yöneticisi şifresi yanlış. Lütfen tekrar deneyiniz."
              : "Kurum yöneticisi email adresi bulunamadı."
          );
        } else {
          setError("Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
        }
      } else {
        router.push("/");
      }
    } catch {
      setError("Oturum açma sırasında bir hata oluştu.");
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
  
      {/* Login Form */}
      <form
        className="bg-white p-8 rounded-xl shadow-lg w-96 flex flex-col space-y-6"
        onSubmit={handleLogin}
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
  
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
  
        {/* Link to reset password or register */}
        <div className="flex flex-col gap-2 text-center">
          <a href="/forget-password" className="text-sm text-blue-500 hover:underline">Forgot Password?</a>
          <a href="/new-user" className="text-sm text-purple-600 hover:underline">Don't have an account?</a>

        </div>
      </form>
    </div>
  );

}
export default LoginPage
