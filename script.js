class ChatInterfaceApp {
    constructor() {
        this.currentUser = null;
        this.emailJsOtp = null;
        this.otpExpiry = null;
        this.messages = [
            {
                id: 1,
                type: 'incoming',
                text: 'Grad I ran into you today to cooperate',
                time: '8:30 ✓'
            },
            {
                id: 2,
                type: 'outgoing',
                text: 'I\'m happy too, I hope we work well together',
                time: '8:38'
            }
        ];
        
        this.botResponses = [
            "That's interesting! Tell me more about that.",
            "I understand what you're saying. How can I help you with that?",
            "Thanks for sharing that with me. What would you like to know?",
            "I see! That's a great question. Let me think about that.",
            "Absolutely! I'm here to help you with whatever you need.",
            "That makes sense. Is there anything specific you'd like assistance with?",
            "I appreciate you reaching out. How can I make your day better?",
            "Great point! I'd love to help you explore that further.",
            "I'm glad you asked! That's something I can definitely help with.",
            "Interesting perspective! What other thoughts do you have on this?"
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadMessages();
        this.showAuthScreen(); // Start with auth screen
    }
    
    bindEvents() {
        // Authentication events
        const generateOtpBtn = document.getElementById('generateOtpBtn');
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        const backToLoginBtn = document.getElementById('backToLoginBtn');
        
        if (generateOtpBtn) {
            generateOtpBtn.addEventListener('click', () => this.generateOTP());
        }
        if (verifyOtpBtn) {
            verifyOtpBtn.addEventListener('click', () => this.verifyOTP());
        }
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => this.backToLogin());
        }
        
        // Chat interface events
        const textInput = document.querySelector('.text-input');
        const micIcon = document.querySelector('.mic-icon');
        
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        if (micIcon) {
            micIcon.addEventListener('click', () => this.sendMessage());
        }
        
        // Other icon events (for demonstration)
        const backArrow = document.querySelector('.back-arrow');
        const callIcon = document.querySelector('.call-icon');
        const menuIcon = document.querySelector('.menu-icon');
        const emojiIcon = document.querySelector('.emoji-icon');
        const cameraIcon = document.querySelector('.camera-icon');
        
        if (backArrow) {
            backArrow.addEventListener('click', () => this.showAuthScreen());
        }
        
        [callIcon, menuIcon, emojiIcon, cameraIcon].forEach(icon => {
            if (icon) {
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Visual feedback
                    icon.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        icon.style.transform = 'scale(1)';
                    }, 100);
                });
            }
        });
    }
    
    showAuthScreen() {
        const authScreen = document.getElementById('authScreen');
        const phoneFrame = document.querySelector('.phone-frame');
        
        if (authScreen && phoneFrame) {
            authScreen.classList.remove('hidden');
            phoneFrame.style.display = 'none';
        }
    }
    
    showChatInterface() {
        const authScreen = document.getElementById('authScreen');
        const phoneFrame = document.querySelector('.phone-frame');
        
        if (authScreen && phoneFrame) {
            authScreen.classList.add('hidden');
            phoneFrame.style.display = 'block';
        }
    }
    
    async generateOTP() {
        const username = document.getElementById('username')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        
        if (!username || !email) {
            alert('Please enter both username and email');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Generate 6-digit OTP
        this.emailJsOtp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        
        // Store user data temporarily
        this.currentUser = { username, email };

        const templateParams = {
            email: email,
            passcode: this.emailJsOtp,
            time: new Date().toLocaleTimeString(),
        };

        try {
            await emailjs.send("service_gw6j3vn", "template_mfqhl5q", templateParams);
            alert('OTP sent to your email!');
            // Show OTP form
            const loginForm = document.getElementById('loginForm');
            const otpForm = document.getElementById('otpForm');
            if (loginForm && otpForm) {
                loginForm.classList.add('hidden');
                otpForm.classList.remove('hidden');
            }
            
            // Auto-expire OTP after 10 minutes
            setTimeout(() => {
                if (this.emailJsOtp) {
                    this.emailJsOtp = null;
                    this.otpExpiry = null;
                    alert('OTP has expired. Please generate a new one.');
                    this.backToLogin();
                }
            }, 10 * 60 * 1000);

        } catch (error) {
            console.error('Failed to send OTP:', error);
            alert('Failed to send OTP. Please try again later.');
            this.emailJsOtp = null;
            this.otpExpiry = null;
        }
    }
    
    verifyOTP() {
        const enteredOTP = document.getElementById('otpInput')?.value.trim();
        
        if (!enteredOTP) {
            alert('Please enter the OTP');
            return;
        }
        
        if (!this.emailJsOtp) {
            alert('No OTP generated. Please generate OTP first.');
            return;
        }
        
        if (Date.now() > this.otpExpiry) {
            alert('OTP has expired. Please generate a new one.');
            this.backToLogin();
            return;
        }
        
        if (enteredOTP === this.emailJsOtp) {
            // OTP verified successfully
            this.emailJsOtp = null;
            this.otpExpiry = null;
            this.showChatInterface();
        } else {
            alert('Invalid OTP. Please try again.');
            const otpInput = document.getElementById('otpInput');
            if (otpInput) {
                otpInput.value = '';
            }
        }
    }
    
    backToLogin() {
        const loginForm = document.getElementById('loginForm');
        const otpForm = document.getElementById('otpForm');
        const otpInput = document.getElementById('otpInput');
        
        if (loginForm && otpForm) {
            otpForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        }
        if (otpInput) {
            otpInput.value = '';
        }
        this.emailJsOtp = null;
        this.otpExpiry = null;
    }
    
    loadMessages() {
        const messageArea = document.querySelector('.message-display-area');
        if (!messageArea) return;
        
        // Clear existing messages except the default ones
        const existingMessages = messageArea.querySelectorAll('.message-bubble');
        existingMessages.forEach(msg => {
            if (!msg.classList.contains('default-message')) {
                msg.remove();
            }
        });
        
        // Add any additional messages
        this.messages.forEach(message => {
            if (message.id > 2) { // Only add new messages, not the default ones
                this.displayMessage(message);
            }
        });
    }
    
    sendMessage() {
        const textInput = document.querySelector('.text-input');
        if (!textInput) return;
        
        const text = textInput.value.trim();
        if (!text) return;
        
        // Create user message
        const userMessage = {
            id: Date.now(),
            type: 'outgoing',
            text: text,
            time: this.getCurrentTime()
        };
        
        // Add to messages array
        this.messages.push(userMessage);
        this.displayMessage(userMessage);
        
        // Clear input
        textInput.value = '';
        
        // Generate bot response after a delay
        setTimeout(() => {
            this.generateBotResponse();
        }, 1000 + Math.random() * 2000);
    }
    
    generateBotResponse() {
        const randomResponse = this.botResponses[Math.floor(Math.random() * this.botResponses.length)];
        const botMessage = {
            id: Date.now(),
            type: 'incoming',
            text: randomResponse,
            time: this.getCurrentTime() + ' ✓'
        };
        
        this.messages.push(botMessage);
        this.displayMessage(botMessage);
    }
    
    displayMessage(message) {
        const messageArea = document.querySelector('.message-display-area');
        if (!messageArea) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${message.type}`;
        
        messageDiv.innerHTML = `
            <p>${this.escapeHtml(message.text)}</p>
            <span class="message-time">${message.time}</span>
        `;
        
        messageArea.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        
        return `${displayHours}:${displayMinutes}`;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            const messageArea = document.querySelector('.message-display-area');
            if (messageArea) {
                messageArea.scrollTop = messageArea.scrollHeight;
            }
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatInterfaceApp();
});

