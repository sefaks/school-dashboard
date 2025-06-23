// src/components/PdfViewer.tsx
"use client"

import { useServiceWorker } from '@/app/hooks/useServiceWorker';
import { useEffect } from 'react';
// PdfViewer.tsx
interface PdfViewerProps {
  topicId: string;
  initialPage?: number;
  min_page_start: number;
  translations: {
    previous: string;
    next: string;
  };
  pdfInfo: {
    url: string | null;
    pageStart: number;
    pageEnd: number;
  };
  onPageChange: (direction: 'prev' | 'next') => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  topicId,
  initialPage = 1,
  min_page_start,
  translations,
  pdfInfo,
  onPageChange
}) => {
  useServiceWorker();
  
  console.log('PdfViewer rendered with:', { pdfInfo, topicId, initialPage, min_page_start });

  if (!pdfInfo || !pdfInfo.url) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 border rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <iframe
        key={pdfInfo.pageStart}
        src={`${pdfInfo.url}#page=${pdfInfo.pageStart - min_page_start + 1}&zoom=100&toolbar=0&navpanes=0&scrollbar=0`}
        width="100%"
        height="600px"
        className="border rounded-lg shadow-sm"
      />
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onPageChange('prev')}
          disabled={pdfInfo.pageStart <= 1}
          className="px-4 py-2 bg-[#702DFF] text-white rounded disabled:opacity-50"
        >
          {translations.previous}
        </button>
        <span className="text-[#161439]">
          {pdfInfo.pageStart} - {pdfInfo.pageEnd}
        </span>
        <button
          onClick={() => onPageChange('next')}
          disabled={pdfInfo.pageStart >= pdfInfo.pageEnd}
          className="px-4 py-2 bg-[#702DFF] text-white rounded disabled:opacity-50"
        >
          {translations.next}
        </button>
      </div>
    </>
  );
};