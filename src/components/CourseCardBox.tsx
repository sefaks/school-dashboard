"use client"
import React, { useState, useEffect } from "react";
import { Card, Box, Chip, MenuItem, Select, FormControl, SelectChangeEvent } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lesson } from "@/app/types/Lesson";
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";

interface CourseCardProps {
  resourceId: number;
  lesson: Lesson;
  isTest: boolean;
  onClick: (lesson: Lesson, publishId?: number) => void;
}

const CourseCardBox: React.FC<CourseCardProps> = ({ lesson, resourceId, isTest, onClick }) => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>(""); // number yerine string kullanıyoruz
  const [imageSrc, setImageSrc] = useState(lesson?.lesson_image || "/course1.svg");
  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr;

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedPublisherId = event.target.value;
    setSelectedOption(selectedPublisherId);
    
    console.log("Selected Publisher ID:", selectedPublisherId);
    // ID'yi number'a çevirip karşılaştırma yapıyoruz
    const publisher = lesson?.publishes.find(
      (p) => p.id === Number(selectedPublisherId)
    );

    if (publisher) {
      onClick(lesson, Number(selectedPublisherId)); // Convert selectedPublisherId to number
    }
  };

  return (
    <Card className="!shadow-custom-daow !rounded-[14px] !p-[15px] !overflow-hidden">
      <Box className="relative w-full">
        <Image
          src={imageSrc}
          alt="Course Image"
          layout="responsive"
          width={400}
          height={200}
          onError={() => setImageSrc("/course1.svg")}
        />
      </Box>
      <Box className="!flex !gap-2 !mt-[10px]">
        <Chip label="Ders Kaynağı" className="!bg-[#35B97D1A] !text-[#018B4D]" />
        <Chip label="Konu" className="!bg-[#EBF2FF] !text-[#1165EF]" />
      </Box>
      <p className="text-[#202020] font-semibold text-[15px] leading-[21px] my-[12px]">
        {lesson.grade}.Sınıf - {lesson.name}
      </p>
      <FormControl fullWidth>
        <Select 
          value={selectedOption}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="">{currentLanguageContent.select_publishers}</MenuItem>
          {lesson.publishes.map((p) => (
            <MenuItem key={p.id} value={p.id.toString()}> {/* ID'yi string olarak veriyoruz */}
              {p.publisher} - {p.curriculum_year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Card>
  );
};

export default CourseCardBox;
