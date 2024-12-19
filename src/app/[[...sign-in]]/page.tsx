"use client"

import { useState } from "react";
import axios from "axios";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { RiSchoolLine } from "react-icons/ri";

const LoginPage = () => {
  const [role, setRole] = useState("teacher"); // Varsayılan rol teacher
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Lütfen email ve şifre giriniz.");
      return;
    }

    const endpoint =
      role === "teacher"
        ? "http://127.0.0.1:8000/auth/teacher/login"
        : "http://127.0.0.1:8000/auth/institution_admin/login";

    try {
      const response = await axios.post(endpoint, {
        email: email,
        password,
      });

      console.log("Login successful!", response.data);
      // Token'ı kaydet ve kullanıcıyı yönlendir
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/; Secure; SameSite=Strict`;
      document.cookie = `role=${role}; path=/; Secure; SameSite=Strict`;

      // saving local storage
      localStorage.setItem("role", role);
      localStorage.setItem("token", token);
      
      // route depend on endpoint
      if (role === "teacher") {
        window.location.href = "/teacher";
      } else {
        window.location.href = "/admin";
      }

    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      alert(
        error.response?.data?.detail || "Giriş başarısız. Bilgilerinizi kontrol edin."
      );
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-3">
      <div className="flex flex-row items-center justify-start gap-2 ">
        <img src="5.png" alt="" width={100} height={100} className="rounded-full" />
        <h1 className="text-3xl font-bold  text-purple-600">Arf Login</h1>
      </div>

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

      <form
        className="bg-white p-6 rounded shadow-md w-80 flex flex-col space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
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
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
