import React, { useState, useEffect } from 'react';
import { Modal, CircularProgress, Tooltip } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReactMarkdown from 'react-markdown'; // Markdown için
import { getHomeworkIdeaWithAI } from '@/lib/actions';
import { toast } from 'react-toastify';
import MarkdownRenderer from '../MarkdownRenderer';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 

const AIHomeworkIdeaModal = ({ 
  isOpen, 
  onClose, 
  unitId,
  additionalRequirements,
  token, 
  onApplyIdea
}) => {
  const [loading, setLoading] = useState(false);
  const [homeworkIdea, setHomeworkIdea] = useState(null);
  const [error, setError] = useState(null);
  
  const [language, setLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);
  const currentLanguageContent = language === "en" ? en : tr;

  const fetchHomeworkIdea = async () => {
    if (!unitId) {
      toast.error("Lütfen önce bir ünite seçin");
      onClose();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getHomeworkIdeaWithAI(unitId, additionalRequirements, token);
      setHomeworkIdea(response);
    } catch (err) {
      console.error("Error fetching homework idea:", err);
      setError(err.message || "Bir hata oluştu");
      toast.error(currentLanguageContent.error_generating);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && unitId) {
      fetchHomeworkIdea();
    }
  }, [isOpen, unitId]);
  
  // Verileri işleyip güvenli bir şekilde kullanılacak formata dönüştür
  const processHomeworkIdea = (data) => {
    // Steps ve evaluation_criteria string olarak geldiyse parse et
    let processedSteps = data.steps;
    let processedCriteria = data.evaluation_criteria;
    
    // Eğer string olarak geldiyse (JSON string) parse et
    if (typeof data.steps === 'string') {
      try {
        processedSteps = JSON.parse(data.steps);
      } catch (e) {
        console.error('Steps parsing error:', e);
        processedSteps = [];
      }
    }
    
    if (typeof data.evaluation_criteria === 'string') {
      try {
        processedCriteria = JSON.parse(data.evaluation_criteria);
      } catch (e) {
        console.error('Evaluation criteria parsing error:', e);
        processedCriteria = [];
      }
    }
    
    return {
      ...data,
      steps: Array.isArray(processedSteps) ? processedSteps : [],
      evaluation_criteria: Array.isArray(processedCriteria) ? processedCriteria : []
    };
  };
  
  const handleApplyIdea = () => {
    if (homeworkIdea) {
      // Verileri temizleyip sonra uygula
      onApplyIdea(processHomeworkIdea(homeworkIdea));
      onClose();
    }
  };
  
  const handleRegenerateIdea = () => {
    fetchHomeworkIdea();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="ai-homework-idea-modal"
      aria-describedby="modal-to-display-ai-generated-homework-idea"
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 sm:p-6 rounded-lg shadow-lg w-[95%] max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <img src="/logo9.png" alt="" width={50} height={50} />
            {currentLanguageContent.ai_homework_idea}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-4 sm:p-8">
              <CircularProgress size={40} />
              <p className="mt-4 text-center text-gray-600">
                {currentLanguageContent.loading_message}
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchHomeworkIdea}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {currentLanguageContent.try_again}
              </button>
            </div>
          ) : homeworkIdea ? (
            <div>
              <div className="bg-blue-50 p-4 rounded-md mb-4 overflow-x-hidden">
                <h3 className="font-semibold text-lg mb-2 break-words">{homeworkIdea.title}</h3>
                
                {/* Yapılandırılmış veri kullanarak içeriği göster */}
                <div className="prose max-w-none overflow-x-hidden">
                  {homeworkIdea.summary && (
                    <div className="mb-4">
                      <h4 className="font-bold text-md">Özet:</h4>
                      <p>{homeworkIdea.summary}</p>
                    </div>
                  )}
                  
                  {homeworkIdea.purpose && (
                    <div className="mb-4">
                      <h4 className="font-bold text-md">Amaç:</h4>
                      <p>{homeworkIdea.purpose}</p>
                    </div>
                  )}
                  
                  {homeworkIdea.steps && homeworkIdea.steps.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-bold text-md">Uygulama Adımları:</h4>
                      <ol className="list-decimal pl-5 mt-1">
                        {homeworkIdea.steps.map((step, idx) => (
                          <li key={idx} className="my-1">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {homeworkIdea.evaluation_criteria && homeworkIdea.evaluation_criteria.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-bold text-md">Değerlendirme Kriterleri:</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {homeworkIdea.evaluation_criteria.map((criterion, idx) => (
                          <li key={idx} className="my-1">{criterion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Yapılandırılmış veri yoksa veya eksikse markdown içeriğini göster */}
                  {(!homeworkIdea.summary || !homeworkIdea.steps) && homeworkIdea.content && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <MarkdownRenderer content={homeworkIdea.content} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                <button
                  onClick={handleRegenerateIdea}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  {currentLanguageContent.regenerate_idea}
                </button>
                <button
                  onClick={handleApplyIdea}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {currentLanguageContent.apply_idea}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  {currentLanguageContent.close}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default AIHomeworkIdeaModal;