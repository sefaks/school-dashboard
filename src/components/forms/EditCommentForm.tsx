"use client"
import React, { useState } from 'react';
import { Pencil, X, Check, Loader2 } from 'lucide-react';
import { teacherUpdateComment } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const EditCommentForm = ({ 
    commentId, 
    initialContent,
    onCancel,
    isOwner = false 
}: {
    commentId: number,
    initialContent: string,
    onCancel?: () => void,
    isOwner?: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleEdit = () => {
    setIsEditing(true);
    setContent(initialContent);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent(initialContent);
    onCancel?.();
  };
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Yorum boş olamaz!");
      return;
    }
  
    setLoading(true);
    try {
      const response = await teacherUpdateComment(
        content, 
        session?.user.accessToken || "", 
        commentId
      );
  
      // Eğer success: true dönerse başarılı bir işlem gerçekleşti
      if (response.success) {  
        toast.success(response.message || "Yorum başarıyla güncellendi!");  // response.message ile gelen mesajı gösterebiliriz
        setIsEditing(false);
        router.refresh();
      } else {
        // Eğer success: false dönerse, hata mesajını göster
        toast.error(response.message || "Yorum güncellenemedi.");
      }
    } catch (error) {
      console.error("Yorum güncelleme hatası:", error);
      toast.error(error instanceof Error ? error.message : "Yorum güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOwner) {
    return null;
  }

  return (
    <div className="relative">
      {!isEditing ? (
        <button
          onClick={handleEdit}
          className="absolute top-0 right-0 p-1 text-gray-500 hover:text-lamaPurple transition-colors"
          title="Yorumu düzenle"
        >
          <Pencil size={16} />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-lamaPurple focus:border-transparent resize-none"
            rows={3}
            disabled={loading}
            placeholder="Yorumunuzu düzenleyin..."
            autoFocus
          />
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <span className="flex items-center gap-1">
                <X size={16} />
                İptal
              </span>
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-lamaPurple text-white rounded-md hover:bg-lamaPurple/90 transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-1">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Kaydet
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditCommentForm;