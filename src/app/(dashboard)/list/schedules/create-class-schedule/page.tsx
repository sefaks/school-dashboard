import { redirect } from 'next/navigation';
import SchedulePage from './add-schedule';
import { serverGet } from '@/lib/apiClient_new';

export default async function SchedulePageWrapper({
  params,
  searchParams,
}: {
  params: { id?: string };
  searchParams: { id?: string };
}) {
  try {
    const scheduleId = searchParams.id;
    
    // Paralel veri çekme işlemleri
    const [classes, teachers, lessons] = await Promise.all([
      serverGet('/admins/me/classes'),
      serverGet('/admins/institution/teachers'),
      serverGet('/admins/institution/lessons')
    ]);
    
    // Eğer scheduleId varsa, ilgili programı getir
    let scheduleData;
    if (scheduleId) {
      scheduleData = await serverGet(`/admins/schedules/${scheduleId}`);
      console.log('Schedule Data:', scheduleData);
    }
    
    // Tüm ilgili verileri birleştir
    const relatedData = {
      classes,
      teachers,
      lessons,
    };

    console.log('Related Data:', relatedData);
    
    return (
      <SchedulePage
        data={scheduleData}
        relatedData={relatedData}
      />
    );
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
    
    // Hata durumunda yönlendirme veya hata sayfası gösterme
    if ((error as Error).message.includes('Authentication')) {
      redirect('/login');
    }
    
    // Genel hata durumu
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Veri yüklenirken bir hata oluştu</h2>
        
        </div>
      </div>
    );
  }
}