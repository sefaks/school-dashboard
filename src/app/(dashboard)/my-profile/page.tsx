"use client";
import { useState, useEffect } from 'react';  
import { User } from 'lucide-react'; // Profil fotoğrafı için icon  
import TeacherProfileForm from '@/components/forms/TeacherProfileForm';  
import { serverGet } from '@/lib/apiClient_new';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getTeacherProfile } from '@/lib/actions';
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import Loading from '../list/loading';
import { el } from 'date-fns/locale';
import AdminProfileForm from '@/components/forms/AdminProfileForm';


export default function TeacherProfilePage() {
  const [teacher, setTeacher] = useState(null);
  const [admin, setAdmin] = useState(null);
  const router = useRouter();
  const { data: session } = useSession(); // Get the session (which includes the token)
  const [language, setLanguage] = useState("en");
  
  const currentLanguageContent = language === "en" ? en : tr;
  //loading
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      try {
        if (!session?.user?.role) {
          // Kullanıcı giriş yapmamışsa yönlendirme
          router.push('/login');
          return;
        }
                
        if (session.user.role === 'teacher') {
          // fetch teacher data
          const teacherResponse = await getTeacherProfile(session.user.accessToken);
          const teacherData = teacherResponse;
          console.log(teacherData.subjects);
          setTeacher(teacherData);
          setLoading(false);
        }
        // else if role is admin, fetch admin data
        else if(session.user.role === 'admin') {
          const adminResponse = await serverGet('/admins/me/profile');
          console.log(adminResponse.data);
          setAdmin(adminResponse.data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [session?.user.role]);
  
  if (!session) {
    return null;
  }
  
  if (loading) {
    return <Loading/>
  }
  
  // Admin görünümü için ayrı bir render
  if (session?.user?.role === 'admin' && admin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profil Başlığı */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Admin Profili</h1>
            <p className="text-gray-600">
              Admin bilgilerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sol Kolon - Avatar ve İsim */}
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-16 h-16 text-blue-500" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-800">
                  {admin.name || 'Admin'}
                </h2>
                <p className="text-gray-600">Yönetici</p>
                
                <div className="mt-4 w-full">
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">Admin ID</p>
                    <p className="font-medium">{admin.id}</p>
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <p className="text-sm text-gray-500">Kurum ID</p>
                    <p className="font-medium">{admin.institution_id}</p>
                  </div>
                  <div className="border-t mt-4 pt-4">
                    <button
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                      onClick={() => router.push('/admin')}
                    >
                      Admin Paneline Dön
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sağ Kolon - Admin Form */}
            <div className="md:col-span-2">
              <AdminProfileForm initialData={admin} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Öğretmen görünümü (orijinal)
  if (session?.user?.role === 'teacher' && teacher) {

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

  
}

