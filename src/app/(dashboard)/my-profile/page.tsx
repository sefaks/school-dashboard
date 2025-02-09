"use client";
import { useState, useEffect } from 'react';  
import { User } from 'lucide-react'; // Profil fotoğrafı için icon  
import TeacherProfileForm from '@/components/forms/TeacherProfileForm';  
import api from '@/lib/apiClient_new';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getTeacherProfile } from '@/lib/actions';
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";

export default function TeacherProfilePage() {  
  const [teacher, setTeacher] = useState(null);  
  const router = useRouter();  
  const [role, setRole] = useState<null | string>(null);  
  const { data: session } = useSession(); // Get the session (which includes the token)

  const [language, setLanguage] = useState("en");
    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedLanguage = localStorage.getItem("language") || "en";
        setLanguage(storedLanguage);
      }
    }, []);
    const currentLanguageContent = language === "en" ? en : tr;

  //loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {  
    async function fetchData() {  
      try {  
        if (!session?.user?.role) {  
          // Kullanıcı giriş yapmamışsa yönlendirme  
          router.push('/login');  
          return;  
        }  
  
        setRole(session.user.role);  
  
        if (session.user.role === 'teacher') {  
          // fetch teacher data
          const teacherResponse = await getTeacherProfile(session.user.accessToken);

          const teacherData = teacherResponse; 

          console.log(teacherData.subjects);
    
        
  
          setTeacher(teacherData);  
          setLoading(false);
        }  
      } catch (error) {  
        console.error('Error fetching data:', error);  
      }  
    }  
  
    fetchData();  
  }, [session, router]);  
  
  if (!session) {  
    return null;  
  }

  if (loading) {
    return <div className="w-full h-full flex flex-col items-center justify-center">
    <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
    <span className="mt-2 text-blue-500">{currentLanguageContent.loading}</span>
  </div>;
  }
  
  return (  
    <div className="container mx-auto py-8 px-4">  
      <div className="max-w-4xl mx-auto">  
        {/* Profil Başlığı */}  
        <div className="mb-8">  
          <h1 className="text-2xl font-bold text-gray-800">Profil Bilgileri</h1>  
          <p className="text-gray-600">  
            Kişisel bilgilerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz.  
          </p>  
        </div>  
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">  
          {/* Sol Kolon - Avatar ve İsim */}  
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">  
            <div className="flex flex-col items-center">  
              {teacher.photo ? (  
                <img  
                  src={teacher.photo}  
                  alt="Profil Fotoğrafı"  
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"  
                />  
              ) : (  
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">  
                  <User className="w-16 h-16 text-gray-400" />  
                </div>  
              )}  
              <h2 className="mt-4 text-xl font-semibold text-gray-800">  
                {teacher.name && teacher.surname ? `${teacher.name} ${teacher.surname}` : 'İsim Belirtilmemiş'}  
              </h2>  
              <p className="text-gray-600">{teacher.title || 'Ünvan Belirtilmemiş'}</p>  
            </div>  
          </div>  
  
          {/* Sağ Kolon - Form */}  
          <div className="md:col-span-2">  
            {role === 'teacher' && <TeacherProfileForm initialData={teacher} />}  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}  