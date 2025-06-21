"use client"

import { fetchPdfContent, getContentByContentId } from '@/lib/actions';
import { set } from 'date-fns';
import { useState, useCallback, useEffect } from 'react';

interface PdfInfo {
  url: string | null;
  pageStart: number;
  pageEnd: number;
}
export const usePdfLoader = () => {
    const [pdfInfo, setPdfInfo] = useState<PdfInfo>({
      url: null,
      pageStart: 1,
      pageEnd: 1
    });
    const [topicPageContent, setTopicPageContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError404, setIsError404] = useState(false);

  
    const loadPdf = useCallback(async (topicId: string, initialPage: number = 1) => {
      if (!topicId) {
        console.log('No topicId provided');
        return;
      }
  
      console.log('Loading PDF for topicId:', topicId);
      setPdfInfo({ url: null, pageStart: 1, pageEnd: 1 });
      setIsLoading(true);
            
      try {
        // Cache'de yoksa PDF'i API'den al
        console.log('Fetching PDF from API');
        const response = await fetchPdfContent(topicId);
        console.log('repsonse type:', typeof response);
        console.log('Response data type:', typeof response);

  
  
        // PDF URL'ini ayarla
        const pdfUrl = URL.createObjectURL(new Blob([response], { type: "application/pdf" }));
        setPdfInfo({
          url: pdfUrl,
          pageStart: initialPage,
          pageEnd: initialPage + 1
        });
        setTopicPageContent({ loaded: true }); // PDF yüklendiğini belirtmek için
        setIsLoading(false);
  
      } catch (error) {
        console.log('Error loading PDF:', error);
        setPdfInfo({ url: null, pageStart: 1, pageEnd: 1 });
        setTopicPageContent(null);
        setIsLoading(false);
        setIsError404(true);
      } 
    }, []);
  
    useEffect(() => {
      return () => {
        if (pdfInfo.url) {
          URL.revokeObjectURL(pdfInfo.url);
        }
      };
    }, [pdfInfo.url]);
  
   
  
    return {
      pdfInfo,
        setPdfInfo,
      topicPageContent,
      loadPdf,
      isLoading,
      isError404
    };
  };

export default usePdfLoader;