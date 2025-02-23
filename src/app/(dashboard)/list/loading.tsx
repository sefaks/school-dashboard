"use client"
import exp from "constants";
import { useEffect, useState } from "react";
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 

const Loading = () => {
  const [language, setLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);
  const currentLanguageContent = language === "en" ? en : tr;

//loading
const [loading, setLoading] = useState(true);
return (
  <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
          <span className="mt-2 text-blue-500">{currentLanguageContent.loading}</span>
        </div>
   );
  };
  
  export default Loading;
  