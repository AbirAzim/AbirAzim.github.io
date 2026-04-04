// AI Chatbot — real replies via Vercel /api/chat (Gemini/OpenAI); mock fallback elsewhere.
function chatErrorTips(detail) {
    const d = String(detail || '').toLowerCase();
    if (
        d.includes('quota') ||
        d.includes('billing') ||
        d.includes('gemini tried first') ||
        d.includes('openai tried first') ||
        d.includes('both providers hit')
    ) {
        return '> Tips: দুটো API-তেই কোটা/বিলিং শেষ হতে পারে। OpenAI: https://platform.openai.com → Billing / Usage। Gemini: https://aistudio.google.com বা https://ai.google.dev — API কী ও লিমিট চেক করুন। Vercel-এ env ঠিক করে Redeploy করুন।';
    }
    return '> Tips: Vercel → Settings → Environment Variables → GEMINI_API_KEY ও/অথবা OPENAI_API_KEY, তারপর Redeploy। লোকাল: npm run dev:vercel ও .env।';
}

export class ChatbotManager {
    constructor() {
        this.isInitialized = false;
        this.chatHistory = [];
        this.isTyping = false;
        /** True when /api/health reports chat API keys are set (Vercel + env). */
        this.useRealChat = false;
    }

    isGitHubPagesHost() {
        return /\.github\.io$/i.test(window.location.hostname || '');
    }

    async probeServerChat() {
        if (this.isGitHubPagesHost()) return false;
        if (window.location.protocol === 'file:') return false;
        try {
            const r = await fetch('/api/health', { method: 'GET' });
            if (!r.ok) return false;
            const j = await r.json();
            return j.chat === true;
        } catch {
            return false;
        }
    }

    async init() {
        if (this.isGitHubPagesHost()) {
            console.log('Chatbot hidden on GitHub Pages (no serverless API; keys stay off the client).');
            this.hideChatbot();
            return;
        }

        this.useRealChat = await this.probeServerChat();
        if (this.useRealChat) {
            console.log('Chatbot: using server /api/chat (Gemini and/or OpenAI).');
        } else {
            console.log('Chatbot: mock mode (vercel dev locally or set GEMINI_API_KEY / OPENAI_API_KEY on Vercel).');
        }

        const chatContainer = document.getElementById('chat-container');
        const chatToggle = document.getElementById('chat-toggle');
        const chatWidget = document.getElementById('chat-widget');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatMessages = document.getElementById('chat-messages');
        const aiCloud = document.querySelector('.ai-cloud');

        if (!chatContainer || !chatToggle || !chatWidget) {
            console.warn('Chat elements not found');
            return;
        }

        chatContainer.style.display = 'block';

        const toggleChat = () => {
            chatToggle.classList.toggle('active');
            chatWidget.classList.toggle('active');

            if (chatWidget.classList.contains('active')) {
                chatInput.focus();
                if (aiCloud) {
                    aiCloud.style.opacity = '0';
                    aiCloud.style.visibility = 'hidden';
                    aiCloud.style.transform = 'translateY(10px) scale(0.8)';
                }
            } else if (aiCloud) {
                setTimeout(() => {
                    aiCloud.style.opacity = '1';
                    aiCloud.style.visibility = 'visible';
                    aiCloud.style.transform = 'translateY(0) scale(1)';
                }, 500);
            }
        };

        chatToggle.addEventListener('click', toggleChat);

        if (aiCloud) {
            aiCloud.addEventListener('click', () => {
                if (!chatWidget.classList.contains('active')) {
                    toggleChat();
                }
            });
        }

        const sendMessage = async (message) => {
            if (this.isTyping) return;

            this.addMessage(message, 'user');
            chatInput.value = '';
            chatSend.disabled = true;

            this.showTypingIndicator();

            try {
                const response = await this.callAPI(message, this.chatHistory);

                this.hideTypingIndicator();
                this.addMessage(response, 'bot');

                this.chatHistory.push(
                    { role: 'user', text: message },
                    { role: 'model', text: response }
                );
            } catch (error) {
                console.error('Chat error:', error);
                this.hideTypingIndicator();
                const detail = error?.message ? String(error.message) : 'Connection failed';
                this.addMessage(`> ERROR\n> ${detail}\n${chatErrorTips(detail)}`, 'bot');
            }

            chatSend.disabled = false;
        };

        chatSend.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = chatInput.value.trim();
                if (message) {
                    sendMessage(message);
                }
            }
        });

        this.isInitialized = true;
        console.log('Chatbot initialized successfully');
    }

    hideChatbot() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
    }

    async callAPI(message, history) {
        if (this.useRealChat) {
            let res;
            try {
                res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message,
                        history: history.slice(-14),
                    }),
                });
            } catch (e) {
                throw new Error(
                    e?.message?.includes('fetch')
                        ? 'Network error — is this site opened as file:// or without /api routes? Use Vercel URL or npm run dev:vercel.'
                        : e?.message || 'Network error'
                );
            }

            const raw = await res.text();
            let data;
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {
                throw new Error(
                    res.status === 404
                        ? '/api/chat not found — redeploy on Vercel after adding the api/ folder.'
                        : `Invalid JSON from server (${res.status}): ${raw.slice(0, 160)}`
                );
            }

            if (!res.ok) {
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            if (!data.reply || typeof data.reply !== 'string') {
                throw new Error(data.error || 'Invalid response from assistant');
            }
            return data.reply;
        }

        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

        const lowerMessage = message.toLowerCase();

        if (
            lowerMessage.includes('hello') ||
            lowerMessage.includes('hi') ||
            lowerMessage.includes('hey') ||
            lowerMessage.includes('namaste')
        ) {
            return `> GREETING PROTOCOL ACTIVATED\n> Hello! I am Abir's AI assistant\n> How can I help you today?`;
        }
        if (lowerMessage.includes('project')) {
            return `> ACCESSING PROJECT DATABASE...\n> Abir's highlighted work:\n• Bigtopa — multi-tenant AWS/AppSync backend\n• Doerfy — GraphQL monorepo (Yoga, TypeGraphQL)\n• Blending101 — Blending Recipe (Node.js GraphQL, MongoDB, Apollo / type-graphql)\n> Which area interests you most?`;
        }
        if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
            return `> SCANNING TECH STACK...\n> Primary technologies:\n• TypeScript, Node.js, GraphQL (Yoga, TypeGraphQL), Express\n• AWS: Lambda, CDK, AppSync, Cognito, EventBridge\n• Data: MongoDB, Mongoose\n• Realtime & notifications: Pusher, event-driven flows`;
        }
        if (lowerMessage.includes('experience')) {
            return `> RETRIEVING WORK HISTORY...\n> Data Savvy Inc. (2021–Present): Doerfy (GraphQL monorepo), Blending101 / Blending Recipe (nutrition & recipe GraphQL API), Bigtopa (multi-tenant AWS/AppSync)\n> Stack Learner (2019–2020): Programming trainer, TypeScript YouTube course`;
        }
        if (lowerMessage.includes('contact') || lowerMessage.includes('connect')) {
            return `> CONTACT:\n• Email: badhonkhanbk007@gmail.com\n• GitHub: github.com/AbirAzim\n• Location: Dhaka, Bangladesh`;
        }
        return `> PROCESSING QUERY...\n> I can summarize Abir's:\n• Backend & GraphQL experience\n• AWS and multi-tenant work\n• Training & content (Stack Learner)\n• Contact details\n> What would you like to know?`;
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        this.isTyping = true;
        const chatMessages = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}
