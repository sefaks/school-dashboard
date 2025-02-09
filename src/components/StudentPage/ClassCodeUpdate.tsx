"use client";
import React, { useState } from "react";
import { Edit, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import api from "@/lib/apiClient_new";

interface ClassCodeDisplayProps {
  firstClass: any;
  role: string;
  id: number;
  onUpdateClassCode?: (newClassCode: string) => void;
}

const ClassCodeDisplay: React.FC<ClassCodeDisplayProps> = ({
  firstClass,
  role,
  id,
  onUpdateClassCode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClassCode, setEditedClassCode] = useState(
    firstClass?.class_code || ""
  );
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession(); // Oturum bilgilerini al

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.patch(`admins/update-student-class-code/${id}`, {
        //uppercase class_code
        class_code: editedClassCode.toUpperCase(),
        student_id: id,
      });
  
      const data = response.data;
  
      toast.success("Sınıf kodu başarıyla güncellendi");
      // Eğer onUpdateClassCode yoksa bile devam etmek istiyorsanız:
      onUpdateClassCode && onUpdateClassCode(data.class_code);
  
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error:any) {
      console.error("Error updating class code:", error);
      // erroru toast ile kullanıcıya göster
        toast.error("Sınıf kodu güncellenirken bir hata oluştu: " + error.response.data.detail);

    //eğer hata verdiyse class kodunu eski haline getir
    setEditedClassCode(firstClass.class_code);
    //tekrar yenile
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };
  

  if (role !== "admin") {
    return (
      <div>
        <h1 className="text-xl font-semibold">{firstClass?.class_code}</h1>
        <span className="text-sm text-gray-400">Sınıf</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {isEditing ? (
        <input
          type="text"
          value={editedClassCode}
          onChange={(e) => setEditedClassCode(e.target.value)}
          className="text-xl font-semibold w-full border rounded px-2 py-1"
          disabled={loading}
        />
      ) : (
        <h1 className="text-xl font-semibold">{firstClass?.class_code}</h1>
      )}
      <button
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        isEditing ? handleSave() : setIsEditing(true);
      }}
        className="text-gray-500 hover:text-gray-700"
        disabled={loading}
      >
        {loading ? "..." : isEditing ? <Save size={20} /> : <Edit size={20} />}
      </button>
      {isEditing && <span className="text-sm text-gray-400">Sınıf</span>}
    </div>
  );
};

export default ClassCodeDisplay;
