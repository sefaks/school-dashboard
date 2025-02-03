"use client"
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 

import { useState } from 'react';
interface InstituteCardProps {
  image: string;
  name: string;
  link: string;
}

const InstituteCard: React.FC<InstituteCardProps> = ({ image, name, link }) => {
  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr; 
  
  return (
    <div className="bg-[#FFFFFF] min-h-[329px] shadow-custom-daow border py-[15px] px-[10px] border-[#F8F9FB] ">
    <div className='flex justify-center flex-col items-center'>
  
      <Image src={image} width={300} height={300} alt="institute" />
      <p className="text-[#202020] mb-[35px] font-semibold text-[20px] leading-[21px] mt-3">
        {name}
      </p>
      </div>
      <Link href={link}>
        <div className="text-[12px] text-center flex justify-center items-center w-full gap-[6px] font-semibold leading-[20px] text-[#323539] rounded-[8px] border border-[#E5E5E7] py-[8px] px-[14px]">
          {currentLanguageContent?.select} 
          <Image src="/right.svg" width={16} height={16} alt="arrow" />
        </div>
      </Link>
    </div>
  );
};

export default InstituteCard;
