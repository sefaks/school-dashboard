"use client"
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

const WeeklySchedule = ({ lessonSchedules, relatedData, header }: { lessonSchedules: any; relatedData: any; header: string }) => {
  const [scheduleMap, setScheduleMap] = useState({});
  const scheduleRef = useRef(null);
  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 - 21:00 arası


  const hourMarkers = [];
  for (let hour = 7; hour <= 21; hour++) {
    hourMarkers.push(`${hour}:00`);
    hourMarkers.push(`${hour}:30`);
  }

  // Ders programını saat ve güne göre düzenle
  useEffect(() => {
    const map = {};
    
    lessonSchedules.forEach(schedule => {
      const day = schedule.day_of_week;
      const startTime = schedule.start_time;
      const endTime = schedule.end_time;
      
      if (!startTime || !endTime) return;
      
      // Saatleri ayrıştır
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // Başlangıç saati (ondalık olarak)
      const startDecimal = startHour + (startMinute / 60);
      // Bitiş saati (ondalık olarak)
      const endDecimal = endHour + (endMinute / 60);
      // Ders süresi (saat olarak)
      const duration = endDecimal - startDecimal;
      
      // Dersin adını ve öğretmenini bul
      const lesson = relatedData?.lessons?.find(l => l.id === schedule.lesson_id);
      const teacher = relatedData?.teachers?.find(t => t.id === schedule.teacher_id);
      const subjectId = lesson?.subject_id || schedule.lesson_id || 0;
      
      const lessonInfo = {
        id: schedule.id || Math.random().toString(36).substr(2, 9),
        name: lesson?.name || 'Bilinmeyen Ders',
        teacher: teacher ? `${teacher.name} ${teacher.surname}` : 'Bilinmeyen Öğretmen',
        startDecimal,
        endDecimal,
        duration,
        startTime,
        endTime,
        color: generateColor(subjectId)
      };

      if (lessonInfo.name ==='Sosyal Bilgiler' || lessonInfo.name ==='Sosyal Bilgiler '){
        lessonInfo.name = 'Sosyal B.';
      }

      console.log("lessonInfo",lessonInfo);
      
      if (!map[day]) {
        map[day] = [];
      }
      
      map[day].push(lessonInfo);
    });
    
    setScheduleMap(map);
  }, [lessonSchedules, relatedData]);
  
  //Derslerin subject_id'sine göre renk üretme fonksiyonu
  const generateColor = (id) => {
    const colors = [
      'bg-blue-200 border-blue-400',
      'bg-green-200 border-green-400',
      'bg-yellow-200 border-yellow-400',
      'bg-purple-200 border-purple-400',
      'bg-pink-200 border-pink-400',
      'bg-indigo-200 border-indigo-400',
      'bg-red-200 border-red-400',
      'bg-orange-200 border-orange-400',
      'bg-teal-200 border-teal-400'
    ];
    if (id < 0 || id ===undefined || id === null) {
      return colors[0]; 
    }
    
    return colors[id % colors.length];
  };

  const getPositionStyle = (lesson) => {
    const pixelsPerHour = 60; // 1 saat = 60px
    
    const startOffset = (lesson.startDecimal - 7) * pixelsPerHour;
    
    // Ders süresini piksel cinsinden hesapla (minimum 30px yükseklik)
    const heightInPixels = Math.max(lesson.duration * pixelsPerHour, 60);
    
    return {
      top: `${startOffset}px`,
      height: `${heightInPixels}px`
    };
  };


const viewLessonStartAndEndTime = (start: any, end: any) => {

    if (start && end){

        const start_time = start.toString();
        const end_time = end.toString();
        
        try {
            // Dersin başlangıç ve bitiş saatlerini formatla
            const startParts = start_time.split(':');
            const endParts = end_time.split(':');
            
            if (startParts.length < 2 || endParts.length < 2) {
              return `${start} - ${end}`; // Bölünemiyorsa orijinal değerleri döndür
            }
            
            return `${startParts[0]}:${startParts[1]} - ${endParts[0]}:${endParts[1]}`;
          } catch (error) {
            console.error('Zaman formatlanırken hata oluştu:', error);
            return `${start} - ${end}`; // Hata durumunda orijinal değerleri döndür
          }
    }else {
        return `${start} - ${end}`
    }
  };

  const downloadSchedule = async () => {
    console.log("scheduleRef",scheduleRef.current)
   if (!scheduleRef.current) return;
   console.log("Takvim indiriliyor...");

   console.log((scheduleRef.current as HTMLElement).innerHTML);
   await document.fonts.ready;

   // Yükleniyor göstergesi eklenebilir
   html2canvas(scheduleRef.current, {
    scale: 3,
  }).then(canvas => {
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = header ? `${header}.png` : 'ders-programi.png';
    link.click();
    }).catch(err => {
   console.error('Takvim indirme hatası:', err);
   toast.error('Takvim indirilirken bir hata oluştu.');
    });
    }

  return (
    <div className="mt-8 bg-white border rounded-lg overflow-hidden">
    <div className="flex justify-between items-center bg-gray-50 border-b p-4">
        <h2 className="text-xl font-bold">{header}</h2>
        <button 
          onClick={() => {
            console.log("Butona tıklandı");
            downloadSchedule();
        }}
        type='button'
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Programı İndir
        </button>
    </div>
      
    <div className="grid grid-cols-8 border-b min-w-[800px]">
        {/* Saat göstergesi sütunu */}
        <div className="border-r py-2 px-1 text-center font-medium">Saat</div>
        
        {/* Gün başlıkları */}
        {days.map(day => (
          <div key={day} className="py-2 px-1 text-center font-medium border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      {/* Takvim gövdesi */}
      <div className="relative">
      <div className="grid grid-cols-8 min-w-[800px]" ref={scheduleRef}>
          {/* Saat göstergesi sütunu */}
          <div className="border-r">
            {hourMarkers.map((timeMarker, index) => {
              const [hour, minute] = timeMarker.split(':');
              const isFullHour = minute === '00';
              
              return (
                <div 
                  key={timeMarker} 
                  className={`h-[30px] ${isFullHour ? 'border-b' : 'border-b border-dashed border-gray-200'}`}
                >
                  {isFullHour && (
                    <div className="text-xs text-right pr-1 pt-0">{hour}:00</div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Günler için sütunlar */}
          {days.map(day => (
            <div key={day} className="border-r last:border-r-0 relative">
            {/* Saat çizgileri - yarım saatlik çizgiler */}
            {hourMarkers.map((timeMarker, index) => {
                const [hour, minute] = timeMarker.split(':');
                const isFullHour = minute === '00';

                return (
                    <div 
                      key={timeMarker} 
                      className={`h-[30px] ${isFullHour ? 'border-b' : 'border-b border-dashed border-gray-200'}`}
                    />
                  );
                })}
                
              
              {/* O güne ait dersler */}
              {scheduleMap[day]?.map(lesson => (
                <div
                  key={lesson.id}
                  className={`absolute left-0 right-0 mx-1 p-1 rounded border-l-4 ${lesson.color} shadow-sm overflow-hidden`}
                  style={getPositionStyle(lesson)}
                >
                  <div className="text-xs font-bold ">{lesson.name}</div>
                  <div className="text-xs ">{lesson.teacher}</div>
                  <div className="text-xs">{viewLessonStartAndEndTime(lesson.startTime,lesson.endTime)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Boş takvim durumu */}
      {Object.keys(scheduleMap).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz hiç ders eklenmedi. Yukarıdaki günlerden ders ekleyerek takvim görünümünü güncelleyebilirsiniz.
        </div>
      )}
    </div>
  );
};

export default WeeklySchedule;