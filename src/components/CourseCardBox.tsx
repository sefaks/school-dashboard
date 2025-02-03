import React, { useState, useEffect } from "react";
import { Card, Box, Chip, MenuItem, Select, FormControl } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lesson } from "@/app/types/Lesson";
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";

interface CourseCardProps {
  resourceId: number;
  lesson: Lesson;
  isTest: boolean; // Yeni eklenen prop
}

const CourseCardBox: React.FC<CourseCardProps> = ({ lesson, resourceId, isTest }) => {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [imageSrc, setImageSrc] = useState(
    lesson?.lesson_image || "/course1.svg"
  );

  const currentLanguageContent = language === "en" ? en : tr;

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") || "en";
    setLanguage(storedLanguage);
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedPublisher = event.target.value as string;
    setSelectedOption(selectedPublisher);

    const publisher = lesson?.publishes.find(
      (p) => p.publisher === selectedPublisher
    );

    if (publisher) {
      if (isTest) {
        // Eğer isTest=true ise test sayfasına yönlendiriyoruz
        router.push(
          `/list/resources/${resourceId}/tests`
        );
      } else {
        // Normal ders sayfasına yönlendiriyoruz
        router.push(
          `/list/resources/${resourceId}/lessons/${publisher.id}?curriculum_year=${publisher.curriculum_year}&publisher_name=${publisher.publisher}&grade=${publisher.grade}&subject_id=${lesson.subject_id}`
        );
      }
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
        <Select value={selectedOption} onChange={handleChange} displayEmpty>
          <MenuItem value="">{currentLanguageContent.select_publishers}</MenuItem>
          {lesson.publishes.map((p) => (
            <MenuItem key={p.id} value={p.publisher}>
              {p.publisher} - {p.curriculum_year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Card>
  );
};

export default CourseCardBox;
