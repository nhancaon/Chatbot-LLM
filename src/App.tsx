import React, { useState } from 'react';
import Chatbot from "./component/Chatbot";
import { FaComments } from 'react-icons/fa';
import "./index.css";

const App = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center">
            <h1 className="text-white text-3xl mb-6">Chatbot</h1>
            <div 
                className={`fixed bottom-24 right-5 transition-all duration-300 transform ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
            >
                {isOpen && <Chatbot />}
            </div>
            <button
                aria-label="Open Chatbot"
                className="fixed bottom-5 right-5 bg-[#008d43] text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition-colors"
                onClick={toggleChatbot}
            >
                <FaComments className="text-xl" />
            </button>
        </div>
    );
};

export default App;
