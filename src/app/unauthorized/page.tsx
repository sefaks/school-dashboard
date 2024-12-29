"use client";
import React from 'react';
import { useRouter } from 'next/navigation'; // next/router yerine next/navigation kullanıyoruz

const UnauthorizedPage = () => {

    const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen bg-purple-100">
      <div className="text-center  ">
        <div className=' text-center flex flex-row gap-2  items-center '>
        <img className='rounded-full' src="/5.png" alt="" width={100} height={100}/>
        <h1 className="text-4xl font-semibold text-black-600">Unauthorized Access</h1>
        </div>
        
        <p className="mt-2 text-gray-700">You do not have permission to view this page.</p>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => router.push('/login')} // Kullanıcıyı login sayfasına yönlendir
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
