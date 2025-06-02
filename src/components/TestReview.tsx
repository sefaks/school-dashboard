import React, { useState } from 'react';
import QuestionsDetailsView from './tests/QuestionsDetailsView';
import MarkdownRenderer from './MarkdownRenderer';

const TestReview = ({
  questions,
  answers,
  answersMap,
  currentLanguageContent,
  activeQuestionIndex, // New prop
  setActiveQuestionIndex // New prop
}) => {

  const [showAnswers, setShowAnswers] = useState(true);

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

  


  // Question review component
  const QuestionReview = () => {
    const currentQuestion = questions[activeQuestionIndex];
    const userAnswer = answers[currentQuestion.id];
    const correctAnswerId = currentQuestion?.correct_answers?.[0]?.id ?? null;

    return (
      <QuestionsDetailsView
      currentQuestion={currentQuestion}
      correctAnswerId={correctAnswerId}
      userAnswer={userAnswer}
      activeQuestionIndex={activeQuestionIndex}
      questions={questions}
      handlePreviousQuestion={handlePreviousQuestion}
      handleNextQuestion={handleNextQuestion}
      currentLanguageContent={currentLanguageContent}
      MarkdownRenderer={MarkdownRenderer}
    />
    );
  };

  return (
    <div className="lg:w-3/3 bg-[#FFFFFF] p-4 shadow-custom-black rounded-[12px]">
    
        <QuestionReview />
    </div>
  );
};

export default TestReview;