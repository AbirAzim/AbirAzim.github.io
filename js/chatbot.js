// AI Chatbot Manager
export class ChatbotManager {
    constructor() {
        this.isInitialized = false;
        this.chatHistory = [];
        this.isTyping = false;
        this.apiKey = null;
    }

    // Initialize chatbot only if API key is available
    async init() {
        // Check for API key in environment or config
        this.apiKey = this.getApiKey();
        
        if (!this.apiKey) {
            console.log('No API key found - Chatbot disabled');
            this.hideChatbot();
            return;
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

        // Show chatbot
        chatContainer.style.display = 'block';

        // Cloud click functionality
        const toggleChat = () => {
            chatToggle.classList.toggle('active');
            chatWidget.classList.toggle('active');
            
            // Hide cloud when chat opens
            if (chatWidget.classList.contains('active')) {
                chatInput.focus();
                if (aiCloud) {
                    aiCloud.style.opacity = '0';
                    aiCloud.style.visibility = 'hidden';
                    aiCloud.style.transform = 'translateY(10px) scale(0.8)';
                }
            } else {
                // Show cloud again when chat closes (with delay)
                if (aiCloud) {
                    setTimeout(() => {
                        aiCloud.style.opacity = '1';
                        aiCloud.style.visibility = 'visible';
                        aiCloud.style.transform = 'translateY(0) scale(1)';
                    }, 500);
                }
            }
        };

        chatToggle.addEventListener('click', toggleChat);
        
        // Make cloud clickable to open chat
        if (aiCloud) {
            aiCloud.addEventListener('click', () => {
                if (!chatWidget.classList.contains('active')) {
                    toggleChat();
                }
            });
        }

        // Chat functionality
        const sendMessage = async (message) => {
            if (this.isTyping) return;
            
            // Add user message
            this.addMessage(message, 'user');
            chatInput.value = '';
            chatSend.disabled = true;
            
            // Show typing indicator
            this.showTypingIndicator();
            
            try {
                const response = await this.callAPI(message, this.chatHistory);
                
                this.hideTypingIndicator();
                this.addMessage(response, 'bot');
                
                // Update chat history
                this.chatHistory.push(
                    { role: 'user', text: message },
                    { role: 'model', text: response }
                );
                
            } catch (error) {
                this.hideTypingIndicator();
                this.addMessage('> ERROR: Connection failed. Please try again.', 'bot');
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

    // Get API key from environment variables or config
    getApiKey() {
        // For security, chatbot is disabled on static deployments
        // This prevents API key exposure in client-side code
        console.log('🔒 Security: Chatbot disabled on static deployment for API key protection.');
        console.log('💡 For full chatbot functionality, use server-side deployment or local development.');
        return null;
    }
    // Hide chatbot if no API key
    hideChatbot() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
    }

    // Call AI API (mock for now, replace with actual API)
    async callAPI(message, history) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Mock responses based on keywords
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('নমস্কার')) {
            return `> GREETING PROTOCOL ACTIVATED\n> Hello! I am Abir's AI assistant\n> How can I help you today?`;
        } else if (lowerMessage.includes('project')) {
            return `> ACCESSING PROJECT DATABASE...\n> Abir's highlighted work:\n• Bigtopa — multi-tenant AWS/AppSync backend\n• Doerfy — GraphQL monorepo (Yoga, TypeGraphQL)\n• Blending101 — Blending Recipe (Node.js GraphQL, MongoDB, Apollo / type-graphql)\n> Which area interests you most?`;
        } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
            return `> SCANNING TECH STACK...\n> Primary technologies:\n• TypeScript, Node.js, GraphQL (Yoga, TypeGraphQL), Express\n• AWS: Lambda, CDK, AppSync, Cognito, EventBridge\n• Data: MongoDB, Mongoose\n• Realtime & notifications: Pusher, event-driven flows`;
        } else if (lowerMessage.includes('experience')) {
            return `> RETRIEVING WORK HISTORY...\n> Data Savvy Inc. (2021–Present): Doerfy (GraphQL monorepo), Blending101 / Blending Recipe (nutrition & recipe GraphQL API), Bigtopa (multi-tenant AWS/AppSync)\n> Stack Learner (2019–2020): Programming trainer, TypeScript YouTube course`;
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('connect')) {
            return `> CONTACT:\n• Email: badhonkhanbk007@gmail.com\n• GitHub: github.com/AbirAzim\n• Location: Dhaka, Bangladesh`;
        } else {
            return `> PROCESSING QUERY...\n> I can summarize Abir's:\n• Backend & GraphQL experience\n• AWS and multi-tenant work\n• Training & content (Stack Learner)\n• Contact details\n> What would you like to know?`;
        }
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = text.replace(/\\n/g, '<br>');
        
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