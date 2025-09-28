"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const SubmissionFeedbackForm = ({ 
    submissionId, 
    currentScore,
    currentFeedback ,
    currentStudentName
  }: { 
    submissionId: string; 
    currentScore: number | null; 
    currentFeedback: string | null; 
    currentStudentName: string;
  }) => {
    const [score, setScore] = useState<number | null>(currentScore);
    const [feedback, setFeedback] = useState<string | null>(currentFeedback);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const router = useRouter();
    // Veri çekme işlemi için useEffect
  
    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      try {
        setLoading(true);
  
        const body = {
          score: score !== null ? Number(score) : null,
          feedback: feedback !== null ? String(feedback) : null,
        };
  
        if (session?.user?.role !== "teacher") {
            toast.error("Yetkisiz işlem.");
            throw new Error("Yetkisiz işlem.");
            }
        
        const response = await fetch(
                `http://127.0.0.1:8000/teachers/me/grade-student-submission/${submissionId}`,
                {
                  method: "PATCH", // POST yerine PUT/PATCH daha uygun
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                  },
                  body: JSON.stringify(body),
                }
              );
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Submission güncellenemedi.");
        }

  
        toast.success("Başarıyla değerlendirildi.");
        // Sayfayı yenilemek yerine router.refresh() kullanabilirsiniz,1 saniye sonra sayfa yenilenecek
        // router refres
        router.refresh();



      } catch (error) {
        console.error("Hata:", error);
        toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
        setIsFormVisible(false); // Formu kapat
      }
    };
  
    return (
      <div className="relative">
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="px-4 py-2 bg-indigo-600 text-white text-m rounded-md hover:bg-indigo-700 transition-colors"
          disabled={loading}
        >
          {isFormVisible ? "Kapat" : "Değerlendir"}
        </button>
  
        {isFormVisible && (
          <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
            <h3 className="text-lg font-semibold mb-4">{currentStudentName} Değerlendirme</h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Not (0-100)
                </label>
                <input
                placeholder="Notunuzu girin..."
                  type="number"
                  value={score ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
                      setScore(value === "" ? null : Number(value));
                    }
                  }}
                  className="w-full text-m p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geri Bildirim
                </label>
                <textarea
                  value={feedback ?? ""}
                  onChange={(e) => setFeedback(e.target.value || null)}
                  className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Geri bildiriminizi yazın..."
                />
              </div>
  
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };
  
  export default SubmissionFeedbackForm;


