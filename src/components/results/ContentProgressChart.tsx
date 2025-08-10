import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ContentProgressChart = ({ progressData }: { progressData: any }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!progressData) return;
    // Üniteleri unit_no'ya göre sırala
    progressData.all_units.sort((a, b) => a.unit_no - b.unit_no);

    if (progressData?.all_units?.length > 0) {
      // Her ünitenin test verisi varsa filtrele
      const unitContentsMap = new Map();

      // Önce progress_data'dan test verilerini grupla (unitNo bazında)
      progressData.progress_data?.forEach((item) => {
        const unitNo = item.unit_no;
        if (!unitContentsMap.has(unitNo)) {
          unitContentsMap.set(unitNo, []);
        }
        unitContentsMap.get(unitNo).push(item);
      });

      // Tüm üniteler için chartData hazırla
      const formattedData = progressData.all_units.map((unit:any) => {
        const contents = unitContentsMap.get(unit.unit_no) || [];
        const completedContents = contents.filter(content => content.is_completed === true);

        // Content tamamlanmamışsa varsayılan değerler
        if (contents.length === 0) {
          return {
            unitNo: unit.unit_no,
            unitName: unit.unit_name,
            date: '',
            percentage: 0, 
            contentCount: 0,
            hasCompledeContent: false 
          };
        }

        console.log('contents', contents);

        const level_zero_content = contents.find(content => content.level === 0) || {};
        const last_completed_content = contents.filter(content => content.is_completed === true).sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0] || {};
        
        console.log('level_O_content', level_zero_content);
        console.log('last_completed_content', last_completed_content);
        const percentage = Math.round((completedContents.length / contents.length) * 100) || 0;

        return {
          
          unitNo: unit.unit_no,
          unitName: unit.unit_name,
          completedDate: last_completed_content && last_completed_content.completed_at
            ? new Date(last_completed_content.completed_at || level_zero_content.completed_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            : '',
          percentage: percentage,
          contentCount: contents.length,
          content_name: level_zero_content.content_name > 0 ? contents[0].content_name : '',
          hasCompleted: level_zero_content.is_completed,
          lastCompletedContent: last_completed_content.content_name || '',
        };
      })

      setChartData(formattedData);
    }
  }, [progressData]);

  // Tooltip bileşeni
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;

      if (data.testCount === 0) {
        return (
          <div className="bg-white p-3 border border-gray-300 rounded shadow-md">
            <p className="font-bold">Ünite {data.unitNo}: {data.unitName}</p>
            <p>Bu ünitede henüz içerik tamamlanmamış.</p>
          </div>
        );
      }

      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-md">
          <p>Ünite: {data.unitName} (Ünite {data.unitNo})</p>
          {data.last_completed_content != '' && (
                <p className="font-bold"> Son İçerik Adı: {data.lastCompletedContent}</p>
          )}
          <p>Son İlerleyiş: {data.date}</p>
          <p className="text-green-600">Tamamlama Oranı: {data.percentage}%</p>
          <p>Toplam İçerik: {data.contentCount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">İçerik İlerlemesi</h2>

      {chartData.length > 0 ? (
        <div style={{ height: '70vh' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="unitNo"
                name="Ünite"
                label={{
                  value: 'Üniteler',
                  position: 'insideBottomRight',
                  offset: -10
                }}
                tick={{
                  fontSize: 11
                }}
                tickFormatter={(unitNo) => `Ünite ${unitNo}`}
              />

              <YAxis
                type="number"
                domain={[0, 100]}
                label={{
                  value: 'Gelişim (%)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5
                }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Line
                type="monotone"
                dataKey="percentage"
                name="İlerleme Oranı"
                stroke="#3B82F6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={{ 
                  r: 6, 
                  strokeWidth: 2,
                  fill: '#fff',
                  stroke: '#3B82F6'
                }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center text-gray-600">
          Bu ders için test verisi bulunmamaktadır.
        </div>
      )}
    </div>
  );
};

export default ContentProgressChart;
