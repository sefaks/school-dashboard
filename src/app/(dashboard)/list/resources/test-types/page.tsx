"use client"
import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { getSession, useSession } from 'next-auth/react';
import { getPublishTestTypes } from '@/lib/actions';
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import Loading from '../../loading';


const TestTypesPage = () => {
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams()  
  const publish_id = searchParams.get('publish_id');
  const router = useRouter();
  const { data: session } = useSession(); // Get the session (which includes the token)

  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr;


  useEffect(() => {
    const fetchTestTypes = async () => {
        try {
            setLoading(true);

            const data = await getPublishTestTypes(session?.user.accessToken ?? '', parseInt(publish_id));
            
            setTestTypes(data);
        } catch (err) {
            setError('Test tipleri yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    fetchTestTypes();
  }, [publish_id]);

    const handleTestTypeClick = (testType:any) => {
        router.push(`/list/resources/tests?test_type=${testType}`);
    };

  

  if (loading) {
    return <Loading/>
  }

  if (error !=  '') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Test Tipleri</h1>
        <p className="text-gray-600 mt-2">Lütfen görüntülemek istediğiniz test tipini seçin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {testTypes.map((testType) => (
          <div
            key={testType.id}
            onClick={() => handleTestTypeClick(testType)}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between ">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <Book className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{testType}</h3>
                 
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {testTypes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Bu yayın için henüz test tipi bulunmuyor.</p>
        </div>
      )}
    </div>
  );
};

export default TestTypesPage;