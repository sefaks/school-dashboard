"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { teacherUpdateProfile } from "@/lib/actions";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { SUBJECTS } from "@/lib/utils";
import { useRouter } from "next/navigation";

const TeacherUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name is required!" }).optional(),
  surname: z.string().min(1, { message: "Surname is required!" }).optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  subjects: z.array(z.string()).optional(),
  title: z.string().min(1, { message: "Title is required!" }).optional(),
  gender: z.enum(["Erkek", "Kadın"], { message: "Required field!" }).optional(),
  phone_number: z.string().min(1, { message: "Phone number is required!" }).optional(),
});

const TeacherProfileForm = ({ initialData }: { initialData: any }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialData.subjects || []);

  const { data: session } = useSession();
  const router = useRouter();
  
  const handleSubjectToggle = (subjectName: string) => {
    if (selectedSubjects.includes(subjectName)) {
      setSelectedSubjects(selectedSubjects.filter((subject) => subject !== subjectName));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectName]);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData.name || "",
      surname: initialData.surname || "",
      email: initialData.email || "",
      title: initialData.title || "",
      gender: initialData.gender || "",
      phone_number: initialData.phone_number || "",
    },
  });

  const onSubmit = async (formData: any) => {
    // Şema doğrulama
    try {
        const validatedData = TeacherUpdateSchema.parse({
            ...formData,
            subjects: selectedSubjects,
        });

        // API'ye gönderim
        const response = await teacherUpdateProfile(validatedData, session?.user.accessToken || ""); // Update API çağrısı
        if (response.success) {
            toast.success("Profil başarıyla güncellendi.");
            // 1 saniye sonra sayfayı yenile
            
            setTimeout(() => {
                router.refresh();
            }, 1000);
            
        } else {
            toast.error("Profil güncellenemedi.");
        }
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error("Doğrulama hatası. Lütfen bilgileri kontrol edin.");
      } else {
        toast.error("Bir hata oluştu.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* İsim */}
        <div>
          <label className="font-medium text-gray-700">İsim</label>
          <input
            type="text"
            {...register("name")}
            className="mt-1 p-2 w-full border rounded"
          />
            {errors.name && <span className="text-red-500">{errors.name.message?.toString()}</span>}
        </div>

        {/* Soyisim */}
        <div>
          <label className="font-medium text-gray-700">Soyisim</label>
          <input
            type="text"
            {...register("surname")}
            className="mt-1 p-2 w-full border rounded"
          />
          {errors.surname && <span className="text-red-500">{errors.surname.message?.toString()}</span>}
        </div>

        {/* E-posta */}
        <div>
          <label className="font-medium text-gray-700">E-posta</label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 p-2 w-full border rounded"
          />
          {errors.email && <span className="text-red-500">{errors.email.message?.toString()}</span>}
        </div>

        {/* Telefon Numarası */}
        <div>
          <label className="font-medium text-gray-700">Telefon Numarası</label>
          <input
            type="text"
            {...register("phone_number")}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {/* Ünvan */}
        <div>
          <label className="font-medium text-gray-700">Ünvan</label>
          <input
            type="text"
            {...register("title")}
            className="mt-1 p-2 w-full border rounded"
          />
          {errors.title && <span className="text-red-500">{errors.title.message?.toString()}</span>}
        </div>

        {/* Cinsiyet */}
        <div>
          <label className="font-medium text-gray-700">Cinsiyet</label>
          <select {...register("gender")} className="mt-1 p-2 w-full border rounded">
            <option value="Erkek">Erkek</option>
            <option value="Kadın">Kadın</option>
          </select>
          {errors.gender && <span className="text-red-500">{errors.gender.message?.toString()}</span>}
        </div>

        {/* Dersler */}
        
      </div>

      <div className="mt-4">
          <label className="block mb-2 font-medium text-gray-700">Dersler</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => handleSubjectToggle(subject.name)}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  selectedSubjects.includes(subject.name)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {subject.displayName}
              </button>
            ))}
          </div>
        </div>

      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Güncelle
      </button>
    </form>
  );
};

export default TeacherProfileForm;
