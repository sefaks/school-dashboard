"use client";
import React from 'react';
import { useRouter } from 'next/navigation'; // next/router yerine next/navigation kullanıyoruz

const UnauthorizedPage = () => {

    const router = useRouter();

    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
        <div className="text-center max-w-lg px-6 py-8 bg-white rounded-xl shadow-xl">
          {/* Logo ve Başlık */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <img src="/5.png" alt="Logo" width={120} height={120} className="rounded-full shadow-lg" />
            <h1 className="text-4xl font-extrabold text-gray-800">Unauthorized Access</h1>
          </div>
    
          {/* Mesaj */}
          <p className="text-lg text-gray-700 mb-6">
            You do not have permission to view this page. Please contact the administrator or login with the appropriate credentials.
          </p>
    
          {/* Yönlendirme Butonu */}
          <button
            className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none transition-all"
            onClick={() => router.push('/login')} // Kullanıcıyı login sayfasına yönlendir
          >
            Go to Login
          </button>
        </div>
      </div>
    );

}
    
export default UnauthorizedPage;
