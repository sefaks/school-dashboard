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
}

const CourseCardBox: React.FC<CourseCardProps> = ({ lesson, resourceId, isTest, onClick }) => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>(""); // number yerine string kullanıyoruz
  const [imageSrc, setImageSrc] = useState(lesson?.lesson_image || "/course1.svg");
  
  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr;

 

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedPublisher = event.target.value as string;
    setSelectedOption(selectedPublisher);

    // Find the publisher object by its name
    const publisher = lesson?.publishes.find(
      (p) => p.publisher === selectedPublisher
    );
    const year = publisher?.curriculum_year;
    console.log(year);

    if (publisher) {
      console.log("Is Test:", isTest);

      // Redirect to the publisher's page using their ID
      if (isTest !== false) {
        router.push(`/list/resources/test-types?publish_id=${publisher.id}`);  // ✅ isTest'e göre yönlendirme yapıldı

      } else
        router.push(
          `/list/resources/lessons/${publisher.id}`
        );
    }
  };

  const lessonName = lesson?.name || currentLanguageContent.loading;

  return (
    <Card className="shadow-lg rounded-xl p-4 overflow-hidden">
      <Box className="relative w-full aspect-w-2 aspect-h-1">
        <div className="relative w-full h-48">
          <Image
            src={imageSrc}
            alt="Course Image"
            layout="fill"
            objectFit="cover"
            onError={() => setImageSrc("/course1.svg")}
            className="rounded-lg"
          />
        </div>
      </Box>
      
      <Box className="flex gap-2 mt-3">
        <Chip
          label="Ders Kaynağı"
          variant="outlined"
          sx={{
            backgroundColor: "#35B97D1A",
            color: "#018B4D",
            fontWeight: "medium",
          }}
          className="rounded-md border-0"
        />
        <Chip
          label="Konu"
          variant="outlined"
          sx={{
            backgroundColor: "#EBF2FF",
            color: "#1165EF",
            fontWeight: "medium",
          }}
          className="rounded-md border-0"
        />
      </Box>

      <div>
        <p className="text-gray-800 font-semibold text-base leading-snug my-3">
          {lessonName} - {lesson?.grade} .{currentLanguageContent.grade}
        </p>
        
        <div className="mt-4">
          <FormControl fullWidth>
            <Select
              value={selectedOption}
              onChange={handleChange}
              displayEmpty
              renderValue={(selected) => {
                if (selected === "") {
                  return <span>{currentLanguageContent.select_publishers}</span>;
                }
                return selected;
              }}
              sx={{
                "& .MuiSelect-root": {
                  py: 2.5,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {lesson?.publishes?.map((publish, index) => (
                <MenuItem key={index} value={publish.publisher}>
                  <span>{publish.publisher} - {publish.curriculum_year}</span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
    </Card>
  );
};

export default CourseCardBox;