"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient_new";

const AdminUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name is required!" }).optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AdminProfileForm = ({ initialData }: { initialData: any }) => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: any) => {
    // Şifre alanı boş ise onu formdan çıkar
    if (!formData.password) {
      delete formData.password;
      delete formData.confirmPassword;
    }

    try {
        const validatedData = AdminUpdateSchema.parse(formData);

        // API'ye gönderim
        const response = await api.patch('/admins/me/update-profile', validatedData, {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`
          }
        });

        if (response.status === 200) {
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
      </div>

      {/* Kurum ID - Sadece göstermek için */}
      <div className="mt-4">
        <label className="font-medium text-gray-700">Kurum ID</label>
        <input
          type="text"
          value={initialData.institution_id}
          disabled
          className="mt-1 p-2 w-full border rounded bg-gray-50"
        />
        <p className="text-gray-500 text-sm mt-1">Bu alan değiştirilemez</p>
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

export default AdminProfileForm;