import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CombinedPerformanceChart = ({ analysisData ,currentLanguageContent}) => {
  // Combine assignments and tests data
const combinedData = [
    ...analysisData.report.report_details.assignments.map(assignment => ({
        name: assignment.assignment_header,
        score: assignment.score || 0,
        type: currentLanguageContent.assignment
    })),
    ...analysisData.report.report_details.tests.map(test => ({
        name: test.test_name,
        score: test.correct_count / test.questions_count * 100, // Convert to percentage
        type: currentLanguageContent.test
    }))
];

  return (
    <div className="h-[300px] mt-6">
      {combinedData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ value: currentLanguageContent.score, angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip 
                formatter={(value, name, props) => [
                    `${Number(value).toFixed(2)}`, 
                    `${props.payload.type} ${currentLanguageContent.score}`
                ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }}
              name= {currentLanguageContent.performance}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No performance data available</p>
        </div>
      )}
    </div>
  );
};

export default CombinedPerformanceChart;