import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { User } from "lucide-react"; // Profil fotoğrafı için icon

export default async function TeacherProfilePage() {
  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

  if (!current_user_id) {
    redirect("/login");
  }

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
    },
  });

  if (!teacher) {
    redirect("/404");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profil Başlığı */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Profil Bilgileri</h1>
          <p className="text-gray-600">Kişisel bilgilerinizi buradan görüntüleyebilirsiniz.</p>
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

          {/* Sağ Kolon - Detaylı Bilgiler */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800">Personal Informations</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <dt className="font-medium text-gray-700">Name</dt>
                  <dd className="text-gray-600">{teacher.name || "Belirtilmemiş"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Surname</dt>
                  <dd className="text-gray-600">{teacher.surname || "Belirtilmemiş"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">E-mail</dt>
                  <dd className="text-gray-600">{teacher.email || "Belirtilmemiş"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Phone Number</dt>
                  <dd className="text-gray-600">{teacher.phone_number || "Belirtilmemiş"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Gender</dt>
                  <dd className="text-gray-600">{teacher.gender || "Belirtilmemiş"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Title</dt>
                  <dd className="text-gray-600">{teacher.title || "Belirtilmemiş"}</dd>
                </div>
              </dl>
            </div>

            {/* Doğrulama Bilgisi */}
            {teacher.validation_code && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800">Validation Information</h3>
                <p className="text-sm text-gray-600 mt-4">
                  Validation Code: <span className="font-bold text-lg text-green-600">{teacher.validation_code}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
