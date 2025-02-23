

import React from 'react';
import { BookOpen } from 'lucide-react';

const TestOptions = ({
    selectedTest,
    selectedTestId,
    questions,
    handleQuestionClick,
    currentLanguageContent,
  }) => {
    if (!selectedTestId) {
      return null;
    }
  
    return (
      <div className="w-full text-left border-2 rounded-lg mb-2 bg-white">
        {/* Test Başlığı Bölümü */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 rounded-lg shrink-0">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 break-words max-w-[calc(100%-3rem)]">
              {selectedTest.name}
            </h2>
          </div>
        </div>
  
        {/* Cevaplar Grid Bölümü */}
        {questions.length > 0 && (
          <div className="p-6">
            <div className="grid gap-6">
              {questions
                .sort((a, b) => a.question_number - b.question_number)
                .map((question, index) => {
                  const correctAnswerId = question.correct_answers[0]?.id;
                  const choiceCount = question.options.choices.length;
  
                  return (
                    <div key={question.id} className="flex items-start gap-4">
                      {/* Soru Numarası */}
                      <div
                        onClick={() => handleQuestionClick(index)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
                      >
                        <span className="text-purple-700 font-medium">
                          {question.question_number}
                        </span>
                      </div>
  
                      {/* Şıklar Grid */}
                      <div 
                        className={`grid ${
                          choiceCount <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-5'
                        } gap-2 flex-1`}
                      >
                        {question.options.choices.map((choice) => (
                          <div
                            key={choice.id}
                            className={`
                              flex items-center justify-center p-3 rounded-lg font-medium transition-all
                              ${
                                choice.id === correctAnswerId
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-100"
                              }
                            `}
                          >
                            {choice.id}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default TestOptions;