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
    e.preventDefault()
    
    if (!email || !password) {
      alert("Lütfen email ve şifre giriniz.")
      return
    }

    setLoading(true)
    setError(null) // Eski hatayı sıfırlıyoruz

    try {
      const response = await signIn("credentials", {
        redirect: false,  // Oturum açtığında sayfayı otomatik yönlendirmemek için 'false' olarak ayarlıyoruz
        email,
        password,
        // role backend tarafında kontrol edilebilir, burada göndermeyebilirsiniz
      })

      // `response` objesinin `status` ve `error` alanlarını kontrol edin
      if (response?.error) {
        setError(response.error) // Eğer hata varsa, hata mesajını ayarlıyoruz
      } else {
        // save token to local storage
        router.push("/teacher") // Kullanıcıyı yönlendirecek sayfa
      }
    } catch (error) {
      setError("Oturum açma sırasında bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-3">
      <div className="flex flex-row items-center justify-start gap-2 ">
        <img src="5.png" alt="" width={100} height={100} className="rounded-full" />
        <h1 className="text-3xl font-bold text-purple-600">Arf Login</h1>
      </div>

  

      {/* Login Form */}
      <form
        className="bg-white p-6 rounded shadow-md w-80 flex flex-col space-y-4"
        onSubmit={handleLogin}
      >
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            className="p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            className="p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="bg-green-600 text-white p-2 rounded flex justify-center items-center"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
