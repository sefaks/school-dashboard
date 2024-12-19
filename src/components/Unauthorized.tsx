// pages/unauthorized.tsx
import React from 'react';
import { useRouter } from 'next/router';

const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg text-center">
        <h1 className="text-xl font-bold text-red-600">Access is denied</h1>
        <p className="text-gray-700 mt-4">
          You have no permission to access this page. Please contact your administrator.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
