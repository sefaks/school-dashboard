"use client";

// Optimize message rendering with React.memo
const MessageBubble = React.memo(({ message }: { message: ChatMessage }) => {
  const isAssistant = message.type === "assistant";
  const isLoadingMessage = isAssistant && message.text === "...";
  const bubbleClass = isAssistant
    ? "bg-[#F2F2F2] text-[#000000] self-start"
    : "bg-[#702DFF] text-[#FFFFFF] self-end";
  const maxWidthClass = isAssistant
    ? "max-w-sm mr-[30px]"
    : "max-w-xs ml-[30px]";

  // displayName for better debugging
  MessageBubble.displayName = "MessageBubble";

  return (
    <div className={`${maxWidthClass}`}>
      <div
        className={`${bubbleClass} font-normal text-[14px] leading-[20px] px-[20px] py-[18px] rounded-[18px] break-words`}
      >
        {isLoadingMessage ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>
        ) : isAssistant ? (
          <MarkdownRenderer content={message.text} />
        ) : (
          message.text
        )}
      </div>
    </div>
  );
});

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import apiClient from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { Chat } from "@mui/icons-material";

type MessageType = "user" | "assistant";

interface ChatMessage {
id: number;
type: MessageType;
text: string;
}

type ChatBoxProps = {
content_id: string;
}

export default function ChatBox({ content_id }: ChatBoxProps) {
const [messages, setMessages] = useState<ChatMessage[]>([
  {
    id: 1,
    type: "assistant",
    text: "👋 Selam, sana nasıl yardımcı olabilirim?",
  },
]);
const [inputValue, setInputValue] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [isInitialLoading, setIsInitialLoading] = useState(true);
const session = useSession();

// Debounce input to prevent lag during typing
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setInputValue(value);
};

// Reference to the chat container for scrolling
const chatContainerRef = useRef<HTMLDivElement>(null);

// Optimize scrolling by using a callback ref
const scrollToBottom = () => {
  if (chatContainerRef.current) {
    const { scrollHeight, clientHeight } = chatContainerRef.current;
    chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
  }
};

// Use a more efficient way to handle scrolling
useEffect(() => {
  // Only scroll if we have messages
  if (messages.length > 0) {
    scrollToBottom();
  }
}, [messages.length]);

// Fetch previous messages on component mount
useEffect(() => {
  const fetchPreviousMessages = async () => {
    try {
      const response = await apiClient.get(`/teachers/lessons/chat-history/${content_id}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });

      const previousMessages: ChatMessage[] = response.data.chat_history.map((msg: any) => ({
        id: msg.id,
        type: msg.role,
        text: msg.content,
      }));

      setMessages((prev) => {
        // Skip duplicating the initial welcome message if it's already in the history
        if (previousMessages.length > 0) {
          return previousMessages;
        }
        return prev;
      });
    } catch (error) {
      console.error("Error fetching previous messages:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  if (session.data?.user.accessToken) {
    fetchPreviousMessages();
  } else {
    setIsInitialLoading(false);
  }
}, [content_id, session.data?.user.accessToken]);

// Add a user message and make API call
const handleAddMessage = async () => {
  if (!inputValue.trim() || isLoading) return;

  const newUserMessage: ChatMessage = {
    id: Date.now(),
    type: "user",
    text: inputValue.trim(),
  };

  setMessages((prev) => [...prev, newUserMessage]);
  setInputValue("");
  
  // Add a small delay before focusing on the API call
  // This helps UI remain responsive during message transition
  setTimeout(() => {
    // Create a temporary loading message
    const tempId = Date.now() + 1;
    setMessages((prev) => [
      ...prev, 
      {
        id: tempId,
        type: "assistant",
        text: "..."
      }
    ]);
    
    setIsLoading(true);
    apiClient.post(
      "/teachers/lessons/ask-question", 
      {
        prompt: newUserMessage.text,
        content_id: content_id,
      },
      {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        }
      }
    )
    .then(response => {
      // Replace the temporary message with the actual response
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === tempId 
            ? {
                id: tempId,
                type: "assistant",
                text: response.data.content || "I couldn't get a response. Please try again."
              } 
            : msg
        )
      );
    })
    .catch(error => {
      // Replace the temporary message with an error message
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === tempId 
            ? {
                id: tempId,
                type: "assistant",
                text: "There was an error processing your request. Please try again later."
              } 
            : msg
        )
      );
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, 10);
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
      {isInitialLoading ? (
        <div className="self-start max-w-sm mr-[30px]">
          <div className="bg-[#F2F2F2] text-[#000000] font-normal text-[14px] leading-[20px] px-[20px] py-[18px] rounded-[18px] break-words">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))
      )}
    </div>

    {/* Bottom Input Bar */}
    <div>
      <div className="shadow-custom-black pl-[22px] py-[12px] justify-between rounded-[12010px] flex items-center">
        <div className="flex gap-1 items-center">
          <Image src="/icons/a.svg" width={20.4} height={20.4} alt="@" />
          <input
            type="text"
            placeholder="Sohbete başla..."
            className="bg-transparent outline-none ml-2 mr-2 w-full"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) handleAddMessage();
            }}
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2 justify-center items-center">
          <button
            className={`${isLoading ? 'bg-gray-400' : 'bg-[#702DFF] hover:bg-purple-700'} flex items-center justify-center flex-shrink-0 rounded-[104px] text-white w-[34px] h-[34px] mr-[22px]`}
            onClick={handleAddMessage}
            disabled={isLoading}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  </div>
);
}


ChatBox.displayName = "ChatBox"; 