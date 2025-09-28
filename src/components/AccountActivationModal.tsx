"use client"
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeacherActivateSchema } from "@/lib/formValidationSchemas";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { SUBJECTS, activateTeacherSubjects } from "@/lib/utils";
import { activateTeacherAccount } from "@/lib/actions";

const AccountActivationModal = () => {
  const { data: session, update } = useSession(); // update'i ekledik
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(TeacherActivateSchema),
    defaultValues: {
      gender: "",
      subjects: [],
      title: ""
    }
  });

  useEffect(() => {
    console.log("User active", session?.user.is_active)
    if (session?.user?.is_active === false && session?.user?.role === "teacher") {
      setIsModalVisible(true);
    }
  }, [session?.user?.is_active]);

  // Update form value when subjects change
  useEffect(() => {
    setValue('subjects', selectedSubjects as any);
  }, [selectedSubjects, setValue]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSubjectToggle = (subjectName: string) => {
    console.log("Toggling subject:", subjectName);
    setSelectedSubjects(prev => {
      const newSubjects = prev.includes(subjectName)
        ? prev.filter(name => name !== subjectName)
        : [...prev, subjectName];
      return newSubjects;
    });
  };

  const teacherActivate = async (formData: any) => {
    console.log("Form Data:", formData);
    if (!session?.user?.accessToken) {
      toast.error("Oturum bilgisi bulunamadı");
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.error("En az bir ders seçmelisiniz");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        gender: formData.gender,
        subjects: selectedSubjects,
        title: formData.title,
      };

      const response = await activateTeacherAccount(dataToSubmit, session.user.accessToken );
      console.log("API Response:", response);

      await update({
        ...session,
        user: {
          ...session.user,
          is_active: true
        }
      });

      console.log("Session after update:", session);

      toast.success("Hesabınız başarıyla aktifleştirildi!");
      session.user.is_active = true;
      setIsModalVisible(false);
    } catch (error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (Object.keys(errors).length > 0)
    {
      console.log("Form hataları:", errors);
    }
  }, [errors]);

  if (!isModalVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg relative">
        <button 
          onClick={handleCloseModal}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Hesabınızı Aktifleştirin</h2>
          <p className="text-sm text-gray-500">
            Hesabınız henüz aktif değil, lütfen gerekli bilgileri doldurun. Bu size daha doğru hizmet verebilmemiz için gerekli.
            Anlayışınız için teşekkür ederiz.
          </p>

        </div>

        <form onSubmit={handleSubmit(teacherActivate)} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Ünvan</label>
            <input
              {...register("title")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: Fen Bilimleri Öğretmeni"
            />
            {errors.title && (
              <span className="text-red-500 text-sm">{errors.title.message as string}</span>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Cinsiyet</label>
            <select
              {...register("gender")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seçiniz</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
            {errors.gender && (
              <span className="text-red-500 text-sm">{errors.gender.message as string}</span>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Dersler</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activateTeacherSubjects.map(subject => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => handleSubjectToggle(subject.name)}
                  className={`p-2 text-sm rounded-md border transition-colors ${
                    selectedSubjects.includes(subject.name)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {subject.displayName}
                </button>
              ))}
            </div>
            {errors.subjects && (
              <span className="text-red-500 text-sm">{errors.subjects.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "İşleniyor..." : "Hesabı Aktifleştir"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountActivationModal;