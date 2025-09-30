import React, { use, useState } from "react";
import { contents, students_contents } from "@/app/types/Lesson";
import Image from "next/image";
import { toast } from "react-toastify";
import apiClient from "@/lib/apiClient";
import { useSession } from "next-auth/react";

interface TopicListCardProps {
  topic: contents;
  onSelectTopic: (topic: contents) => void;
  selectedTopic: contents;
  fetchTopics?: () => void; // İçerikleri yenilemek için opsiyonel fonksiyon
}

const TopicListCard: React.FC<TopicListCardProps> = ({ 
  topic, 
  onSelectTopic, 
  selectedTopic,
  fetchTopics
}) => {
  const isSelected = selectedTopic.content_id === topic.content_id;
  const [loading, setLoading] = useState(false);
  const session = useSession();
  
  // İçerik tamamlama durumunu güncelle
  const handleCompleteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Tıklamanın üst öğeye yayılmasını engelle
    
    if (loading) return; // İşlem devam ediyorsa çık
    
    try {
      setLoading(true);
      
      const endpoint = topic.is_completed 
        ? `/teachers/me/contents/${topic.content_id}/reverse-complete`
        : `/teachers/me/contents/${topic.content_id}/complete`;


      await apiClient.post(
            endpoint,
            {}, // Request body (empty in this case)
            {
              headers: {
                Authorization: `Bearer ${session.data?.user.accessToken}`,
              },
            }
          );
      
      topic.is_completed = !topic.is_completed;
      
    } catch (error) {
      console.error("İçerik durumu güncellenirken hata:", error);
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div
      className={`px-[15px] bg-[#FFFF] border ${
        isSelected ? "border-[#702DFF40]" : "border-[#FFF8C6]"
      } rounded-[15px] py-[14px] cursor-pointer`}
      onClick={() => onSelectTopic(topic)}
    >
      <div className="flex items-center gap-2">
        {/* Completion Checkbox - Udemy stili mor kutu */}
        {session.data?.user.role === "teacher" && (
          <div
          onClick={handleCompleteToggle}
          className={`w-[16px] h-[16px] flex items-center justify-center rounded-[4px] cursor-pointer ${
            loading 
              ? "bg-gray-300" 
              : topic.is_completed 
                ? "bg-[#702DFF]" 
                : "border-[1.5px] border-[#C5C6CC]"
          }`}
        >
          {topic.is_completed && !loading && (
            <Image src="/icons/tick-white.svg" width={10} height={10} alt="completed" />
          )}
          
          {loading && (
            <div className="w-[10px] h-[10px] border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        )}
          
          {/* Topic Number */}
        <span className="font-medium text-[12px] leading-[12px] text-[#00000066]">
          {topic.content_number}
        </span>
      </div>

      {/* Topic Name */}
      <p className="text-[#000000] font-semibold text-[14px] leading-[16px] mt-[5px] ml-[23px]">
        {topic.name}
      </p>
    </div>
  );
};

export default TopicListCard;