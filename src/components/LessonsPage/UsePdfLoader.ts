"use client"

import apiClient from '@/lib/apiClient';
import axios from 'axios';
import { set } from 'date-fns';
import { useSession } from 'next-auth/react';
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
    const session = useSession();
  
    const loadPdf = useCallback(async (topicId: string, initialPage: number = 1) => {
      if (!topicId) {
        console.log('No topicId provided');
        return;
      }
  
      console.log('Loading PDF for topicId:', topicId);
      setPdfInfo({ url: null, pageStart: 1, pageEnd: 1 });
      setIsLoading(true);
            
      try {
        
        /*
        if ('caches' in window) {
          const cache = await caches.open('pdf-cache-v1');
          const requestUrl = `${window.location.origin}/lessons/contents/${topicId}`;
          
          const cachedResponse = await cache.match(`/lessons/contents/${topicId}`);

          if (cachedResponse) {
            console.log('Found PDF in cache');
            const cachedData = await cachedResponse.blob();
            const pdfUrl = URL.createObjectURL(cachedData);
            
            setPdfInfo({
              url: pdfUrl,
              pageStart: initialPage,
              pageEnd: initialPage + 1
            });
            setTopicPageContent({ loaded: true }); 
            setIsLoading(false);
            return;
          }
        }
        */
        // Cache'de yoksa PDF'i API'den al
        console.log('Fetching PDF from API');
        //fetch pdf with axios  
        const response = await apiClient.get(`/lessons/contents/${topicId}`, {
          responseType: 'blob',
        });
        const contentType = response.headers['content-type'];
        console.log('Content-Type:', contentType);
        console.log('PDF fetched successfully:', response)

        if ('caches' in window) {
          const cache = await caches.open('pdf-cache-v1');
          const request = new Request(`/lessons/contents/${topicId}`);
          const responseToCache = new Response(response.data);
          await cache.put(request, responseToCache);

        }

        // PDF URL'ini ayarla
        const pdfUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
        console.log('PDF URL created:', pdfUrl);
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