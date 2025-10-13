// src/components/PdfViewer.tsx
"use client"

import { useServiceWorker } from '@/app/hooks/useServiceWorker';
import { useEffect, useRef } from 'react';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !pdfInfo?.url) return;

    // iframe src'sini mount sonrasında ayarla
    console.log("setting iframe src");
    iframeRef.current.src = `${pdfInfo.url}#page=${pdfInfo.pageStart - min_page_start + 1}&zoom=100&toolbar=0&navpanes=0&scrollbar=0`;
    console.log("Iframe src set to:", iframeRef.current.src);
  }, [pdfInfo, min_page_start]);

  //log src
  console.log("PdfViewer rendered with pdfInfo:", pdfInfo);

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
      ref={iframeRef}
      src={`${pdfInfo.url}#page=${pdfInfo.pageStart - min_page_start + 1}&zoom=100&toolbar=0&navpanes=0&scrollbar=0`}
      width="100%"
      height="600"
      style={{ border: 'none', borderRadius: '0.5rem' }}
      title="PDF Viewer"
    >
      <p>PDF göremiyorsanız <a href={pdfInfo.url} download="document.pdf">buradan indir</a>.</p>
    </iframe>

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
