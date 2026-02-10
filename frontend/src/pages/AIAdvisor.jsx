import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, TrendingUp, Loader2, AlertCircle, Bot, User } from 'lucide-react';
import api from '../api/axios';
import PageTransition from '../components/PageTransition';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function AIAdvisor() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "👋 Hello! I'm your AI Financial Advisor. I can help you with:\n\n• Portfolio analysis and recommendations\n• Stock market insights\n• Trading strategies\n• Risk assessment\n\nWhat would you like to know?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickQuestions = [
        "How is my portfolio performing?",
        "What stocks should I buy today?",
        "Analyze my risk exposure",
        "Show me market trends"
    ];

    const handleSend = async (customMessage = null) => {
        const messageText = customMessage || input.trim();
        if (!messageText || loading) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/ai/chat', {
                message: messageText,
                context: 'portfolio_analysis'
            });

            // Add AI response
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: data.response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('AI chat error:', err);
            setError(err.response?.data?.error || 'Failed to get AI response. Please try again.');
            
            // Add error message
            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again or rephrase your question.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <PageTransition>
            <div className="max-w-5xl mx-auto space-y-6 pb-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-text-primary flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-2xl shadow-lg">
                                <Sparkles className="text-white" size={28} />
                            </div>
                            AI Financial Advisor
                        </h1>
                        <p className="text-emerald-600 dark:text-emerald-400 mt-2">
                            Powered by LangChain & GPT-4
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-muted">
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">AI Online</span>
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <Card className="h-[600px] flex flex-col">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={clsx(
                                    'flex gap-3',
                                    message.type === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {message.type === 'ai' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-md">
                                        <Bot size={18} className="text-white" />
                                    </div>
                                )}
                                
                                <div
                                    className={clsx(
                                        'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                                        message.type === 'user'
                                            ? 'bg-emerald-600 dark:bg-emerald-700 text-white'
                                            : message.type === 'error'
                                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700/50'
                                            : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary border border-gray-200 dark:border-dark-border-primary'
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                    </p>
                                    <p className={clsx(
                                        'text-xs mt-2 opacity-70',
                                        message.type === 'user' ? 'text-white' : 'text-gray-500 dark:text-dark-text-muted'
                                    )}>
                                        {format(message.timestamp, 'HH:mm')}
                                    </p>
                                </div>

                                {message.type === 'user' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center shadow-md">
                                        <User size={18} className="text-white" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div className="bg-gray-100 dark:bg-dark-bg-tertiary rounded-2xl px-4 py-3 border border-gray-200 dark:border-dark-border-primary">
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm text-gray-600 dark:text-dark-text-muted">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length === 1 && (
                        <div className="px-6 py-3 border-t border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary">
                            <p className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted mb-2">Quick Questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickQuestions.map((question, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(question)}
                                        className="px-3 py-1.5 bg-white dark:bg-dark-bg-secondary text-sm text-gray-700 dark:text-dark-text-primary rounded-lg border border-gray-300 dark:border-dark-border-primary hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 dark:border-dark-border-primary bg-white dark:bg-dark-bg-secondary">
                        {error && (
                            <div className="mb-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/50 rounded-lg flex items-start gap-2">
                                <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about your portfolio..."
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-emerald-500 dark:focus:border-emerald-600 outline-none transition-all"
                                disabled={loading}
                            />
                            <Button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
                                variant="success"
                                className="px-4"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary text-sm">Portfolio Analysis</h3>
                                <p className="text-xs text-gray-600 dark:text-dark-text-muted mt-1">
                                    Get AI-powered insights on your holdings and performance
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Sparkles className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary text-sm">Smart Recommendations</h3>
                                <p className="text-xs text-gray-600 dark:text-dark-text-muted mt-1">
                                    Receive personalized trading suggestions based on market data
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <AlertCircle className="text-purple-600 dark:text-purple-400" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary text-sm">Risk Assessment</h3>
                                <p className="text-xs text-gray-600 dark:text-dark-text-muted mt-1">
                                    Understand your portfolio risk and get diversification tips
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </PageTransition>
    );
}