"use client"
import React from 'react';

const QuestionsDetailsView = ({
  currentQuestion,
  correctAnswerId,
  userAnswer,
  activeQuestionIndex,
  questions,
  handlePreviousQuestion,
  handleNextQuestion,
  currentLanguageContent,
  MarkdownRenderer
}) => {
  const choiceCount = currentQuestion.options?.choices?.length  ?? 0;

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
      <div className={`grid ${choiceCount <= 4 ? 'grid-cols-4' : 'grid-cols-5'} gap-2 mb-6`}>
        {currentQuestion.options?.choices?.map((choice:any) => (
          <span
            key={choice.id}
            className={`p-3 text-sm text-center rounded-[10px] border
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
        <div className="mt-2 p-4 bg-gray-100 border-l-4 border-blue-500 rounded-lg shadow-md">
          {(currentQuestion.explanation && currentQuestion.explanation !== "") &&
          <MarkdownRenderer content={currentQuestion.explanation} />
          }
          
        </div>
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

export default QuestionsDetailsView;