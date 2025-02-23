"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, ReactNode } from "react";
import {toast} from 'react-toastify'
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 
import { ArrowBackIos, ArrowRight } from "@mui/icons-material";
import { set } from "date-fns";

import apiClient from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import QuestionNumbersNav from "./QuestionNumbersNav";
import TestListItem from "./TestListItem";
import TestOptions from "./TestOption";
import TestReview from "./TestReview";
import MarkdownRenderer from "./MarkdownRenderer";
import Loading from "@/app/(dashboard)/list/loading";

type answer=
{
  id:string
}
type Question = {
  explanation: ReactNode;
  id: number;
  question_text: string | null;
  question_url: string | null; // Store the URL of the image for the question
  correct_answers:Array<answer>
  question_number: number;
  is_correct: boolean;
  options: {
    choices: Array<{
      id: string;
      text: string;
    }>;
  };
};

type Test = {
  id: number;
  test_name: string;
  test_no: number;
  test_id: number;
  
};

const Tests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]); // Store questions for the selected test
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null); // Track the selected test
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0); // Track active question index
  const [isTestFinish, setIsTestFinish] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false); // Cevap açıklamalarını göstermek için state
  const [initialLoading, setInitialLoading] = useState(true);
  const [reviewActiveQuestionIndex, setReviewActiveQuestionIndex] = useState(0);

  const router = useRouter();

  const searchParams = useSearchParams();
  const publish_id =   searchParams.get('publisher_id') || 1;
  const test_type  = searchParams.get('test_type') || "";
  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr;

  const { data: session } = useSession();

  // Fetch the tests when the component mounts
  useEffect(() => {
    const fetchTests = async () => {
      if (publish_id) {
        try {
          setIsLoading(true);
          const response = await apiClient.get(
            `/teachers/me/publishes/${publish_id}/tests?test_type=${test_type}`,
            {
              headers: { Authorization: `Bearer ${session?.user.accessToken}` },
            }
          );   

        setTests(response.data); // Store the test list
        } catch (error: any) { // Explicitly type the error parameter
          toast.error("Testleri ulaşırken bir hata meydana geldi ", error);
          console.error("Error fetching tests:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTests();
  }, [publish_id]);


  // if testId is in the URL, set the selectedTestId and wait for the test to load
  useEffect(() => {
    const loadInitialTest = async () => {
      const testId = searchParams.get('testId');
      if (testId) {
        // URL'den test durumunu da alabiliriz
       
        await handleTestClick(parseInt(testId));
      }
      setInitialLoading(false);
    };
    loadInitialTest();
  }, []);


  // Fetch questions when a test is selected
  const handleTestClick = async (testId: number) => {
    setIsLoading(true);
    setSelectedTestId(testId);
    
    try {
      const selectedTest = tests.find(test => test.id === testId);
      
      // URL'yi güncelle
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('testId', testId.toString());

      window.history.replaceState(null, '', `?${newParams.toString()}`);
      // Soruları yükle
      const response = await apiClient.get(`/questions/test-questions/${testId}`);
      console.log("response is ", response)

      const fetchedQuestions = response.data;
  
      if (response.status === 400) {
        toast.error("Test is already completed");
        return;
      }
      console.log("fetched questions are ", fetchedQuestions)
  
      // Testin soruları ile birlikte resimleri al
      const questionsWithImages = await Promise.all(
        fetchedQuestions.map(async (question: any) => {
          const questionResponse = await apiClient.get(
            `/questions/get-question/${question.id}`,
            { responseType: 'blob' }
          );
          const imageUrl = URL.createObjectURL(questionResponse.data);
          return { ...question, question_url: imageUrl };
        })
      );
      
      setQuestions(questionsWithImages);

      // Action'a göre işlem yap      
    } catch (error: any) {
      toast.error("Soruları alırken bir hata oluştu", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (index: React.SetStateAction<number>) => {
    setActiveQuestionIndex(index);
  };



  const renderTests = () => {
    if (!selectedTestId) {

      const sortedTests = [...tests].sort((a, b) => a.test_no - b.test_no);

      console.log("sorted tests are ", sortedTests)

      return (
        <>
       
          <h2 className="text-xl font-semibold mb-4 underline">Testler</h2>
          {sortedTests.map((test) => (
          <TestListItem
            key={test.id}
            test={test}
            onTestClick={handleTestClick}
            currentLanguageContent={currentLanguageContent}
          />
        ))}
        </>
      );
    }
    
    const selectedTest = tests.find((test) => test.id === selectedTestId);
    if (!selectedTest) return <p className="text-gray-600">Test bulunamadı.</p>;
  
    return (
      <TestOptions
        selectedTest={selectedTest}
        selectedTestId={selectedTestId}
        questions={questions}
        handleQuestionClick={handleQuestionClick}
        currentLanguageContent={currentLanguageContent}
      />
    );
  };


  const renderActiveQuestion = () => {
    const currentQuestion = questions[activeQuestionIndex];

    return (
      <div className="flex flex-col lg:flex-col items-center mt-4 gap-8">
        {/* Left Side: Question Image */}
        <div className="w-full mb-4 lg:mb-0">
          <img
            src={currentQuestion?.question_url || '/default-image.png'} // Display the image or a default placeholder
            alt={`Question ${currentQuestion?.id}`}
            className="w-full  h-full object-cover rounded-lg"
          />
        </div>

        <div className="mb-6">
           
            {currentQuestion.explanation && currentQuestion.explanation != '' && (
              <div>
              <p className="font-semibold text-lg">
               {currentQuestion.question_number}. {currentLanguageContent.explanation_for_question}
             </p>
                <div className="mt-2 p-4 bg-gray-100 border-l-4 border-blue-500 rounded-lg shadow-md"> 

            <MarkdownRenderer content={currentQuestion.explanation} />
            </div>
              </div>
              

            )}
            
          </div>
        

        {/* Right Side: Question Text */}
        {/* <div className="lg:w-1/2 w-full">
          <h1 className="text-xl font-semibold mb-4">{currentQuestion.question_text}</h1>
        </div> */}
      </div>

      
    );
  };

  // Handle user's answer selection
  
  // Handle Previous/Next question navigation
  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    }
    else {
      let count = 0
      // alert("You have reached the end of the quiz!");
      setIsTestFinish(true)
     
      console.log("count is ", count)
    }
  };

  const handlePreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    }
  };

  return (
  <div className="flex flex-col gap-8 lg:flex-row">
    {/* Sol: Test Detayları - Sadece bir test seçildiğinde görünür */}
    {selectedTestId && (
      <div className="lg:w-2/3 bg-[#FFFFFF] p-4 shadow-custom-black rounded-[12px]">
        <div>
          <h2 className="font-semibold text-[16px] leading-[20px] mb-4">
            {currentLanguageContent.test_questions}
          </h2>
          {(isLoading || initialLoading) ? (
            <Loading/>
          ) : (
            questions.length > 0 ? renderActiveQuestion() : 
            <p className="text-md italic">{currentLanguageContent.no_questions_available}</p>
          )}
          {/* Navigation Buttons */}
          {questions.length > 0 && (
            <div className="flex justify-between mt-4">
              <button
                disabled={activeQuestionIndex === 0}
                onClick={handlePreviousQuestion}
                className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400 disabled:opacity-50"
              >
                {currentLanguageContent.previous}
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-[#702DFF] text-white rounded-md hover:bg-purple-700"
              >
                {activeQuestionIndex === questions.length - 1 ? 'Finish' : currentLanguageContent.next}
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Sağ: Test Listesi - Test seçili değilken tam genişlik */}
    <div className={`${selectedTestId ? 'lg:w-1/3' : 'lg:w-full'} bg-[#FFFFFF] max-h-[calc(100vh-200px)] overflow-y-auto p-6 shadow-custom-black rounded-[12px]`}>
      {isLoading ? (
        <Loading/>
      ) : (
        questions ? (
          <>
            {/* Geri butonu ve başlık row */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowBackIos className="text-gray-600" fontSize="small" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {currentLanguageContent.lessons}
              </h1>
            </div>

            {/* Testler */}
            {renderTests()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-gray-500 text-lg">
              {currentLanguageContent.no_test_available}
            </p>
          </div>
        )
      )}
    </div>
  </div>
);
}

export default Tests;