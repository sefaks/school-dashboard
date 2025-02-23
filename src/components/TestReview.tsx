import React, { useState } from 'react';

const TestReview = ({
  questions,
 currentLanguageContent,
  activeQuestionIndex, // New prop
  setActiveQuestionIndex // New prop
}) => {

  const [showAnswers, setShowAnswers] = useState(false);

  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev: number) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev: number) => prev - 1);
    }
  };

  // Results summary component
  

  // Show answers prompt component
  const ShowAnswersPrompt = () => (
    <div className="mt-4">
      <p className="text-md mb-4">
        {currentLanguageContent.do_you_want_to_see_answers}
      </p>
      <div className="flex justify-between">
        <button
          onClick={() => setShowAnswers(true)}
          className="px-4 py-2 bg-[#702DFF] text-white rounded-md hover:bg-purple-700"
        >
          {currentLanguageContent.show_answers}
        </button>
        <button
          onClick={() => setShowAnswers(false)}
          className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400"
        >
          {currentLanguageContent.hide_answers}
        </button>
      </div>
    </div>
  );

  // Question review component
  const QuestionReview = () => {
    const currentQuestion = questions[activeQuestionIndex];
    const userAnswer = answers[currentQuestion.id];
    const correctAnswerId = currentQuestion.correct_answers[0].id;

    return (
      <div className="mt-6">
        {/* Question Image */}
        <div className="w-full mb-6">
          <img
            src={currentQuestion?.question_url || '/default-image.png'}
            alt={`Question ${currentQuestion?.id}`}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Answer Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {currentQuestion.options.choices.map((choice:any) => (
            <span
              key={choice.id}
              className={`p-4 text-center rounded-[10px] border
                ${choice.id === correctAnswerId 
                  ? "bg-green-500 text-white border-green-500"
                  : choice.id === userAnswer
                    ? "bg-red-500 text-white border-red-500"
                    : "border-[#702DFF40]"
                }`}
            >
              {choice.id}
            </span>
          ))}
        </div>

        {/* Explanation if answer was wrong */}
       
        <div className="mb-6">
            <p className="font-semibold text-lg">
              {currentQuestion.question_number}. {currentLanguageContent.explanation_for_question}
            </p>
                {/* Explanation if exist or not empty */}
                {currentQuestion.explanation && currentQuestion.explanation != '' && (
                  <p className="text-md mt-2">{currentQuestion.explanation}</p>
                )}


           
          </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          <button
            disabled={activeQuestionIndex === 0}
            onClick={handlePreviousQuestion}
            className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400 disabled:opacity-50"
          >
            {currentLanguageContent.previous}
          </button>
          <button
            disabled={activeQuestionIndex === questions.length - 1}
            onClick={handleNextQuestion}
            className="px-4 py-2 bg-[#702DFF] text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {currentLanguageContent.next}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="lg:w-3/3 bg-[#FFFFFF] p-4 shadow-custom-black rounded-[12px]">
      {!showAnswers ? (
        <ShowAnswersPrompt />
      ) : (
        <QuestionReview />
      )}
    </div>
  );
};

export default TestReview;