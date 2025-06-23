"use client"
import React from 'react';

   // PDF make fontlarını yükle
   import pdfMake from 'pdfmake/build/pdfmake';
   import pdfFonts from 'pdfmake/build/vfs_fonts';

interface AIAnalysisSectionProps {
  analysis: string;
  currentLanguageContent: any;
  activeTab: string;
  studentName?: string;
  reportDates?: {
    startDate: string;
    endDate: string;
  };
}

const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ 
  analysis, 
  currentLanguageContent,
  activeTab,
  studentName = '',
  reportDates
}) => {
  if (activeTab !== 'ai_analysis' || !analysis) return null;



  const sectionStyles = [
    { 
      icon: '📊',
      borderColor: 'border-blue-400',
      shadowColor: 'shadow-blue-100',
      title: 'GENEL PERFORMANS DEĞERLENDİRMESİ'
    },
    { 
      icon: '📚',
      borderColor: 'border-green-400',
      shadowColor: 'shadow-green-100',
      title: 'ÖDEV VE ÇALIŞMA TAKİBİ'
    },
    { 
      icon: '📈',
      borderColor: 'border-purple-400',
      shadowColor: 'shadow-purple-100',
      title: 'AKADEMİK İLERLEME'
    },
    { 
      icon: '💡',
      borderColor: 'border-orange-400',
      shadowColor: 'shadow-orange-100',
      title: 'ÖNERİLER VE AKSIYON PLANI'
    }
  ];

  // ### ile başlayan bölümleri ayır
  const sections = analysis.split(/###\s*\d+\.\s+[A-ZĞÜŞİÖÇ\s]+\n/)
    .filter(Boolean)
    .map(section => section.trim());
    const handleDownloadPDF = async () => {
      pdfMake.vfs = pdfFonts.vfs;
    
      // Font tanımlamaları
      pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      };
    
      // PDF içeriğini oluştur
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: [],
        defaultStyle: {
          font: 'Roboto',
          fontSize: 11,
          lineHeight: 1.3
        },
        styles: {
          header: {
            fontSize: 24,
            bold: true,
            color: '#734af6',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          studentInfo: {
            fontSize: 12,
            color: '#34495E',
            margin: [0, 0, 0, 5],
            bold: true
          },
          reportDate: {
            fontSize: 11,
            color: '#7F8C8D',
            italics: true,
            margin: [0, 0, 0, 20]
          },
          sectionHeader: {
            fontSize: 16,
            bold: true,
            color: '#734af6',
            margin: [0, 20, 0, 10],
            decoration: 'underline',
            decorationStyle: 'solid',
            decorationColor: '#BDC3C7'
          },
          subHeader: {
            fontSize: 14,
            bold: true,
            color: '#16638e',
            margin: [0, 15, 0, 8]
          },
          paragraph: {
            fontSize: 11,
            color: '#2C3E50',
            margin: [0, 5, 0, 5],
            alignment: 'justify'
          }
        },
        footer: function(currentPage, pageCount) {
          return {
            columns: [
              { 
                text: new Date().toLocaleDateString('tr-TR'),
                alignment: 'left',
                margin: [40, 0],
                fontSize: 8,
                color: '#95A5A6'
              },
              {
                text: `Sayfa ${currentPage} / ${pageCount}`,
                alignment: 'right',
                margin: [0, 0, 40, 0],
                fontSize: 8,
                color: '#95A5A6'
              }
            ]
          };
        }
      };
    
      // Başlık ekle
      docDefinition.content.push({
        text: 'Arf - Akıllı Performans Analizi',
        style: 'header'
      });
    
      // Öğrenci bilgileri
      docDefinition.content.push({
        text: `Öğrenci: ${studentName}`,
        style: 'studentInfo'
      });
    
      if (reportDates) {
        docDefinition.content.push({
          text: `Rapor Dönemi: ${new Date(reportDates.startDate).toLocaleDateString('tr-TR')} - ${new Date(reportDates.endDate).toLocaleDateString('tr-TR')}`,
          style: 'reportDate'
        });
      }
    
      // Bölümleri ekle
      sections.forEach((section, index) => {
        if (index >= sectionStyles.length) return;
        const style = sectionStyles[index];
    
        // Bölüm başlığı
        docDefinition.content.push({
          text: style.title,
          style: 'sectionHeader',
          pageBreak: index > 0 ? 'before' : undefined
        });
    
        // Bölüm içeriğini parse et
        const lines = section.split('\n');
        lines.forEach(line => {
          line = line.trim();
          if (!line) return;
    
          // Başlıkları işle
          if (line.startsWith('**') && line.endsWith('**')) {
            docDefinition.content.push({
              text: line.replace(/\*\*/g, ''),
              style: 'subHeader'
            });
            return;
          }
    
          // Madde işaretlerini işle
          if (line.startsWith('-')) {
            docDefinition.content.push({
              text: line.slice(1).trim(),
              style: 'paragraph'
            });
            return;
          }
    
          // Normal paragrafları işle
          docDefinition.content.push({
            text: line,
            style: 'paragraph'
          });
        });
      });
    
      try {
        // PDF oluştur ve indir
        const safeFileName = `${studentName.replace(/\s+/g, '_')}_Performans_Analizi.pdf`;
        pdfMake.createPdf(docDefinition).download(safeFileName);
      } catch (error) {
        console.error('PDF oluşturma hatası:', error);
      }
    };

  // Eğer hiç bölüm yoksa
  if (!sections.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        {currentLanguageContent.ai_analysis_not_found || "AI analizi henüz oluşturulmamış"}
      </div>
    );
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      line = line.trim();
      if (!line) return null;

      // Başlık kontrolü
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={index} className="font-semibold text-gray-800 mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
      }

      // Madde işareti kontrolü
      if (line.startsWith('-')) {
        return (
          <p key={index} className="text-gray-600 ml-4 mb-2">
            {line}
          </p>
        );
      }

      // Normal paragraf
      return (
        <p key={index} className="text-gray-600 mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="mt-6">
        <div className="flex justify-end mb-4">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-3 py-1 bg-[#A78BFA] text-white rounded-lg hover:bg-[#D449F6] transition-colors"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <p className='text-sm'>
          {currentLanguageContent.download_report || "PDF İndir"}

          </p>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          if (index >= sectionStyles.length) return null;

          const style = sectionStyles[index];

          return (
            <div 
              key={index}
              className={`bg-white rounded-lg p-6 border-l-4 ${style.borderColor} ${style.shadowColor} shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{style.icon}</span>
                <h3 className="text-lg font-semibold text-gray-800">
                  {style.title}
                </h3>
              </div>
              
              <div className="prose max-w-none">
                {formatContent(section)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIAnalysisSection;