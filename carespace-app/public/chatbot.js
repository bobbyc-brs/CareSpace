// API Base URL
const API_BASE = '/api';

// Global state
let currentDoctor = null;
let allDoctors = [];
let chatHistory = [];
let conversationState = 'initial'; // Track conversation flow
let userSelection = null; // Store user's selection
let userTiming = null; // Store user's timing
let userDuration = null; // Store user's duration

// Utility functions
const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// API functions
const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('API call failed: ' + error.message, 'error');
        throw error;
    }
};

// Load all doctors
const loadDoctors = async () => {
    try {
        const response = await apiCall('/doctors');
        allDoctors = response.data || response;
        if (allDoctors.length > 0) {
            selectRandomDoctor();
        }
    } catch (error) {
        console.error('Failed to load doctors:', error);
        showNotification('Failed to load doctors', 'error');
    }
};

// Select a random doctor
const selectRandomDoctor = () => {
    if (allDoctors.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * allDoctors.length);
    currentDoctor = allDoctors[randomIndex];
    updateDoctorProfile();
    updateWelcomeMessage();
};

// Update doctor profile display
const updateDoctorProfile = () => {
    if (!currentDoctor) return;
    
    document.getElementById('doctor-name').textContent = currentDoctor.Name;
    document.getElementById('doctor-specialty').textContent = currentDoctor.Specialty;
    document.getElementById('doctor-email').textContent = currentDoctor.Email;
    
    // Update office status
    const officeStatus = document.getElementById('office-status');
    if (currentDoctor['Dedicated Space in Office'] === 'yes') {
        officeStatus.textContent = 'Has Office';
        officeStatus.className = 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800';
    } else {
        officeStatus.textContent = 'No Office';
        officeStatus.className = 'px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
    
    // Update home office status
    const homeOffice = document.getElementById('home-office');
    if (currentDoctor['Home Office'] === 'yes') {
        homeOffice.textContent = 'Yes';
        homeOffice.className = 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
    } else {
        homeOffice.textContent = 'No';
        homeOffice.className = 'px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
    
    // Update office ID
    document.getElementById('office-id').textContent = currentDoctor['Office Id'] || 'N/A';
};

// Update welcome message with current doctor
const updateWelcomeMessage = () => {
    if (!currentDoctor) return;
    
    const welcomeName = document.getElementById('welcome-doctor-name');
    if (welcomeName) {
        welcomeName.textContent = currentDoctor.Name;
    }
};

// Add message to chat
const addMessage = (message, isUser = false, options = null) => {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-bubble';
    
    const time = formatTime();
    
    if (isUser) {
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3 justify-end">
                <div class="flex-1 max-w-xs">
                    <div class="bg-blue-600 rounded-lg p-3">
                        <p class="text-white">${message}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 text-right">${time}</p>
                </div>
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-white text-sm"></i>
                    </div>
                </div>
            </div>
        `;
    } else {
        let messageContent = `<p class="text-gray-900">${message}</p>`;
        
        // Add option buttons if provided
        if (options && options.length > 0) {
            messageContent += '<div class="mt-3 space-y-2">';
            options.forEach(option => {
                messageContent += `
                    <button class="option-btn w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-800 font-medium transition-colors" data-option="${option.value}">
                        ${option.label}
                    </button>
                `;
            });
            messageContent += '</div>';
        }
        
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-robot text-white text-sm"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="bg-blue-50 rounded-lg p-3">
                        ${messageContent}
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${time}</p>
                </div>
            </div>
        `;
        
        // Add event listeners to option buttons
        setTimeout(() => {
            const optionButtons = messageDiv.querySelectorAll('.option-btn');
            optionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const option = button.getAttribute('data-option');
                    handleOptionSelection(option);
                });
            });
        }, 100);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to chat history
    chatHistory.push({
        message,
        isUser,
        timestamp: new Date(),
        doctor: currentDoctor?.Name || 'Unknown',
        options: options
    });
};

