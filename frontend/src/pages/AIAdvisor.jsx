import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BrainCircuit, Sparkles, TrendingUp, Newspaper, BriefcaseBusiness } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAdvisor() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (textOverride) => {
        const textToUse = typeof textOverride === 'string' ? textOverride : input;
        if (!textToUse.trim() || loading) return;

        const userMsg = { id: Date.now(), type: 'user', content: textToUse, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post('/api/ai/agent-chat',
                { query: userMsg.content },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                content: data.response,
                steps: data.agent_steps,
                timestamp: new Date()
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'error', content: 'Connection to AI Service interrupted or Rate Limited. Please try again.', timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSession = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/ai/clear-agent', {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setMessages([]);
        } catch (err) {
            console.error("Failed to clear session", err);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { icon: BriefcaseBusiness, label: "Analyze my portfolio", query: "Can you analyze my personal stock portfolio and tell me how it is distributed?" },
        { icon: TrendingUp, label: "Live TSLA Price", query: "What is the exact current stock price of TSLA?" },
        { icon: Newspaper, label: "Portfolio News", query: "What is the latest news and sentiment for the specific stocks currently in my portfolio?" },
    ];

    return (
        <div className="relative w-full min-h-[calc(100vh-80px)] bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600 flex flex-col items-center">

            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-300/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-5xl px-4 md:px-8 py-6 h-[calc(100vh-80px)] flex flex-col gap-6">

                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900">Omni Agent</h1>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Connected to Postgres & Quant Web
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClearSession}
                        disabled={loading || messages.length === 0}
                        className="text-xs font-bold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
                    >
                        RESET MEMORY
                    </button>
                </motion.div>

                {/* Chat Area Container */}
                <div className="flex-1 overflow-hidden relative flex flex-col rounded-[32px] bg-white/60 backdrop-blur-2xl border border-white shadow-xl shadow-slate-200/50">

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {messages.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-10 md:mt-20"
                                >
                                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                        <Bot size={40} />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4">How can I assist you today?</h2>
                                    <p className="text-slate-500 font-medium mb-10 text-lg leading-relaxed">
                                        I am an advanced Omni Agent. I can seamlessly analyze your personal portfolio, fetch live real-time stock prices, and read the latest global news sentiment.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                        {quickActions.map((action, idx) => {
                                            const Icon = action.icon;
                                            return (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{ y: -4, scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleSend(action.query)}
                                                    className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all text-center group"
                                                >
                                                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                                        <Icon size={24} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-orange-600">{action.label}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ) : (
                                messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        layout
                                        className={clsx("flex gap-4 w-full md:max-w-3xl", msg.type === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}
                                    >
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1",
                                            msg.type === 'ai' ? "bg-gradient-to-br from-orange-400 to-rose-500 text-white" : "bg-slate-200 text-slate-600"
                                        )}>
                                            {msg.type === 'ai' ? <Bot size={20} /> : <User size={20} />}
                                        </div>

                                        <div className={clsx(
                                            "relative p-5 rounded-[28px] text-sm md:text-base leading-relaxed font-medium shadow-sm",
                                            msg.type === 'user'
                                                ? "bg-slate-900 text-white rounded-tr-sm"
                                                : msg.type === 'error'
                                                    ? "bg-rose-50 text-rose-700 border border-rose-100 rounded-tl-sm"
                                                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm ring-1 ring-black/5"
                                        )}>
                                            <div className={clsx("prose prose-sm md:prose-base max-w-none break-words whitespace-pre-wrap",
                                                msg.type === 'user' ? 'prose-invert' : 'prose-slate prose-a:text-orange-600 box-border'
                                            )}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>

                                            {msg.type === 'ai' && msg.steps && (
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                                                        <BrainCircuit size={12} />
                                                        REASONED IN {msg.steps} STEPS
                                                    </span>
                                                    <span className="text-[10px] font-bold tracking-widest text-slate-400">
                                                        {format(msg.timestamp, 'HH:mm')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 max-w-3xl mr-auto mt-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                                    <Bot size={20} />
                                </div>
                                <div className="bg-white border border-slate-100 px-6 py-5 rounded-[28px] rounded-tl-sm flex gap-2 items-center shadow-sm ring-1 ring-black/5">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-white/50 backdrop-blur-md border-t border-slate-100">
                        <div className="relative flex items-center max-w-4xl mx-auto">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask Omni Agent anything..."
                                className="w-full bg-white border-2 border-slate-200 rounded-full pl-6 pr-16 py-4 text-slate-900 font-medium placeholder-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className="absolute right-2 bg-slate-900 hover:bg-orange-600 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-slate-900 shadow-sm flex items-center justify-center"
                            >
                                <Send size={20} className="ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}