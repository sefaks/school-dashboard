"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import apiClient from "@/lib/apiClient";
import { useSession } from "next-auth/react";

type MessageType = "user" | "assistant";

interface ChatMessage {
  id: number;
  type: MessageType;
  text: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "assistant",
      text: "👋 Selam, sana nasıl yardımcı olabilirim?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const session = useSession();

  // Reference to the chat container for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages are updated
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add a user message and make API call
  const handleAddMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      type: "user",
      text: inputValue.trim(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    await fetchAssistantResponse(inputValue.trim());
  };

  // Fetch assistant response from the API
  const fetchAssistantResponse = async (userInput: string) => {
    try {
      const response = await apiClient.post("/teachers/ask-question-for-content", {
        prompt: userInput,
      },
      {headers: {
        Authorization: `Bearer ${session.data?.user.accessToken}`,
      }});

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "assistant",
        text: response.data || "I couldn't get a response. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "assistant",
        text: "There was an error processing your request. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex justify-between flex-grow flex-col">
      {/* Conversation Container */}
      <div
        className="p-4 flex max-h-[50vh] overflow-y-auto flex-col gap-3"
        ref={chatContainerRef}
        style={{
          overflowX: "hidden", // Prevent horizontal overflow
        }}
      >
        {messages.map((msg) => {
          const isAssistant = msg.type === "assistant";
          const bubbleClass = isAssistant
            ? "bg-[#F2F2F2] text-[#000000] self-start"
            : "bg-[#702DFF] text-[#FFFFFF] self-end";
          const maxWidthClass = isAssistant
            ? "max-w-sm mr-[30px]"
            : "max-w-xs ml-[30px]";

          return (
            <div key={msg.id} className={`${maxWidthClass}`}>
              {isAssistant ? (
                <div
                  className={`${bubbleClass} font-normal text-[14px] leading-[20px] px-[20px] py-[18px] rounded-[18px] break-words`}
                 
                >
                    <MarkdownRenderer content={msg.text} />
                                    </div>
              ) : (
                <div
                  className={`${bubbleClass} font-normal text-[14px] leading-[20px] px-[20px] py-[18px] rounded-[18px] break-words`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Input Bar */}
      <div>
        <div className="shadow-custom-black pl-[22px] py-[12px] justify-between rounded-[12010px] flex items-center">
          <div className="flex gap-1 items-center">
            <Image src="/icons/a.svg" width={20.4} height={20.4} alt="@" />
            <input
              type="text"
              placeholder="Sohbete başla..."
              className="bg-transparent outline-none ml-2 mr-2"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddMessage();
              }}
            />
          </div>
          <div className="flex gap-2 justify-center items-center">
            <button
              className=" bg-[#702DFF] flex items-center justify-center flex-shrink-0 rounded-[104px] text-white w-[34px] h-[34px] mr-[22px] hover:bg-purple-700"
              onClick={handleAddMessage}
            >
              ↑
            </button>
          </div>
        </div>

        {/* Footer / Terms */}
      
      </div>
    </div>
  );
}
