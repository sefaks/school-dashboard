"use client"

import { useServiceWorker } from '@/app/hooks/useServiceWorker';
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// pdf.js worker ayarı
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(true);
  const [iframeHeight, setIframeHeight] = useState(600);

  // responsive height
  useEffect(() => {
    const handleResize = () => {
      setIframeHeight(window.innerWidth < 768 ? 400 : 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PDF yükle
  useEffect(() => {
    if (!pdfInfo?.url) return;
    setLoading(true);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfInfo.url);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        const firstPage = pdfInfo.pageStart - min_page_start + 1;
        setPageNum(firstPage);
        setLoading(false);
      } catch (err) {
        console.error("PDF yüklenemedi:", err);
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfInfo, min_page_start]);

  // Sayfa render et
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async (num: number) => {
      setLoading(true);
      const page = await pdfDoc.getPage(num);

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      setLoading(false);
    };

    renderPage(pageNum);
  }, [pdfDoc, pageNum]);

  // sayfa değiştir
  const handlePrev = () => {
    if (pageNum <= 1) return;
    setPageNum(pageNum - 1);
    onPageChange('prev');
  };

  const handleNext = () => {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    setPageNum(pageNum + 1);
    onPageChange('next');
  };

  if (!pdfInfo?.url) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 border rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {loading && (
        <div className="flex items-center justify-center h-[600px] bg-gray-50 border rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          display: loading ? 'none' : 'block',
          width: '100%',
          maxWidth: '100%',
          height: iframeHeight,
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      />

      <div className="flex justify-between items-center mt-4 w-full">
        <button
          onClick={handlePrev}
          disabled={pageNum <= 1}
          className="px-4 py-2 bg-[#702DFF] text-white rounded disabled:opacity-50"
        >
          {translations.previous}
        </button>

        <span className="text-[#161439]">
          {pageNum} / {pdfDoc?.numPages ?? 0}
        </span>

        <button
          onClick={handleNext}
          disabled={pageNum >= (pdfDoc?.numPages ?? 0)}
          className="px-4 py-2 bg-[#702DFF] text-white rounded disabled:opacity-50"
        >
          {translations.next}
        </button>
      </div>
    </div>
  );
};
