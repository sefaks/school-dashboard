"use client";
import React from "react";
import { signIn } from "next-auth/react"; // NextAuth için gerekli import

function RegisterPage() {
  const [name, setName] = React.useState("");
  const [surname, setSurname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      // API'ye POST isteği göndererek kaydı yapıyoruz
      const response = await fetch("http://127.0.0.1:8000/auth/teacher/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          surname: surname.trim(),
          email: email.trim(),
          password: password,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Registration failed!");
      }
  
      // Kaydın başarılı olması durumunda
      console.log("Registration successful!");
  
      // Kullanıcıyı bir başarı sayfasına yönlendirebiliriz
      window.location.href = "/signIn"; // veya /dashboard gibi bir yönlendirme yapılabilir
  
    } catch (err: any) {
      setError(err.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 p-4">
        <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-4xl">
          {/* Image Section */}
          <div className="w-full md:w-1/2 h-64 md:h-auto">
            <img
              src="register-4.png"
              alt="Register"
              className="object-cover w-full h-full"
            />
          </div>
  
          {/* Form Section */}
          <div className="w-full md:w-1/2 p-8">
            <h1 className="text-3xl font-extrabold text-gray-700 mb-6 text-center">
            Teacher Registration
            </h1>
            <form className="flex flex-col space-y-4" onSubmit={handleRegister}>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
  
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Surname</label>
                <input
                  type="text"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                />
              </div>
  
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
  
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
  
              {/* Error Message */}
              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
  
              {/* Submit Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-lg shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all flex justify-center items-center"
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
                {loading ? "Registering..." : "Register"}
              </button>

              <div className="flex flex-col gap-2 text-center">
              <a href="/reset-password" className="text-sm text-blue-500 hover:underline">Are you school manager? Contact with us</a>
              <a href="/login" className="text-sm text-purple-600 hover:underline">Login</a>
            </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  export default RegisterPage;
  