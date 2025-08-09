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

const TestProgressChart = ({ progressData }: { progressData: any }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!progressData) return;
    // Üniteleri unit_no'ya göre sırala
    progressData.all_units.sort((a, b) => a.unit_no - b.unit_no);

    if (progressData?.all_units?.length > 0) {
      // Her ünitenin test verisi varsa filtrele
      const unitTestsMap = new Map();

      // Önce progress_data'dan test verilerini grupla (unitNo bazında)
      progressData.progress_data?.forEach((item) => {
        const unitNo = item.unit_no;
        if (!unitTestsMap.has(unitNo)) {
          unitTestsMap.set(unitNo, []);
        }
        unitTestsMap.get(unitNo).push(item);
      });

      // Tüm üniteler için chartData hazırla
      const formattedData = progressData.all_units.map((unit) => {
        const tests = unitTestsMap.get(unit.unit_no) || [];

        // Test çözülmemişse varsayılan değerler
        if (tests.length === 0) {
          return {
            unitNo: unit.unit_no,
            unitName: unit.unit_name,
            date: '',
            percentage: 0, // null yerine 0 kullanıyoruz çizgi için
            testCount: 0,
            correctAnswers: 0,
            falseAnswers: 0,
            emptyAnswers: 0,
            totalQuestions: 0,
            lastTestName: '',
            hasTest: false // Yeni alan: test var mı?
          };
        }

        // Test çözülmüşse
        const total_questions= tests.reduce((sum, test) => sum + test.total_questions, 0);
        const correct_answers = tests.reduce((sum, test) => sum + test.correct_answers, 0);
        const empty_answers = tests.reduce((sum, test) => sum + test.empty_answers, 0);
        const false_answers = tests.reduce((sum, test) => sum + test.false_answers, 0);
        const lastTest = tests[tests.length - 1]; // En son testi al
        const percentage = Math.round((correct_answers / total_questions) * 100) || 0; // Yüzde hesaplama

        return {
          unitNo: unit.unit_no,
          unitName: unit.unit_name,
          date: new Date(lastTest.submitted_at).toLocaleDateString(),
          percentage: percentage, 
          testCount: tests.length,
          correctAnswers: correct_answers,
          falseAnswers: false_answers,
          emptyAnswers: empty_answers,
          totalQuestions: total_questions,
          lastTestName: lastTest.test_name,
          hasTest: true // Test var
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
            <p>Bu ünitede henüz test çözülmemiş.</p>
          </div>
        );
      }

      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-md">
          <p className="font-bold">{data.lastTestName}</p>
          <p>Tarih: {data.date}</p>
          <p>Ünite: {data.unitName} (Ünite {data.unitNo})</p>
          <p className="text-green-600">Başarı: {data.percentage}%</p>
          <p>Doğru: {data.correctAnswers}</p>
          <p>Yanlış: {data.falseAnswers}</p>
          <p>Boş: {data.emptyAnswers}</p>
          <p>Toplam Soru: {data.totalQuestions}</p>
          <p>Çözülen Test Sayısı: {data.testCount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Test İlerlemesi</h2>

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
                name="Başarı Yüzdesi"
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

export default TestProgressChart;
