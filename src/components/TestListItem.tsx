"use client";
import React from "react";
import { ArrowRight } from "lucide-react";

import { ClipboardList, ChevronRight } from 'lucide-react';

const TestListItem = ({ test, onTestClick, currentLanguageContent }) => {
  const handleTestClick = (e, testId) => {
    e.stopPropagation();
    onTestClick(testId);
  };

  return (
    <div
      key={test.id}
      onClick={(e) => handleTestClick(e, test.id)}
      className="w-full border border-gray-200 rounded-lg p-4 mb-3 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Test {test.test_no}</span>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <span className="text-md font-semibold text-gray-900">{test.name}</span>
            </div>
            {test.description && (
              <p className="text-sm text-gray-600 mt-1 ">{test.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
        </div>
      </div>
    </div>
  );
};

export default TestListItem;