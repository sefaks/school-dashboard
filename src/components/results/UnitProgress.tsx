

const UnitProgress = ({ progressData }: { progressData: any }) => {

    return(
    <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">Ünite Bazlı İlerleme</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...progressData.all_units]
        .sort((a, b) => a.unit_no - b.unit_no) // unit_no'ya göre sıralama
        .map((unit) => {
          // unit_no'ya göre testleri filtrele
          const unitTests = progressData.progress_data.filter(
            (test) => test.unit_no === unit.unit_no
          );

          // Ortalama başarı oranı hesapla (progress_data'da success yüzdesi yoksa kendin hesapla)
          const avgSuccess = unitTests.length
            ? unitTests.reduce((sum, test) => {
                // Eğer test objesinde 'percentage' yoksa hesapla
                const percentage = test.percentage !== undefined
                  ? test.percentage
                  : Math.round((test.correct_answers / test.total_questions) * 100);
                return sum + percentage;
              }, 0) / unitTests.length
            : 0;

          // Son test tarihi (varsa)
          const latestTest = unitTests.length
            ? unitTests.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]
            : null;

          return (
            <div key={unit.unit_no} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-lg">
                {unit.unit_no} - {unit.unit_name}
              </h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Ortalama Başarı:</span>
                  <span
                    className={`font-medium ${
                      avgSuccess >= 70
                        ? 'text-green-600'
                        : avgSuccess >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {avgSuccess.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      avgSuccess >= 70
                        ? 'bg-green-600'
                        : avgSuccess >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${avgSuccess}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p>Test Sayısı: {unitTests.length}</p>
                {latestTest && (
                  <p>Son Test: {new Date(latestTest.submitted_at).toLocaleDateString()}</p>
                )}
              </div>
                </div>
              );
            })}
          </div>
        </div>
    );
};
export default UnitProgress;
