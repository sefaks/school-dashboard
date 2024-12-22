// app/(auth)/login/page.tsx
'use client'
import { useState } from "react"
import { LiaChalkboardTeacherSolid } from "react-icons/lia"
import { RiSchoolLine } from "react-icons/ri"
import { useAuth } from "@/contexts/AuthContext"

const LoginPage = () => {
  const [role, setRole] = useState("teacher")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const { login, error, loading } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      alert("Lütfen email ve şifre giriniz.")
      return
    }

    try {
      await login(email, password, role)
    } catch (error: any) {
      // Error handling is now managed by AuthContext
      console.error("Login error:", error)
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-3">
      <div className="flex flex-row items-center justify-start gap-2 ">
        <img src="5.png" alt="" width={100} height={100} className="rounded-full" />
        <h1 className="text-3xl font-bold text-purple-600">Arf Login</h1>
      </div>

      {/* Role Selection */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setRole("teacher")}
          className={`p-2 flex flex-row items-center justify-center gap-2 ${
            role === "teacher" ? "bg-purple-600 text-white" : "bg-gray-200"
          } rounded`}
        >
          Teacher
          <LiaChalkboardTeacherSolid />
        </button>
        <button
          onClick={() => setRole("admin")}
          className={`p-2 flex flex-row items-center justify-center gap-2 ${
            role === "admin" ? "bg-purple-600 text-white" : "bg-gray-200"
          } rounded`}
        >
          Institution Admin
          <RiSchoolLine />
        </button>
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