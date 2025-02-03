"use client";
import React from "react";
import { ArrowRight } from "lucide-react";

const TestListItem = ({ test, onTestClick, currentLanguageContent }) => {
   

    const handleTestClick = (e, testId) => {
        e.stopPropagation();
        onTestClick(testId);
      };
    

    return (
        <div
        key={test.id}
        onClick={(e) => handleTestClick(e, test.id)}
        className="w-full border border-gray-300 rounded-lg p-4 mb-3 bg-white shadow-sm hover:shadow-md transition duration-300 cursor-pointer"
      >
          {/* Test Numarası ve İsmi */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Test {test.test_no}:</span>
            <span className="text-gray-900 font-semibold">{test.name}</span>
          </div>
        </div>
      );
    };


export default TestListItem;