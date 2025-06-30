"use client"
import { Check } from 'lucide-react';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// create props interface

interface TaskStatsWithChartProps {
  activeTab: string;
  analysisData: any;
}

const TaskStatsWithChart: React.FC<TaskStatsWithChartProps> = ({ activeTab, analysisData }) => {
  const getChartData = () => {
    if (!analysisData?.report) return []; // Eğer veri yoksa boş array dön
    const completed = analysisData.report.weekly_task_score || 0;
    const total = analysisData.report.total_weekly_tasks || 0;
    const remaining = Math.max(total - completed, 0); // Negatif olmasını önlüyoruz
    return [
      { name: 'Tamamlanan', value: completed },
      { name: 'Kalan', value: remaining }
    ];
  };
  
  console.log("Analysis Data:", analysisData);
  // Görevleri günlere göre gruplandıran fonksiyon
  const groupTasksByDay = () => {
    if (!analysisData?.tasks || analysisData.tasks.length === 0) return {};
    
    const grouped = {};
    
    // Günlerin sırasını belirlemek için bir dizi
    const dayOrder = [
      "Pazartesi", 
      "Salı", 
      "Çarşamba", 
      "Perşembe", 
      "Cuma", 
      "Cumartesi", 
      "Pazar"
    ];
    
    // Her görevi day_of_week değerine göre grupla
    analysisData.tasks.forEach(task => {
      if (task.day_of_week) {
        // Gün adını al
        const day = task.day_of_week;
        
        // Eğer bu gün için henüz bir grup oluşturulmadıysa, oluştur
        if (!grouped[day]) {
          grouped[day] = [];
        }
        
        // Görevi ilgili gün grubuna ekle
        grouped[day].push(task);
      } else {
        // day_of_week değeri yoksa, "Belirtilmemiş" grubuna ekle
        if (!grouped["Belirtilmemiş"]) {
          grouped["Belirtilmemiş"] = [];
        }
        grouped["Belirtilmemiş"].push(task);
      }
    });
    
    // Günleri doğru sırada göstermek için sıralı bir obje oluştur
    const orderedGrouped = {};
    
    // Önce belirli sıradaki günleri ekle
    dayOrder.forEach(day => {
      if (grouped[day] && grouped[day].length > 0) {
        orderedGrouped[day] = grouped[day];
      }
    });
    
    // Sonra "Belirtilmemiş" grubunu ekle (eğer varsa)
    if (grouped["Belirtilmemiş"] && grouped["Belirtilmemiş"].length > 0) {
      orderedGrouped["Belirtilmemiş"] = grouped["Belirtilmemiş"];
    }
    
    return orderedGrouped;
  };
  
  const groupedTasks = groupTasksByDay();
  const COLORS = ['#22c55e', '#e5e7eb']; // yeşil ve gri

  console.log("Grouped Tasks:", groupedTasks);
  
  return (
    ({ activeTab }) => activeTab === "tasks" && (
      <div className="p-4 border rounded-lg shadow space-y-6">
        {analysisData?.report?.total_weekly_tasks > 0 ? (
          <>
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
              {/* İstatistik ve Grafik Bölümü */}
              <div className="flex flex-row md:w-1/2 space-x-4">
                <div className="grid grid-rows-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Haftalık Görev Sayısı</p>
                    <p className="text-2xl font-bold">{analysisData.report.total_weekly_tasks}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tamamlanan Görevler</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold">
                        {analysisData.report.weekly_task_score} / {analysisData.report.total_weekly_tasks}
                      </p>
                      <span className="text-sm text-green-600">
                        ({Math.round((analysisData.report.weekly_task_score / analysisData.report.total_weekly_tasks) * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} görev`, name]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem'
                        }}
                      />
                    </>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Görev Listesi Bölümü */}
              <div className="md:w-1/2">
                <h3 className="text-lg font-semibold mb-4">Görevler</h3>
                
                {Object.keys(groupedTasks).length > 0 ? (
                  Object.entries(groupedTasks).map(([day, tasks]) => (
                    <div key={day} className="overflow-hidden border rounded-lg shadow mb-4">
                      <div className="bg-gray-100 p-3">
                        <h2 className="text-md font-semibold text-gray-800">{day}</h2>
                      </div>
                      <div className="p-0">
                        {tasks.map((task) => (
                          <div
                            key={task.task_id}
                            className={`border-b p-4 flex items-center justify-between ${
                              task.is_completed ? 'bg-green-50/60' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <p className={`${task.is_completed ? 'text-gray-500' : 'text-gray-900'}`}>
                                {task.task_name}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {task.is_completed ? (
                                <div className="flex items-center text-green-600">
                                  <Check className="w-5 h-5 mr-1" />
                                  <span className="text-sm">Tamamlandı</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <X className="w-5 h-5 mr-1" />
                                  <span className="text-sm">Tamamlanmadı</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 border rounded-lg">
                    <p className="text-gray-500">Görev bulunamadı</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Haftalık görev verisi bulunamadı</p>
          </div>
        )}
      </div>
    )
  );

}
export default TaskStatsWithChart;