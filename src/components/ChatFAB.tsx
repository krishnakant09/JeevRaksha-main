"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Volume2, Image as ImageIcon, X, Bot } from "lucide-react";

export default function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string; image?: string }[]>([
    { role: "assistant", content: "नमस्ते! मैं जीव-रक्षा का AI सहायक हूँ। आपके पशु को क्या परेशानी है? आप फोटो भी भेज सकते हैं। (Hello! I am JeevRaksha's AI assistant. What is wrong with your animal? You can also upload a photo.)" }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("jeevraksha_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !document.querySelector('script[src="https://js.puter.com/v2/"]')) {
      const script = document.createElement("script");
      script.src = "https://js.puter.com/v2/";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };
    recognition.onerror = (e: any) => { console.error(e); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const playTTS = async (text: string) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language_code: "hi-IN" }),
      });
      const data = await res.json();
      if (data.audios && data.audios[0]) {
        const audioSrc = `data:audio/wav;base64,${data.audios[0]}`;
        const audio = new Audio(audioSrc);
        audio.play();
      }
    } catch (e) {
      console.error("TTS Error:", e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMsg = input.trim();
    const currentImgUrl = previewUrl;
    
    const newMessages = [...messages, { role: "user", content: userMsg, image: currentImgUrl || undefined }];
    setMessages(newMessages);
    setInput("");
    
    const fileToUpload = selectedImage;
    clearImage();
    setLoading(true);

    try {
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("file", fileToUpload);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        
        if (!uploadData.url) throw new Error("Upload failed");
        
        const puter = (window as any).puter;
        if (!puter) throw new Error("Puter SDK not loaded");
        
        const promptText = userMsg || "Identify the animal and any visible disease symptoms. Suggest a brief remedy.";
        const puterResponse = await puter.ai.chat(promptText, [uploadData.url], { model: "google/gemini-3.8-flash" });
        
        const aiResponse = puterResponse?.message?.content || puterResponse || "I could not analyze the image.";
        setMessages([...newMessages, { role: "assistant", content: aiResponse as string }]);
        playTTS(aiResponse as string);

      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
        });
        const data = await res.json();
        
        if (data.choices && data.choices[0]) {
          const aiResponse = data.choices[0].message.content;
          setMessages([...newMessages, { role: "assistant", content: aiResponse }]);
          playTTS(aiResponse);
        } else if (data.error) {
          setMessages([...newMessages, { role: "assistant", content: "Sorry, I am facing an issue connecting to the server. Did you set the SARVAM_API_KEY?" }]);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "assistant", content: "Network error. Please try again." }]);
    }
    
    setLoading(false);
  };

  // Only render if logged in
  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-violet-600 text-white rounded-full shadow-2xl hover:bg-violet-700 hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden">
          <header className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-center justify-between text-white shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold">AI Vet Assistant</h2>
                <p className="text-[10px] text-violet-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === "user" ? "bg-violet-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"}`}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="w-full h-auto rounded-lg mb-2 border border-black/10" />
                  )}
                  {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                  
                  {msg.role === "assistant" && (
                    <button onClick={() => playTTS(msg.content)} className="mt-2 text-violet-600 hover:text-violet-800 p-1 rounded-full hover:bg-violet-50 transition" title="Listen">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="bg-white border-t p-3 relative">
            {previewUrl && (
              <div className="absolute bottom-[100%] left-4 mb-2 relative inline-block">
                <img src={previewUrl} alt="Preview" className="h-16 w-auto rounded-lg border border-gray-200 shadow-sm" />
                <button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <input 
                type="file" 
                accept="image/*,video/*" 
                ref={fileInputRef} 
                onChange={handleImageSelect} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
                title="Upload Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                onClick={startListening}
                className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'}`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-gray-100 focus:bg-white border-transparent focus:border-violet-500 focus:ring-2 focus:ring-violet-200 rounded-full px-3 py-2 text-sm outline-none transition-all"
              />
              
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || loading}
                className="p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
}
