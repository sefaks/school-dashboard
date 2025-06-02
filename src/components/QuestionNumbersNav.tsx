import React from 'react';

const QuestionNumbersNav = ({ 
  questions,
  answers,
  answersMap,
  activeQuestionIndex,
  setActiveQuestionIndex,
  currentLanguageContent 
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="p-4">
      <h3 className="font-semibold text-[16px] mb-4">
        {currentLanguageContent.questions || 'Sorular'}
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id];
          
          // Direkt olarak userAnswer ile correct_answer'ı karşılaştırıyoruz
          const isCorrect = question?.correct_answers?.length > 0 
          ? userAnswer === question.correct_answers[0].id 
          : false;
                
          return (
            <button
              key={question.id}
              onClick={() => setActiveQuestionIndex(index)}
              className={`
                p-2 rounded-lg flex items-center justify-center font-medium text-sm
                transition-all duration-200
                ${index === activeQuestionIndex ? 'ring-2 ring-[#702DFF]' : ''}
                ${userAnswer
                  ? isCorrect
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                  : 'bg-gray-100 hover:bg-[#702DFF20]'
                }
              `}
            >
              {question.question_number || index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

}

export default QuestionNumbersNav;