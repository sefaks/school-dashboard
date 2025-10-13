// src/components/PdfViewer.tsx
"use client"
import { useServiceWorker } from '@/app/hooks/useServiceWorker';
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Worker dosyasını ayarla
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive kontrol
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PDF yükle
  useEffect(() => {
    if (!pdfInfo?.url) return;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        if (!pdfInfo.url) throw new Error('PDF URL is null');
        const pdf = await pdfjsLib.getDocument(pdfInfo.url).promise;
        setPdf(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(pdfInfo.pageStart);
      } catch (error) {
        console.error('PDF yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfInfo?.url]);

  // Sayfayı render et
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const pageNum = currentPage;
        if (pageNum < 1 || pageNum > totalPages) return;

        const page = await pdf.getPage(pageNum);
        const scale = zoom / 100;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext: pdfjsLib.RenderParams = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error('Sayfa render edilirken hata:', error);
      }
    };

    renderPage();
  }, [pdf, currentPage, zoom, totalPages]);

  // Sayfa değişikliğini kontrol et
  useEffect(() => {
    setCurrentPage(pdfInfo.pageStart);
  }, [pdfInfo.pageStart]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 20, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 20, 50));
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value) || 1;
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 border rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!pdf || !pdfInfo?.url) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 border rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 mb-4">PDF yüklenemedi</p>
          <a
            href={pdfInfo?.url}
            download="document.pdf"
            className="px-4 py-2 bg-[#702DFF] text-white rounded hover:opacity-90"
          >
            PDF'i indir
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Sayfa navigasyonu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange('prev')}
            disabled={pdfInfo.pageStart <= min_page_start}
            className="px-3 py-2 bg-[#702DFF] text-white rounded disabled:opacity-50 hover:opacity-90 transition text-sm"
          >
            {translations.previous}
          </button>

          <div className="flex items-center gap-1">
            <input
              type="number"
              min={min_page_start}
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              className="w-16 px-2 py-2 border border-gray-300 rounded text-center text-sm"
            />
            <span className="text-gray-600 text-sm whitespace-nowrap">/ {totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange('next')}
            disabled={pdfInfo.pageEnd >= totalPages}
            className="px-3 py-2 bg-[#702DFF] text-white rounded disabled:opacity-50 hover:opacity-90 transition text-sm"
          >
            {translations.next}
          </button>
        </div>

        {/* Zoom kontrolleri */}
        <div className="border-l border-gray-300 h-8 hidden sm:block"></div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <button
            onClick={handleZoomOut}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
          >
            −
          </button>

          <span className="text-gray-600 w-14 text-center text-sm font-medium">{zoom}%</span>

          <button
            onClick={handleZoomIn}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex justify-center bg-gray-50 rounded-lg p-4 overflow-auto max-h-[calc(100vh-300px)] border border-gray-200">
        <canvas
          ref={canvasRef}
          className="bg-white shadow-lg rounded-lg max-w-full h-auto"
        />
      </div>

      {/* Sayfa bilgisi */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Sayfa {pdfInfo.pageStart} - {pdfInfo.pageEnd}
        </span>
        <span>Toplam: {totalPages} sayfa</span>
      </div>
    </div>
  );
};