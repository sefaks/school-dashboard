"use client"
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

  const COLORS = ['#22c55e', '#e5e7eb']; // yeşil ve gri

  return (
    activeTab === "tasks" && (
      <div className="p-4 border rounded-lg shadow space-y-6 flex flex-row ">
        {analysisData?.report?.total_weekly_tasks > 0 ? (
          <>
            <div className="grid grid-rows-2 gap-4 ">
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
                        {/* Bilgilendirme: Bu kadar görevde şu kadar yapıldı */}

          </>

          

        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Haftalık görev verisi bulunamadı</p>
          </div>
        )}
      </div>
    )
  );
};

export default TaskStatsWithChart;