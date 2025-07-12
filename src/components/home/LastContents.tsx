"use client"
import React, { useState, useEffect } from "react";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import CourseContinueCard from "./CourseContinueCard";
import apiClient from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import Loading from "@/app/(dashboard)/list/loading";

// Son tamamlanan içerik tipi tanımı
interface LastCompletedContent {
  content_id: number;
  content_name: string;
  content_type: string;
  completed_at: string;
  content_image: string;
  publisher_id: string;
  content_uuid: string;
  page_start: number;
}

const LastContents: React.FC = () => {
  const [language, setLanguage] = useState("en");
  
  // useEffect içinde localStorage'a eriş
  useEffect(() => {
    // Tarayıcıda çalıştığından emin ol
    const storedLanguage = localStorage.getItem("language") || "en";
    setLanguage(storedLanguage);
  }, []);
  
  const currentLanguageContent = language === "en" ? en : tr;
  
  const [completedContents, setCompletedContents] = useState<LastCompletedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const session = useSession();
  
  // Son tamamlanan içerikleri getirme
  useEffect(() => {
    const fetchLastCompletedContents = async () => {
      setLoading(true);
      try {
        console.log("session", session.data?.user.accessToken);
        const response = await apiClient.get('/teachers/me/last-completed-contents',
            {
                headers: {
                Authorization: `Bearer ${session.data?.user.accessToken}`,
                },
            }
        );

        setCompletedContents(response.data);
      } catch (err) {
        console.error("Son tamamlanan içerikler yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLastCompletedContents();
  }, [session.data?.user.accessToken]);
  
  // State to track the current index for the carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Handle navigation
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 2 >= completedContents.length ? 0 : prevIndex + 2
    );
  };
  
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 2 < 0 ? Math.max(0, completedContents.length - 2) : prevIndex - 2
    );
  };
  
  // İçerik tipine göre etiketler oluşturma fonksiyonu
  const getTagsForContentType = (contentType: string) => {
    switch (contentType) {
      case 'ders_anlatim_kitabi':
        return [currentLanguageContent?.course_book || "Ders Anlatım Kitabı"];
      case 'bilgi':
        return [currentLanguageContent?.information || "Bilgi"];
      case 'test':
        return [currentLanguageContent?.test || "Test"];
      case 'video':
        return [currentLanguageContent?.video || "Video"];
      default:
        return [contentType];
    }
  };
  
  // İçerik türüne göre ilerleme durumu (simülasyon amaçlı)
  const getProgressForContent = (content: LastCompletedContent) => {
    // Gerçek uygulamada API'den alınacak ilerleme verisini kullanabilirsiniz
    // Şimdilik tamamlanmış içerikler için 100% döndürüyoruz
    return 100;
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="">
      {/* Title and Navigation */}
      <div className="flex  justify-between items-center">
        {completedContents.length > 2 && (
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
            >
              <ArrowBackIos className="ml-1" fontSize="small" />
            </button>
            <button
              onClick={handleNext}
              className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
            >
              <ArrowForwardIos className="ml-1" fontSize="small" />
            </button>
          </div>
        )}
      </div>
      
      {/* Carousel Container */}
      <div className="flex lg:flex-row flex-col gap-4">
        {completedContents.length === 0 ? (
          <div className="w-full py-8 text-center text-gray-500">
            {currentLanguageContent.no_completed_content || "Henüz tamamlanmış içerik bulunmamaktadır."}
          </div>
        ) : (
          completedContents
            .slice(currentIndex, currentIndex + 2)
            .map((content) => (
              <div key={content.content_id} className="lg:w-1/2">
                <CourseContinueCard
                  image={content.content_image || "/demo.svg"}
                  title={content.content_name}
                  progress={getProgressForContent(content)}
                  tags={getTagsForContentType(content.content_type)}
                  content_id={content.content_id.toString()}
                  publisher_id={content.publisher_id}
                  content_type={content.content_type}
                  content_uuid={content.content_uuid}
                  page_start={content.page_start}
                />
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default LastContents;