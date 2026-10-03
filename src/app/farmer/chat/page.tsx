"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, MicOff, Send, Volume2, ArrowLeft, Image as ImageIcon, X, Bot } from "lucide-react";
import FarmerNav from "@/components/farmer/FarmerNav";

export default function ChatPage() {
  const router = useRouter();
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
    const stored = localStorage.getItem("jeevraksha_user");
    if (!stored) {
      router.push("/login?redirect=/farmer/chat");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!document.querySelector('script[src="https://js.puter.com/v2/"]')) {
      const script = document.createElement("script");
      script.src = "https://js.puter.com/v2/";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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
        // Handle Vision with Puter.js
        // 1. Upload to temp folder
        const formData = new FormData();
        formData.append("file", fileToUpload);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        
        if (!uploadData.url) throw new Error("Upload failed");
        
        // 2. Pass to puter.ai.chat
        const puter = (window as any).puter;
        if (!puter) throw new Error("Puter SDK not loaded");
        
        const promptText = userMsg || "Identify the animal and any visible disease symptoms. Suggest a brief remedy.";
        const puterResponse = await puter.ai.chat(promptText, [uploadData.url], { model: "google/gemini-3.8-flash" });
        
        const aiResponse = puterResponse?.message?.content || puterResponse || "I could not analyze the image.";
        setMessages([...newMessages, { role: "assistant", content: aiResponse as string }]);
        playTTS(aiResponse as string);

      } else {
        // Handle Text only with Sarvam AI
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

  return (
    <div className="min-h-screen bg-[#f5f4fb] flex flex-col pb-20 md:pb-0">
      <FarmerNav userName={user?.name} />
      
      {/* Sub Header */}
      <div className="bg-white border-b px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 leading-tight">AI Veterinary Voice Assistant</h1>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sarvam Indic NLP & Vision Online
            </p>
          </div>
        </div>

        <Link
          href="/farmer/report"
          className="text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-100 transition"
        >
          File Disease Report →
        </Link>
      </div>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl ${msg.role === "user" ? "bg-violet-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"}`}>
              {msg.image && (
                <img src={msg.image} alt="Uploaded" className="w-full max-w-[200px] h-auto rounded-lg mb-2 border border-white/20" />
              )}
              {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
              
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
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t p-3 sm:p-4 pb-safe sticky bottom-0">
        {previewUrl && (
          <div className="max-w-4xl mx-auto mb-3 relative inline-block">
            <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-lg border border-gray-200 shadow-sm" />
            <button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2 items-center relative">
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
            className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full flex-shrink-0 transition-all"
            title="Upload Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={startListening}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the issue... (हिंदी/English)"
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 rounded-full px-4 py-3 outline-none text-sm text-gray-800 transition-all"
          />
          
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || loading}
            className="p-3 bg-violet-600 text-white rounded-full flex-shrink-0 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
