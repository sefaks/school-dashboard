import React from 'react';

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
      <div className="w-full text-left border-2 rounded-md mb-2 text-lg font-semibold">
        <div className="p-4 flex flex-col justify-start gap-3">
          <p>{selectedTest.name}</p>
        
        </div>
  
        {questions.length > 0 && (
          <div className="mt-2 p-4 space-y-4">
            {questions
              .sort((a, b) => a.question_number - b.question_number)
              .map((question, index) => {
                const correctAnswerId = question.correct_answers[0]?.id; // Doğru cevabı al
  
                return (
                  <div key={question.id} className="space-y-2 flex items-center gap-1">
                    <span
                      onClick={() => handleQuestionClick(index)}
                      className="cursor-pointer text-[#702DFF] font-medium hover:text-purple-700"
                    >
                      {question.question_number}
                    </span>
                    <div className="grid flex-grow grid-cols-4 gap-2">
                      {question.options.choices.map((choice) => (
                        <span
                          key={choice.id}
                          className={`p-4 text-center rounded-[10px] border 
                            ${
                              choice.id === correctAnswerId
                                ? "bg-green-500 text-white border-green-500" // Doğru cevabı yeşil yap
                                : "hover:bg-[#702DFF40] border-[#702DFF40]"
                            }`}
                        >
                          {choice.id}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  };
  
  export default TestOptions;