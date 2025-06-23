"use client";
import React, { useEffect, useState } from "react";
import { ArrowBackIos } from "@mui/icons-material";
import Image from "next/image";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation'
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 

import Loading from "@/app/(dashboard)/list/loading";
import { PdfViewer } from "@/components/LessonsPage/PdfViewer";
import usePdfLoader from "@/components/LessonsPage/UsePdfLoader";
import Notes from "@/components/LessonsPage/Notes";
import ChatBox from "@/components/LessonsPage/ChatBox";
import TopicsList from "@/components/LessonsPage/TopicList";
import { useSession } from "next-auth/react";

// Topic Page Component
const Page = () => {
  const router = useRouter();
  const [isContent, setIsContent] = useState(true); // Toggle between "Content" and "Toolbar"
  const [isNotes, setIsNotes] = useState(true); // Toggle between "Notes" and "Chatbot"
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  //get topicId with useParams
  const params = useParams();
  const topicId = params.topic_id; 

  const searchParams = useSearchParams()
  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  // page_start is the page number to start the pdf from
  const page_start = searchParams.get('page_start') || 1;
  //set content type from url. url example: /list/resources/lessons/id/content_type
  const pathName = usePathname()
  const content_type = pathName.split('/')[5] || 'pdf'; // Default to 'pdf' if not found

  const session = useSession();
  


  const { isLoading, loadPdf, pdfInfo, topicPageContent, setPdfInfo,isError404 } = usePdfLoader();


  useEffect(() => {
    console.log('Page component triggering loadPdf');
    if (topicId) {
      loadPdf(topicId.toString(), Number(page_start));
    }
  }, [topicId, page_start, loadPdf]);
  

  const currentLanguageContent = language === "en" ? en : tr; 

  const min_page_start = Number(searchParams.get('min_page_start')) || 1;

  console.log("topicId:", topicId);
  console.log("page_start:", min_page_start);


  console.log(
    "topics id is ",topicId
  )
  
  const handlePageChange = (direction: 'prev' | 'next') => {
    setPdfInfo(prev => {
      const newPage = direction === 'prev'
        ? Math.max(prev.pageStart - 1, 1)
        : Math.min(prev.pageStart + 1, prev.pageEnd);
      return {
        ...prev,
        pageStart: newPage
      };
    });
  };

  if (isLoading ) {
    return (
      <div className="flex items-center justify-center h-[50vh] "> {/* Added fixed height */}
          <div className="flex flex-col items-center">
              <img
                src="/images/downloading-book2.png"
                alt="Loading book"
                className="w-24 h-24 object-contain" 
              />
             
            <div className="flex flex-col items-center space-y-2"> {/* Changed to column layout */}
              <Loading />
            </div>
          </div>
      </div>
    );
  }

  if (isError404) { // Bu state'i usePdfLoader hook'undan gelmeli
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="bg-[#fafbfc] p-6 rounded-lg shadow-md max-w-sm w-full">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src="/images/not-found.png"
                alt="Content not found"
                className="w-24 h-24 object-contain"
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-gray-800 font-medium text-lg">
                {currentLanguageContent.content_not_found || "İçerik bulunamadı"}
              </span>
              <p className="text-center text-md text-gray-600">
                {currentLanguageContent.content_not_found_description || "Aradığınız içerik mevcut değil veya erişim izniniz yok."}
              </p>
              <button 
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                {currentLanguageContent.go_back || "Geri Dön"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[22px] xl:px-[24px] md:h-screen rounded-[14px] py-[27px] bg-[#f4f5f7] flex flex-col">
      {/* Header Section */}
     
      <div className="flex sm:flex-row flex-col sm:mb-0 mb-4 justify-between items-center">
        <div className="flex mb-[20px] items-center gap-[20px]">
          <button onClick={()=>router.back()} className="bg-white border p-2 rounded-[10px] hover:bg-gray-300">
            <ArrowBackIos fontSize="small" className="pl-[3px]" />
          </button>
          <p className="font-semibold text-[24px] leading-[29px] text-textColor">
            {currentLanguageContent.course_content || "Ders İçeriği"}
          </p>
         
        </div>
        {session.data?.user.role && session.data.user.role != "admin" && (

              <div className="flex items-center gap-[15px]">
              <button
                onClick={() => setIsContent(true)}
                className={`flex ${
                  !isContent ? "bg-[#A6A6A61F] text-[#090909]" : "bg-[#090909] text-white"
                } items-center py-[4px] font-medium text-[16px] leading-[20px] gap-[6px] px-[10px] rounded-[200px] h-[41px]`}
              >
              {currentLanguageContent.content || "İçerik"}
                <Image
                  src={`/icons/${!isContent ? "toolbar" : "content"}.svg`}
                  width={25}
                  height={30}
                  alt="no image"
                />
              </button>
              <button
                onClick={() => setIsContent(false)}
                className={`flex ${
                  isContent ? "bg-[#A6A6A61F] text-[#090909]" : "bg-[#090909] text-white"
                } items-center py-[4px] font-medium text-[16px] leading-[20px] gap-[6px] px-[10px] rounded-[200px] h-[41px]`}
              >
                {currentLanguageContent.toolbar || "Araç Çubuğu"}
                <Image
                  src={`/icons/${isContent ? "toolbar" : "content"}.svg`}
                  width={25}
                  height={30}
                  alt="no image"
                />
              </button>
              </div>
            
        )}
      </div>

      {/* Grid Section */}
      <div className="flex-grow md:min-h-0 md:grid-cols-[50%,auto] lg:grid-cols-[60%,auto] grid xl:grid-cols-[70%,auto] gap-[16px]">
        {/* Main Content Area */}
        <div className="border px-[40px] py-[27px] bg-[#F5F5DC] border-[#FFFFFF] shadow-custom-daow rounded-[14px] overflow-auto">
          <p className="font-semibold text-[20px] leading-[24px] text-[#161439]">
           
          </p>
          
          <div className="my-3">


          <div className="my-3">
            <PdfViewer 
              topicId={topicId?.toString() || ''} 
              initialPage={ 1}
              min_page_start={min_page_start}
              translations={{
                previous: currentLanguageContent.previous,
                next: currentLanguageContent.next
              }}
              pdfInfo={pdfInfo}
              onPageChange={handlePageChange}
            />
          </div>
    </div>
                

        </div>

        {/* Right Side Panel */}
        {isContent ? (
          // Pass topics + onSelectTopic to TopicsList
          <TopicsList
            content_id={topicId?.toString() ?? ""}
            setPdfInfo={setPdfInfo}
          />
        ) : (

          session.data?.user.role && session.data.user.role != "admin" && (
            <div className="border-[#FFFFFF] bg-[#FFFFFF] px-[16px] flex flex-col py-[19px] shadow-custom-daow rounded-[14px]">
            <div className="bg-[#f6f6f6] flex w-full rounded-full gap-[6px] p-[8px]">
              {/* Notes Tab */}
              <div
                onClick={() => setIsNotes(true)}
                className={`flex w-full ${
                  isNotes ? "text-[#702DFF] shadow-custom-black" : "text-[#090909]"
                } px-[33px] py-[7px] rounded-full items-center gap-2 justify-center cursor-pointer`}
              >
                <Image
                  src={`/icons/${isNotes ? "edit" : "editBlack"}.svg`}
                  width={10.93}
                  height={11.38}
                  alt="editIcon"
                />
                <span>{currentLanguageContent.notes}</span>
              </div>

              {/* Chatbot Tab */}
              <div
                onClick={() => setIsNotes(false)}
                className={`flex w-full ${
                  !isNotes ? "text-[#702DFF] shadow-custom-black" : "text-[#090909]"
                } px-[33px] py-[7px] rounded-full items-center gap-2 justify-center cursor-pointer`}
              >
                <Image
                  src={`/${isNotes ? "chatbot" : "chatbot2"}.svg`}
                  width={18}
                  height={18}
                  alt="editIcon"
                />
                <span className="flex-shrink-0">{currentLanguageContent.chatbot || "Arf'a Sor"}</span>
              </div>
            </div>
            {/* Render either Notes or ChatBot */}
            {isNotes ? <Notes id={topicId?.toString() || ''} /> : <ChatBox />}
          </div>
      
        )
        )}
      </div>
    </div>
  );
};

export default Page;
