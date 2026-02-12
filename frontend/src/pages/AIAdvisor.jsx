import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function AIAdvisor() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hello! I'm your Quant Assistant. I have access to your real-time portfolio data and market trends.\n\nAsk me about:\n• Portfolio Rebalancing\n• Risk Analysis\n• Market Sentiment",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        
        const userMsg = { id: Date.now(), type: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Replaced custom 'api' import with direct axios usage to bypass compiler resolution issues
            const token = localStorage.getItem('token');
            const { data } = await axios.post('/api/ai/chat', 
                { message: userMsg.content, context: 'portfolio_analysis' },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            setMessages(prev => [...prev, { id: Date.now()+1, type: 'ai', content: data.response, timestamp: new Date() }]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now()+1, type: 'error', content: 'Connection to AI Service interrupted.', timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in relative w-full min-h-screen bg-slate-50/50 font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600">
            
            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-12 h-[calc(100vh-80px)] flex flex-col gap-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-orange-100 rounded-lg">
                                <BrainCircuit size={18} className="text-orange-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">ProTrader Intelligence</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">AI Quant Advisor</h1>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm hidden sm:flex">
                        <span className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-emerald-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
                        </span>
                    </div>
                </div>

                {/* Chat Area Container */}
                <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                    
                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={clsx("flex gap-4 w-full md:max-w-3xl", msg.type === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                                
                                {/* Avatar */}
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                                    msg.type === 'ai' ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    {msg.type === 'ai' ? <Bot size={20} /> : <User size={20} />}
                                </div>
                                
                                {/* Message Bubble - Added break-words and overflow guards */}
                                <div className={clsx(
                                    "p-5 rounded-[24px] text-sm md:text-base leading-relaxed font-medium shadow-sm overflow-hidden",
                                    msg.type === 'user' 
                                        ? "bg-orange-600 text-white rounded-tr-sm shadow-orange-600/20" 
                                        : msg.type === 'error'
                                            ? "bg-rose-50 text-rose-700 border border-rose-100 rounded-tl-sm"
                                            : "bg-orange-50/50 text-slate-800 border border-orange-100/50 rounded-tl-sm"
                                )}>
                                    {/* CSS FIX: break-words ensures long text strings break to the next line instead of overflowing */}
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    
                                    <span className={clsx(
                                        "text-[10px] font-bold tracking-widest mt-3 block", 
                                        msg.type==='user' ? 'text-orange-200' : 'text-slate-400'
                                    )}>
                                        {format(msg.timestamp, 'HH:mm')}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="flex gap-4 max-w-3xl animate-fade-in mr-auto">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <Bot size={20} className="text-orange-600"/>
                                </div>
                                <div className="bg-orange-50/50 border border-orange-100/50 px-6 py-5 rounded-[24px] rounded-tl-sm flex gap-2 items-center shadow-sm">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-slate-50/80 border-t border-slate-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about your portfolio risks or market trends..."
                                className="w-full bg-white border-2 border-slate-200 rounded-[20px] pl-6 pr-16 py-4 text-slate-900 font-medium placeholder-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="absolute right-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white p-3 rounded-2xl transition-all disabled:opacity-50 disabled:transform-none shadow-md shadow-orange-600/20 hover:-translate-y-0.5"
                            >
                                <Send size={20} className="ml-0.5" />
                            </button>
                        </div>
                        <div className="mt-3 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                AI insights are for educational purposes. Do not treat as financial advice.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}