// Show typing indicator
const showTypingIndicator = () => {
    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message-bubble';
    typingDiv.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
            </div>
            <div class="flex-1">
                <div class="bg-blue-50 rounded-lg p-3">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-blue-400 rounded-full typing-indicator"></div>
                        <div class="w-2 h-2 bg-blue-400 rounded-full typing-indicator" style="animation-delay: 0.2s;"></div>
                        <div class="w-2 h-2 bg-blue-400 rounded-full typing-indicator" style="animation-delay: 0.4s;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Handle option selection
const handleOptionSelection = (option) => {
    // Add user's selection to chat
    addMessage(option, true);
    
    // Update conversation state
    if (conversationState === 'initial') {
        userSelection = option;
        conversationState = 'timing';
        
        // Ask about timing
        setTimeout(() => {
            addMessage("When do you need the space? Please specify the date and time (e.g., '2025-07-15 14:00' or 'tomorrow at 2 PM').", false);
        }, 500);
    } else if (conversationState === 'timing') {
        userTiming = option;
        conversationState = 'duration';
        
        // Ask about duration
        setTimeout(() => {
            addMessage("How long do you need the space for? Please specify the duration (e.g., '2 hours', '1 hour', '30 minutes').", false, [
                { label: "⏰ 1 Hour", value: "1" },
                { label: "⏰ 2 Hours", value: "2" },
                { label: "⏰ 3 Hours", value: "3" },
                { label: "⏰ 4 Hours", value: "4" }
            ]);
        }, 500);
    } else if (conversationState === 'duration') {
        userDuration = option;
        // Process booking request with all details
        setTimeout(() => {
            processBookingRequest(userSelection, userTiming, userDuration);
        }, 500);
    }
};

// Process booking request
const processBookingRequest = async (activity, timing, duration) => {
    try {
        // Parse timing
        let date, time;
        if (timing.toLowerCase().includes('tomorrow')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            date = tomorrow.toISOString().split('T')[0];
            time = '09:00'; // Default time
        } else if (timing.includes('2025-')) {
            const parts = timing.split(' ');
            date = parts[0];
            time = parts[1] || '09:00';
        } else {
            // Try to parse other formats
            date = new Date().toISOString().split('T')[0];
            time = '09:00';
        }
        
        // Map activity to space category
        let category = 'Admin';
        if (activity.toLowerCase().includes('labwork')) {
            category = 'Research';
        } else if (activity.toLowerCase().includes('patient')) {
            category = 'Clinical';
        } else if (activity.toLowerCase().includes('research')) {
            category = 'Research';
        }
        
        // Get suggestions from API with duration
        const response = await apiCall(`/chatbot/suggestions?specialty=general&date=${date}&time=${time}&duration=${duration}`);
        
        if (response.success && response.data) {
            const suggestions = response.data;
            let message = `Based on your request for ${activity} on ${date} at ${time}, here are my recommendations:\n\n`;
            
            if (suggestions.doctors && suggestions.doctors.length > 0) {
                message += `👨‍⚕️ **Available Doctors:**\n`;
                suggestions.doctors.slice(0, 3).forEach(doctor => {
                    message += `• ${doctor.Name} (${doctor.Specialty})\n`;
                });
                message += '\n';
            }
            
            if (suggestions.spaces && suggestions.spaces.length > 0) {
                message += `🏢 **Available Spaces:**\n`;
                const relevantSpaces = suggestions.spaces.filter(space => 
                    space.Category.toLowerCase().includes(category.toLowerCase())
                );
                
                const spacesToShow = relevantSpaces.length > 0 ? relevantSpaces : suggestions.spaces;
                
                spacesToShow.slice(0, 5).forEach(space => {
                    const availability = space.availability;
                    const capacity = space['Capacity (people)'];
                    const area = space['Area (sqm)'];
                    
                    message += `• **${space.Name}** (${space.Category})\n`;
                    message += `  📅 Date: ${availability?.date || date}\n`;
                    message += `  ⏰ Time: ${availability?.startTime || time} - ${availability?.endTime || '11:00'}\n`;
                    message += `  ⏱️ Duration: ${availability?.duration || duration}\n`;
                    message += `  👥 Capacity: ${capacity} people\n`;
                    message += `  📏 Area: ${area} sqm\n`;
                    
                    if (space['Specialized Equipment'] && space['Specialized Equipment'] !== 'None') {
                        message += `  🔧 Equipment: ${space['Specialized Equipment']}\n`;
                    }
                    message += '\n';
                });
            }
            
            message += `Would you like me to help you book any of these options?`;
            
            addMessage(message, false);
            conversationState = 'recommendations';
        } else {
            addMessage("I couldn't find available spaces for your requested time. Would you like to try a different date or time?", false);
        }
        
    } catch (error) {
        console.error('Failed to process booking request:', error);
        addMessage("I'm having trouble processing your request right now. Please try again or contact our booking office directly.", false);
    }
};

// Hide typing indicator
const hideTypingIndicator = () => {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
};

// Generate AI response based on user input and doctor specialty
const generateAIResponse = async (userMessage) => {
    const specialty = currentDoctor?.Specialty || 'General Medicine';
    const doctorName = currentDoctor?.Name || 'Dr. AI';
    
    // Check if this is a timing response
    if (conversationState === 'timing') {
        return processBookingRequest(userSelection, userMessage, userDuration);
    }
    
    // Check if this is a duration response
    if (conversationState === 'duration') {
        return processBookingRequest(userSelection, userTiming, userMessage);
    }
    
    // Simple response generation based on keywords and specialty
    const responses = {
        'hello': `Hello! I'm ${doctorName}, a ${specialty}. How can I help you today?`,
        'how are you': `I'm doing well, thank you for asking! As a ${specialty}, I'm here to assist you with any medical questions you might have.`,
        'symptoms': `I understand you're asking about symptoms. As a ${specialty}, I can provide general information, but please remember to consult with a healthcare provider for proper diagnosis. What specific symptoms are you concerned about?`,
        'pain': `Pain can have many causes. As a ${specialty}, I can help explain potential causes, but it's important to see a healthcare provider for proper evaluation. Can you tell me more about the type and location of your pain?`,
        'medication': `I can provide general information about medications, but I cannot prescribe or recommend specific medications. Please consult with your healthcare provider for medical advice.`,
        'appointment': `I'd be happy to help you understand what to expect during a medical appointment. As a ${specialty}, I can explain typical procedures and preparations.`,
        'emergency': `If you're experiencing a medical emergency, please call emergency services immediately. This chatbot is for informational purposes only and cannot provide emergency medical care.`,
        'general': `As a ${specialty}, I can provide general health information and answer questions about medical topics. However, please remember that this is for educational purposes only and should not replace professional medical advice.`
    };
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for specific keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return responses.hello;
    } else if (lowerMessage.includes('how are you')) {
        return responses['how are you'];
    } else if (lowerMessage.includes('symptom')) {
        return responses.symptoms;
    } else if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        return responses.pain;
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('drug')) {
        return responses.medication;
    } else if (lowerMessage.includes('appointment') || lowerMessage.includes('visit')) {
        return responses.appointment;
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
        return responses.emergency;
    } else {
        // Generate a contextual response based on specialty
        const specialtyResponses = {
            'Pediatric': `As a ${specialty}, I specialize in children's health. I can provide general information about pediatric care, but please consult with a pediatrician for specific medical advice.`,
            'Cardiology': `As a ${specialty}, I can discuss heart health and cardiovascular topics. However, for specific cardiac concerns, please consult with a cardiologist.`,
            'Emergency': `As an ${specialty}, I can provide information about emergency medicine and urgent care situations. Remember, for true emergencies, call emergency services immediately.`,
            'Anesthesiology': `As a ${specialty}, I can explain anesthesia and surgical procedures. For specific questions about your upcoming surgery, please consult with your surgical team.`,
            'Oncology': `As a ${specialty}, I can provide general information about cancer and treatment options. For specific cancer care, please consult with your oncologist.`,
            'Neurology': `As a ${specialty}, I can discuss neurological conditions and brain health. For specific neurological concerns, please consult with a neurologist.`
        };
        
        for (const [key, response] of Object.entries(specialtyResponses)) {
            if (specialty.includes(key)) {
                return response;
            }
        }
        
        return responses.general;
    }
};

// Handle chat form submission
const handleChatSubmit = async (e) => {
    e.preventDefault();
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI thinking time
    setTimeout(async () => {
        hideTypingIndicator();
        
        try {
            const response = await generateAIResponse(message);
            addMessage(response, false);
        } catch (error) {
            console.error('Failed to generate response:', error);
            addMessage('I apologize, but I\'m having trouble processing your request right now. Please try again later.', false);
        }
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load doctors on page load
    loadDoctors();
    
    // Chat form submission
    document.getElementById('chat-form').addEventListener('submit', handleChatSubmit);
    
    // New doctor button
    document.getElementById('new-doctor-btn').addEventListener('click', () => {
        selectRandomDoctor();
        conversationState = 'initial';
        userSelection = null;
        userTiming = null;
        userDuration = null;
        addMessage(`I'm now ${currentDoctor?.Name}, a ${currentDoctor?.Specialty}. How can I help you today?`, false);
        
        // Start the conversation flow
        setTimeout(() => {
            addMessage("What do you need to do today?", false, [
                { label: "🔬 Labwork", value: "Labwork" },
                { label: "👥 Patient Consultation", value: "Patient Consultation" },
                { label: "📚 Research", value: "Research" }
            ]);
        }, 1000);
    });
    
    // Check server health periodically
    setInterval(async () => {
        try {
            await apiCall('/health');
            document.querySelector('#server-status .w-2').className = 'w-2 h-2 bg-green-500 rounded-full mr-2';
            document.querySelector('#server-status span').textContent = 'Server Online';
        } catch (error) {
            document.querySelector('#server-status .w-2').className = 'w-2 h-2 bg-red-500 rounded-full mr-2';
            document.querySelector('#server-status span').textContent = 'Server Offline';
        }
    }, 30000); // Check every 30 seconds
    
    // Start the conversation flow after a short delay
    setTimeout(() => {
        addMessage("What do you need to do today?", false, [
            { label: "🔬 Labwork", value: "Labwork" },
            { label: "👥 Patient Consultation", value: "Patient Consultation" },
            { label: "📚 Research", value: "Research" }
        ]);
    }, 2000);
}); 