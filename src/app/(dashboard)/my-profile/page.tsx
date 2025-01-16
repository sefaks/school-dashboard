import { redirect } from "next/navigation";
import { User } from "lucide-react"; // Profil fotoğrafı için icon
import TeacherProfileForm from "@/components/forms/TeacherProfileForm";
import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";

// Server-side veri çekme işlemi
export default async function TeacherProfilePage() {
  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

  if (!current_user_id) {
    // Kullanıcı giriş yapmamışsa yönlendirme
    redirect("/login");
  }

  // Öğretmenin bilgilerini ve derslerini çekiyoruz
  const teacher = await prisma.teachers.findUnique({
    where: {
      id: parseInt(current_user_id),
    },
    select: {
      name: true,
      surname: true,
      email: true,
      gender: true,
      title: true,
      phone_number: true,
      photo: true,
      validation_code: true,
      teacher_subject: {
        select: {
          subjects: {
            select: {
              subject_name: true, // Ders ismi
            },
          },
        },
      },
    },
  });

  // prop teacher is teacher with subjects array

  const propTeacher =  {
    ...teacher,
    subjects: teacher?.teacher_subject.map((item) => item.subjects.subject_name),
  };



  if (!teacher) {
    // Eğer öğretmen bulunamazsa 404 sayfasına yönlendir
    redirect("/unauthorized");
  }

  

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profil Başlığı */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Profil Bilgileri</h1>
          <p className="text-gray-600">Kişisel bilgilerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz.</p>
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
                {teacher.name && teacher.surname
                  ? `${teacher.name} ${teacher.surname}`
                  : "İsim Belirtilmemiş"}
              </h2>
              <p className="text-gray-600">{teacher.title || "Ünvan Belirtilmemiş"}</p>
            </div>
          </div>

          {/* Sağ Kolon - Form */}
          <div className="md:col-span-2">
            {/* Profil Güncelleme Formu */}
            <TeacherProfileForm initialData={propTeacher} />
          </div>
        </div>
      </div>
    </div>
  );
}
