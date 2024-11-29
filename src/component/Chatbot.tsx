import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaRobot, FaTimes } from "react-icons/fa";
import predefinedResponses from "./../assets/predefinedResponses.json";
import options from "./../assets/options.json";

interface Message {
  text: string;
  sender: "user" | "bot";
  options?: string[];
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [optionsStack, setOptionsStack] = useState<string[][]>([]);

  useEffect(() => {
    const initialMessage = options.initialGreeting;
    if (initialMessage) {
      setMessages([{ text: initialMessage.text, sender: "bot", options: initialMessage.options }]);
    }
  }, []);

  const handleSendOptionMessage = (text: string) => {
    // Gửi tin nhắn option của người dùng
    const userMessage: Message = { text, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    let message: Message;
    if (text === "Chọn lại") {
      const previousOptions = optionsStack.pop();
      console.log(previousOptions)
      if (previousOptions) {
        message = {
          text: "Chọn lại các tùy chọn",
          sender: "bot",
          options: previousOptions // Trả về các tùy chọn trước đó
        };
      } else {
        message = { text: "Không có tùy chọn trước đó", sender: "bot" };
      }
    } else {
      // Lấy phản hồi của bot cho option đã chọn
      const botResponse = getPredefinedResponse(text);

      if (botResponse) {

        // Kiểm tra xem botResponse có phải là một chuỗi không
        if (typeof botResponse === "string") {
          message = { text: botResponse, sender: "bot" };
        } else {
          // Nếu botResponse là một đối tượng, chắc chắn nó có "text" và "options"
          message = {
            text: botResponse.text,
            sender: "bot",
            options: botResponse.options || [] // Đảm bảo có options
          };

          // Nếu có tùy chọn và flag back_flag là true, lưu vào optionsStack
          if (botResponse.options && botResponse.back_flag) {
            setOptionsStack((prevStack) => [...prevStack, botResponse.options]);
          }
        }
      }

    }
    setMessages((prevMessages) => [
      ...prevMessages,
      message as Message, // Đảm bảo message có kiểu Message
    ]);
  };


  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage: Message = { text: inputValue, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputValue("");

      const botResponse = await getBotResponse(inputValue);
      if (botResponse) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botResponse, sender: "bot" },
        ]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getBotResponse = async (text: string): Promise<string | null> => {
    try {
      const response = await fetch("http://192.168.1.4:8000/ask", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          "question": text
        })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data.answer)
      return data.answer;
    } catch (error) {
      console.error("Error fetching bot response:", error);
      return null;
    }
  };

  const getPredefinedResponse = (text: string) => {
    return predefinedResponses[text as keyof typeof predefinedResponses] || "";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isVisible) return null;

  return (
    <div className="chatbox rounded-lg min-w-[50px] max-w-[450px] min-h-[500px] max-h-[600px] flex flex-col bg-white">
      <div
        className="flex items-center p-4 text-lg font-semibold text-white"
        style={{
          background: "linear-gradient(135deg, #8ebe3f 0%, #008d43 100%)",
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
        }}
      >
        <FaRobot className="mr-2" />
        Chat with AI Assistant
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto p-1 text-white transition-transform transform hover:scale-110"
          aria-label="Close Chatbot"
        >
          <FaTimes />
        </button>
      </div>

      <div className="messages flex-1 overflow-y-auto overflow-x-hidden p-4">
        {messages.map((msg, index) => (
          <div key={index}>
            <div
              className={`my-2 p-2 rounded-lg max-w-[80%] break-words ${msg.sender === "user"
                ? "bg-gradient-to-r from-green-600 to-green-400 text-white font-bold text-right ml-auto"
                : "bg-gradient-to-r from-gray-200 to-gray-300 text-black text-left mr-auto"
                }`}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {msg.sender === "bot" ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: msg.text.replace(
                      /(https?:\/\/[^\s]+)/g,
                      `<a href="$1" target="_blank" class="text-blue-500 hover:underline">Truy cập tại đây</a>`
                    ),
                  }}
                />
              ) : (
                msg.text
              )}
            </div>
            {msg.options && (
              <div className="flex flex-wrap gap-2 mt-2">
                {msg.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendOptionMessage(option)}
                    className="text-green-600 font-bold p-2 rounded-md border border-2 border-green-600 hover:bg-green-600 hover:text-white"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area flex bg-white">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-md text-black max-h-20 resize-none overflow-y-auto"
          style={{ maxWidth: "calc(90% - 50px)" }}
          aria-label="Type your message"
        />
        <button
          onClick={handleSendMessage}
          className="p-4 m-2 rounded-full shadow-lg text-white transition-transform transform hover:scale-110"
          aria-label="Send message"
          style={{
            background: "linear-gradient(135deg, #008d43 0%, #8ebe3f 100%)",
          }}
        >
          <FaPaperPlane className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
