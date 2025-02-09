'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";

const AssignmentTests = ({ assignment }: { assignment: any }) => {
  const router = useRouter();

  

  const handleStartTest = (testId:number) => {
    // Test başlatma rotasına yönlendirme
    router.push(`/list/resources/${testId}`);
  };

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);

  const currentLanguageContent = language === "en" ? en : tr;


  return (
    <div className="bg-white p-6 rounded-md shadow mt-2">
      <h2 className="text-lg font-semibold text-lamaPurple">Testler</h2>
      
      {assignment.assignment_test.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {assignment.assignment_test.map((testItem:any) => (
            <div key={testItem.tests.id} className="flex flex-row items-center gap-2">
              <Image 
                src="/icons/test.png" 
                width={42} 
                height={42} 
                alt="test icon" 
                className="mr-2"
              />
              <li className="text-sm text-gray-700 flex-grow">
                {testItem.tests.test_no} - {testItem.tests.name}
              </li>
            
            </div>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-2">
          {currentLanguageContent.no_test}
        </p>
      )}
    </div>
  );
};

export default AssignmentTests;