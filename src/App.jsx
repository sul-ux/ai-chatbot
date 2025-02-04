import { useEffect, useState, useRef } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SyncLoader } from "react-spinners";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function App() {
  const apiKey = import.meta.env.VITE_API_GEMINI_KEY;

  
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState([
    { prompt: "Hello, how can I help you today?", response: "I am a chatbot, ask me anything." },
  ]);
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(""); 
  const [typingIndex, setTypingIndex] = useState(0); 
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true); 

 
  const fetchChatResponseFromGemini = async () => {
    setLoading(true);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const newResponse = [...response, { prompt, response: result.response.text() }];
    
    setResponse(newResponse);
    setPrompt("");
    setLoading(false);
    localStorage.setItem("chatbotResponse", JSON.stringify(newResponse));
    
    setCurrentResponse("");
    setTypingIndex(0); 
    setIsTyping(true); 
  };

  useEffect(() => {
    const data = localStorage.getItem("chatbotResponse");
    if (data) {
      setResponse(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (isTyping && response.length > 0 && response[response.length - 1].response) {
      const currentMessage = response[response.length - 1].response;
      
  
      const interval = setInterval(() => {
        setTypingIndex((prevIndex) => {
          if (prevIndex < currentMessage.length) {
            setCurrentResponse((prev) => prev + currentMessage[prevIndex]);
            return prevIndex + 1;
          }
          clearInterval(interval); 
          setIsTyping(false); 
          return prevIndex;
        });
      }, Math.random() * 10 + 5); 
    }
  }, [response, isTyping]);

  useEffect(() => {
   
    if (isAtBottom && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [currentResponse, isAtBottom]); 

  const handleScroll = () => {
    
    if (chatEndRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatEndRef.current;
      setIsAtBottom(scrollTop + clientHeight === scrollHeight);
    }
  };

  return (
    <>
      <h1 className="heading">sulx Chat Bot</h1>
      <div className="chatbot_container" onScroll={handleScroll}>
        <div className="chatbot_response_container">
          {response.map((res, index) => (
            <div key={index} className="response">
              <p className="chatbot_prompt">{res.prompt}</p>
              {index === response.length - 1 ? (
                <p className="chatbot_response">{currentResponse}</p>
              ) : (
                <p className="chatbot_response">{res.response}</p>
              )}
            </div>
          ))}

          {loading && (
            <SyncLoader
              color={"black"}
              loading={loading}
              cssOverride={override}
              size={10}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          )}

          {}
          <div ref={chatEndRef} />
        </div>

        <div className="chatbot_input">
          <input
            type="text"
            name="input"
            placeholder="Enter your question"
            className="input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="button" onClick={fetchChatResponseFromGemini}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
export default App;
