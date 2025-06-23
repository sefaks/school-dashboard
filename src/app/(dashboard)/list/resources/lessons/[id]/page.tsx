"use client"
import React, { useEffect, useState } from 'react';
import { Card } from "@mui/material";
import { Book } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ArrowBackIos } from "@mui/icons-material";
import Image from 'next/image';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 
import { getContentTypes } from '@/lib/actions';
import Loading from '../../../loading';
import { parse } from 'path';

interface ContentType {
  type: string;
  name: string;
}

const Page = () => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const publisherId = params.id;
  const curriculumYear = searchParams.get('curriculum_year');
  const publisherName = searchParams.get('publisher_name');
  const grade = searchParams.get('grade');
  const subjectId = searchParams.get('subject_id');

  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr; 

  useEffect(() => {
    const fetchContentTypes = async () => {
            try {
            setLoading(true);
            const response = await getContentTypes(parseInt(Array.isArray(publisherId) ? publisherId[0] : publisherId))
            console.log("Content Types:", response);
            // String array'i ContentType array'ine dönüştür
            const formattedContentTypes: ContentType[] = response.map((type: string) => ({
                type: type,
                name: getContentTypeName(type)
            }));
            
            setContentTypes(formattedContentTypes);
            setLoading(false);
            } catch (error) {
            console.error("Error fetching content types:", error);
            setLoading(false);
        }
    };

    fetchContentTypes();
  }, [publisherId]);


  const getContentTypeName = (type: string): string => {
    switch(type) {
      case 'ders_anlatim_kitabi':
        return 'Ders Kitabı';
      case 'konu_ozeti':
        return 'Konu Özeti';
      case 'kazanim_kavrama':
        return 'Kazanım Kavrama';
      default:
        return type;
    }
  };



  const handleContentTypeClick = (contentType: string) => {
    router.push(
      `/list/resources/lessons/${publisherId}/${contentType}`
    );
  };

  if (loading) {
    return (
      <Loading/>
    );
  }

  
return (
  <div className="px-[22px] xl:px-[30px] rounded-[14px] py-[25px] bg-[#f4f5f7]">
    <div className="flex mb-[20px] items-center gap-[20px]">
      <button
        onClick={() => router.back()}
        className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
      >
        <ArrowBackIos fontSize="small" className="pl-[3px]" />
      </button>
      <p className="font-semibold text-[24px] leading-[29px] text-textColor">
        {currentLanguageContent.lessons}
      </p>
    </div>
    
    {contentTypes.length === 0 || !contentTypes ? (
      <div className="flex flex-col items-center justify-center py-10">
        <Image 
          src="/images/no-data-2.png" 
          alt="No content" 
          width={200} 
          height={200} 
          className="mb-4"
        />
        <p className="text-gray-500 text-lg">
          {currentLanguageContent.no_content_available || "Henüz içerik bulunmamaktadır"}
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((contentType, index) => (
          <Card
            key={index}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleContentTypeClick(contentType.type)}
          >
            <div className="flex items-center gap-4 rounded-lg">
              <div className="/10 p-3 rounded-lg ">
                <Image src="/images/wait_book.png" alt="Book" width={70} height={70} />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-800">
                  {contentType.name}
                </h2>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )}
  </div>
);
};

export default Page;