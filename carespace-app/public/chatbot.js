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
let prompts = null; // Store prompts from JSON file

// OpenAI API configuration
const OPENAI_API_KEY = 'your-openai-api-key'; // Replace with actual API key
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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

// Load prompts from JSON file
const loadPrompts = async () => {
    try {
        const response = await fetch('/prompts.json');
        prompts = await response.json();
    } catch (error) {
        console.error('Failed to load prompts:', error);
        showNotification('Failed to load prompts', 'error');
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
        // Check if user selected "Show My Bookings"
        if (option === 'show_bookings') {
            // Show typing indicator
            showTypingIndicator();
            
            // Show doctor bookings
            setTimeout(async () => {
                hideTypingIndicator();
                const bookingsMessage = await showDoctorBookings();
                addMessage(bookingsMessage, false);
                
                // Reset conversation state and show options again
                setTimeout(() => {
                    conversationState = 'initial';
                    userSelection = null;
                    userTiming = null;
                    userDuration = null;
                    addMessage(prompts.conversation.initial_question, false, prompts.activities.options);
                }, 2000);
            }, 1000);
        } else {
            userSelection = option;
            conversationState = 'timing';
            
            // Ask about timing
            setTimeout(() => {
                addMessage(prompts.conversation.timing_question, false);
            }, 500);
        }
    } else if (conversationState === 'timing') {
        userTiming = option;
        // Check availability first before asking for duration
        setTimeout(() => {
            checkAvailabilityBeforeDuration(userSelection, userTiming);
        }, 500);
    } else if (conversationState === 'duration') {
        userDuration = option;
        // Process booking request with all details
        setTimeout(() => {
            processBookingRequest(userSelection, userTiming, userDuration);
        }, 500);
    }
};

// Check availability before asking for duration
const checkAvailabilityBeforeDuration = async (activity, timing) => {
    try {
        // Parse timing with enhanced parsing for time ranges
        let date, time;
        const timingLower = timing.toLowerCase();
        
        if (timingLower.includes('tomorrow')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            date = tomorrow.toISOString().split('T')[0];
            
            // Handle time ranges like "tomorrow from 2 to 4"
            const timeRangeMatch = timing.match(/from\s+(\d+)\s*(?:to|-)\s*(\d+)/i);
            if (timeRangeMatch) {
                let startHour = parseInt(timeRangeMatch[1]);
                let endHour = parseInt(timeRangeMatch[2]);
                
                // Assume PM if not specified and hour is 1-12
                if (startHour >= 1 && startHour <= 12) {
                    startHour += 12; // Convert to 24-hour format
                }
                if (endHour >= 1 && endHour <= 12) {
                    endHour += 12; // Convert to 24-hour format
                }
                
                // Use start time and calculate duration
                time = `${startHour.toString().padStart(2, '0')}:00`;
            }
            // Extract time from "tomorrow at 2 PM" format
            else if (timingLower.includes('at')) {
                const timeMatch = timing.match(/at\s+(\d+)\s*(am|pm)/i);
                if (timeMatch) {
                    let hour = parseInt(timeMatch[1]);
                    const ampm = timeMatch[2].toLowerCase();
                    if (ampm === 'pm' && hour !== 12) hour += 12;
                    if (ampm === 'am' && hour === 12) hour = 0;
                    time = `${hour.toString().padStart(2, '0')}:00`;
                } else {
                    time = '09:00'; // Default time
                }
            } else {
                time = '09:00'; // Default time
            }
        } else if (timing.includes('2025-')) {
            const parts = timing.split(' ');
            date = parts[0];
            time = parts[1] || '09:00';
        } else {
            // Try to parse other formats like "July 15th at 2 PM"
            const dateMatch = timing.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?/i);
            if (dateMatch) {
                const month = dateMatch[1];
                const day = dateMatch[2];
                const monthIndex = ['january', 'february', 'march', 'april', 'may', 'june', 
                                   'july', 'august', 'september', 'october', 'november', 'december']
                                   .indexOf(month.toLowerCase());
                if (monthIndex !== -1) {
                    date = `2025-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
                } else {
                    date = new Date().toISOString().split('T')[0];
                }
            } else {
                date = new Date().toISOString().split('T')[0];
            }
            
            // Extract time
            const timeMatch = timing.match(/(\d+):?(\d*)\s*(am|pm)/i);
            if (timeMatch) {
                let hour = parseInt(timeMatch[1]);
                const minutes = timeMatch[2] || '00';
                const ampm = timeMatch[3].toLowerCase();
                if (ampm === 'pm' && hour !== 12) hour += 12;
                if (ampm === 'am' && hour === 12) hour = 0;
                time = `${hour.toString().padStart(2, '0')}:${minutes}`;
            } else {
                time = '09:00';
            }
        }
        
        // Map activity to specialty
        let specialty = 'General Medicine';
        if (activity.toLowerCase().includes('lab work') || activity.toLowerCase().includes('labwork')) {
            specialty = 'Research';
        } else if (activity.toLowerCase().includes('patient consultation') || activity.toLowerCase().includes('consultation')) {
            specialty = 'Pediatric';
        } else if (activity.toLowerCase().includes('research')) {
            specialty = 'Research';
        } else if (activity.toLowerCase().includes('teaching') || activity.toLowerCase().includes('education')) {
            specialty = 'Education';
        } else if (activity.toLowerCase().includes('administration') || activity.toLowerCase().includes('admin')) {
            specialty = 'General Medicine';
        } else if (activity.toLowerCase().includes('decompression room') || activity.toLowerCase().includes('decompression')) {
            specialty = 'General Medicine';
        } else if (activity.toLowerCase().includes('private')) {
            specialty = 'General Medicine';
        }
        
        // Check availability with default 1 hour duration
        const response = await fetch(`/api/availability/check?date=${date}&time=${time}&duration=1&specialty=${specialty}&activity=${encodeURIComponent(activity)}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to check availability');
        }
        
        const availability = data.data;
        const availableSpaces = availability.spaceAvailability.filter(s => s.available);
        
        if (availableSpaces.length === 0) {
            // No spaces available, show sorry message
            addMessage(prompts.conversation.no_availability, false);
            // Reset conversation state
            conversationState = 'initial';
            userSelection = '';
            userTiming = '';
            userDuration = '';
        } else {
            // Spaces are available, ask for duration
            conversationState = 'duration';
            addMessage(prompts.conversation.duration_question, false, prompts.duration_options);
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        addMessage(`Sorry, I encountered an error while checking availability: ${error.message}`, false);
        // Reset conversation state
        conversationState = 'initial';
        userSelection = '';
        userTiming = '';
        userDuration = '';
    }
};

// Get AI recommendations for best space options
const getAISpaceRecommendations = async (availableSpaces, activity, date, time, duration) => {
    try {
        const spaceData = availableSpaces.map(space => ({
            name: space.spaceName,
            category: space.category,
            capacity: space.capacity,
            area: space.area,
            equipment: space.equipment || 'None',
            uses: space.uses || 'General',
            features: `${space.category} space with ${space.capacity} capacity, ${space.area} area`
        }));

        // Determine number of recommendations based on available spaces
        const numRecommendations = availableSpaces.length < 5 ? 1 : 3;
        
        const prompt = `As a medical facility space allocation expert, I need your recommendation for the best space option for a medical activity.

Activity: ${activity}
Date: ${date}
Time: ${time}
Duration: ${duration} hour(s)

Available spaces:
${spaceData.map((space, index) => `${index + 1}. ${space.name} (${space.category}) - Capacity: ${space.capacity}, Area: ${space.area}, Equipment: ${space.equipment}, Uses: ${space.uses}`).join('\n')}

Please provide:
1. Your top ${numRecommendations} recommendation${numRecommendations > 1 ? 's' : ''} ranked by suitability
2. Brief reasoning for each recommendation
3. A polite, professional response explaining your suggestions

IMPORTANT: For the spaceName field, use ONLY the space name without the category in parentheses. For example, use "Admin Conference" not "Admin Conference (Admin)".

Format your response as JSON with this structure:
{
  "recommendations": [
    {
      "rank": 1,
      "spaceName": "space name (without category)",
      "reasoning": "brief explanation"
    }
  ],
  "summary": "polite professional explanation"
}`;

        const response = await fetch('/api/openai/parse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                maxTokens: 500
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI recommendations');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
            try {
                const parsedData = JSON.parse(data.data);
                return parsedData;
            } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                return null;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting AI recommendations:', error);
        return null;
    }
};

// Process booking request
const processBookingRequest = async (activity, timing, duration) => {
    try {
        // Use AI to parse natural language date/time input
        const parsedData = await parseDateTimeWithAI(timing);
        const { date, time, duration: parsedDuration, confidence } = parsedData;
        
        // Use parsed duration if not provided
        const finalDuration = duration || parsedDuration || 1;
        
        // Map activity to specialty
        let specialty = 'General Medicine';
        if (activity.toLowerCase().includes('lab work') || activity.toLowerCase().includes('labwork')) {
            specialty = 'Research';
        } else if (activity.toLowerCase().includes('patient consultation') || activity.toLowerCase().includes('consultation')) {
            specialty = 'Pediatric';
        } else if (activity.toLowerCase().includes('research')) {
            specialty = 'Research';
        } else if (activity.toLowerCase().includes('teaching') || activity.toLowerCase().includes('education')) {
            specialty = 'Education';
        } else if (activity.toLowerCase().includes('administration') || activity.toLowerCase().includes('admin')) {
            specialty = 'General Medicine';
        } else if (activity.toLowerCase().includes('decompression room') || activity.toLowerCase().includes('decompression')) {
            specialty = 'General Medicine';
        } else if (activity.toLowerCase().includes('private')) {
            specialty = 'General Medicine';
        }
        
        // Use the new availability check endpoint with activity filtering
        const response = await fetch(`/api/availability/check?date=${date}&time=${time}&duration=${finalDuration}&specialty=${specialty}&activity=${encodeURIComponent(activity)}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to check availability');
        }
        
        const availability = data.data;
        
        // Build detailed response message with time range support
        let timeDisplay = time;
        if (timing.toLowerCase().includes('from') && timing.toLowerCase().includes('to')) {
            const timeRangeMatch = timing.match(/from\s+(\d+)\s*(?:to|-)\s*(\d+)/i);
            if (timeRangeMatch) {
                const startHour = parseInt(timeRangeMatch[1]);
                const endHour = parseInt(timeRangeMatch[2]);
                timeDisplay = `${startHour}:00 - ${endHour}:00`;
            }
        }
        
        let message = `Here are the available options for ${activity} on ${date} at ${timeDisplay} (${finalDuration} hour${parseInt(finalDuration) > 1 ? 's' : ''}):\n\n`;

        // Show only available doctors in table format
        const availableDoctors = availability.doctorAvailability.filter(d => d.available);
        if (availableDoctors.length > 0) {
            message += `👨‍⚕️ Available Doctors:\n\n`;
            message += `| Doctor Name | Specialty |\n`;
            message += `|-------------|-----------|\n`;
            availableDoctors.forEach(doctor => {
                message += `| ${doctor.doctorName} | ${doctor.specialty} |\n`;
            });
            message += `\n`;
        }

        // Show only available spaces in a styled HTML table with booking buttons
        const availableSpaces = availability.spaceAvailability.filter(s => s.available);
        if (availableSpaces.length > 0) {
            // Store the AI recommendations data for later use
            const aiRecommendations = await getAISpaceRecommendations(availableSpaces, activity, date, time, finalDuration);
            
            // Build a styled HTML table using Tailwind CSS classes
            let table = `<div class="overflow-x-auto"><table class="min-w-full text-xs text-left border border-gray-300 rounded-lg shadow-sm">
<thead class="bg-blue-100 text-gray-700">
<tr>
<th class="px-3 py-2 border">Space Name</th>
<th class="px-3 py-2 border">Category</th>
<th class="px-3 py-2 border">Capacity</th>
<th class="px-3 py-2 border">Area</th>
<th class="px-3 py-2 border">Equipment</th>
<th class="px-3 py-2 border">Uses</th>
<th class="px-3 py-2 border">Action</th>
</tr>
</thead>
<tbody class="bg-white">`;
            availableSpaces.forEach(space => {
                table += `<tr>
<td class="px-3 py-2 border font-semibold">${space.spaceName}</td>
<td class="px-3 py-2 border">${space.category}</td>
<td class="px-3 py-2 border text-center">${space.capacity}</td>
<td class="px-3 py-2 border text-center">${space.area}</td>
<td class="px-3 py-2 border">${space.equipment || '-'}</td>
<td class="px-3 py-2 border">${space.uses || '-'}</td>
<td class="px-3 py-2 border text-center">
<button onclick="bookSpace('${space.spaceId}', '${space.spaceName}', '${date}', '${time}', ${finalDuration}, '${activity}')" 
class="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition-colors">
📅 Book
</button>
</td>
</tr>`;
            });
            table += `</tbody></table></div>`;
            message += table;
            
            // Add AI recommendations button at the bottom with auto-show after 10 seconds
            message += `<div class="mt-4 pt-4 border-t border-gray-200">
<button id="ai-recommendations-btn" onclick="showAIRecommendations('${encodeURIComponent(JSON.stringify(aiRecommendations))}', '${activity}', '${date}', '${time}', ${finalDuration})" 
class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
🤖 Show AI Recommendations
</button>
</div>`;
            
            // Auto-show AI recommendations after 10 seconds
            const aiRecommendationsTimeout = setTimeout(() => {
                showAIRecommendations(encodeURIComponent(JSON.stringify(aiRecommendations)), activity, date, time, finalDuration);
            }, 10000);
            
            // Store the timeout ID globally so it can be cleared when booking is successful
            window.aiRecommendationsTimeout = aiRecommendationsTimeout;
        }

        // Show optimal matches in table format
        if (availability.optimalMatches.length > 0) {
            message += `🎯 Optimal Matches:\n\n`;
            message += `| Doctor | Space |\n`;
            message += `|--------|-------|\n`;
            availability.optimalMatches.forEach(match => {
                message += `| ${match.doctor.doctorName} | ${match.space.spaceName} |\n`;
            });
            message += `\nWould you like to book any of these?`;
        } else if (availableSpaces.length === 0) {
            message += `❌ No available spaces found for your requested time.\n`;
            message += `💡 Try a different time, date, or activity.\n`;
        }

        return message;
    } catch (error) {
        console.error('Error processing booking request:', error);
        return `Sorry, I encountered an error while processing your request: ${error.message}`;
    }
};

// Show AI recommendations when user clicks the button
const showAIRecommendations = async (recommendationsData, activity, date, time, duration) => {
    try {
        const recommendations = JSON.parse(decodeURIComponent(recommendationsData));
        
        if (!recommendations || !recommendations.recommendations) {
            addMessage('Sorry, I couldn\'t load the AI recommendations at this time.', false);
            return;
        }
        
        // Take all recommendations (will be 1 if less than 5 spaces, 3 otherwise)
        const topRecommendations = recommendations.recommendations;
        
        // Get the original available spaces to map back to spaceId
        const availableSpacesResponse = await apiCall('/spaces');
        const allSpaces = availableSpacesResponse.success ? availableSpacesResponse.data : [];
        
        let message = `🤖 AI Recommendations for ${activity}:\n\n`;
        message += `Based on your activity requirements, here are my top recommendations:\n\n`;
        
        // Create a styled HTML table similar to available spaces
        message += `<div class="bg-white rounded-lg shadow-md overflow-hidden mb-4">`;
        message += `<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3">`;
        message += `<h3 class="text-lg font-semibold">🤖 AI Recommendations</h3>`;
        message += `</div>`;
        message += `<div class="overflow-x-auto">`;
        message += `<table class="min-w-full divide-y divide-gray-200">`;
        message += `<thead class="bg-gray-50">`;
        message += `<tr>`;
        message += `<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Space</th>`;
        message += `<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reasoning</th>`;
        message += `<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>`;
        message += `</tr>`;
        message += `</thead>`;
        message += `<tbody class="bg-white divide-y divide-gray-200">`;
        
        topRecommendations.forEach((rec, index) => {
            // Find the corresponding space to get the spaceId
            // Handle AI returning space names with category in parentheses like "Admin Conference (Admin)"
            let spaceName = rec.spaceName;
            if (spaceName.includes('(') && spaceName.includes(')')) {
                spaceName = spaceName.split('(')[0].trim();
            }
            
            const space = allSpaces.find(s => s.SpaceName === spaceName);
            const spaceId = space ? space['Space ID'] : null;
            
            if (!spaceId) {
                console.error('Could not find space ID for:', rec.spaceName, 'or cleaned name:', spaceName);
                return; // Skip this recommendation if no space ID found
            }
            
            message += `<tr class="hover:bg-gray-50">`;
            message += `<td class="px-4 py-3 whitespace-nowrap">`;
            message += `<div class="flex items-center">`;
            message += `<div class="flex-shrink-0 h-8 w-8">`;
            message += `<div class="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">${index + 1}</div>`;
            message += `</div>`;
            message += `<div class="ml-3">`;
            message += `<div class="text-sm font-medium text-gray-900">${spaceName}</div>`;
            message += `<div class="text-sm text-gray-500">${space && space.Area ? space.Area : ''}</div>`;
            message += `</div>`;
            message += `</div>`;
            message += `</td>`;
            message += `<td class="px-4 py-3 text-sm text-gray-900">`;
            message += `<div class="max-w-xs">${rec.reasoning}</div>`;
            message += `</td>`;
            message += `<td class="px-4 py-3 whitespace-nowrap text-sm font-medium">`;
            message += `<button onclick="bookSpace('${spaceId.toString()}', '${spaceName.replace(/'/g, "\\'")}', '${date}', '${time}', ${duration}, '${activity}')" `;
            message += `class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs px-3 py-1 rounded-md transition-colors">`;
            message += `Book Now`;
            message += `</button>`;
            message += `</td>`;
            message += `</tr>`;
        });
        
        message += `</tbody>`;
        message += `</table>`;
        message += `</div>`;
        message += `</div>`;
        
        if (recommendations.summary) {
            message += `<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">`;
            message += `<div class="flex">`;
            message += `<div class="flex-shrink-0">`;
            message += `<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">`;
            message += `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />`;
            message += `</svg>`;
            message += `</div>`;
            message += `<div class="ml-3">`;
            message += `<p class="text-sm text-blue-700">${recommendations.summary}</p>`;
            message += `</div>`;
            message += `</div>`;
            message += `</div>`;
        }
        
        const recommendationText = topRecommendations.length === 1 
            ? 'the top AI-recommended space' 
            : `the top ${topRecommendations.length} AI-recommended spaces`;
        message += `<div class="text-sm text-gray-600 mt-2">💡 These are ${recommendationText} based on your activity requirements.</div>`;
        
        addMessage(message, false);
    } catch (error) {
        console.error('Error showing AI recommendations:', error);
        addMessage('Sorry, I encountered an error while showing the AI recommendations.', false);
    }
};

// Show doctor's bookings
const showDoctorBookings = async () => {
    try {
        console.log('showDoctorBookings called, currentDoctor:', currentDoctor);
        if (!currentDoctor) {
            return prompts.conversation.doctor_required;
        }
        
        // Get all bookings
        const bookingsResponse = await apiCall('/bookings');
        if (!bookingsResponse.success) {
            return prompts.conversation.bookings_error;
        }
        
        const allBookings = bookingsResponse.data;
        
        // Filter bookings for the current doctor
        // Note: Some existing bookings might not have doctor IDs, so we'll show a message about that
        const doctorBookings = allBookings.filter(booking => 
            booking.doctorId === currentDoctor.Id || 
            booking.doctorId === currentDoctor.Id.toString() ||
            booking['Doctor ID'] === currentDoctor.Id ||
            booking['Doctor ID'] === currentDoctor.Id.toString()
        );
        
        console.log('All bookings count:', allBookings.length);
        console.log('Doctor bookings count:', doctorBookings.length);
        console.log('Current doctor ID:', currentDoctor.Id);
        console.log('Sample bookings with doctor IDs:', allBookings.filter(b => b['Doctor ID'] || b.doctorId).slice(0, 3));
        
        if (doctorBookings.length === 0) {
            return prompts.bookings.no_bookings.replace('{doctorName}', currentDoctor.Name);
        }
        
        // Get spaces data for booking details
        const spacesResponse = await apiCall('/spaces');
        const spaces = spacesResponse.success ? spacesResponse.data : [];
        
        let message = prompts.bookings.header.replace('{doctorName}', currentDoctor.Name);
        
        // Sort bookings by start time
        doctorBookings.sort((a, b) => {
            const startTimeA = a['Start Timestamp'] || a.startTime;
            const startTimeB = b['Start Timestamp'] || b.startTime;
            return new Date(startTimeA) - new Date(startTimeB);
        });
        
        // Group bookings by date
        const bookingsByDate = {};
        doctorBookings.forEach(booking => {
            const startTimestamp = booking['Start Timestamp'] || booking.startTime;
            const date = new Date(startTimestamp).toLocaleDateString();
            if (!bookingsByDate[date]) {
                bookingsByDate[date] = [];
            }
            bookingsByDate[date].push(booking);
        });
        
        // Display bookings grouped by date with improved styling
        for (const [date, bookings] of Object.entries(bookingsByDate)) {
            message += prompts.bookings.date_separator;
            message += prompts.bookings.date_header.replace('{date}', date);
            message += prompts.bookings.date_separator + '\n';
            
            bookings.forEach((booking, index) => {
                const startTimestamp = booking['Start Timestamp'] || booking.startTime;
                const endTimestamp = booking['End Timestamp'] || booking.endTime;
                const startTime = new Date(startTimestamp);
                const endTime = new Date(endTimestamp);
                const timeRange = `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                
                // Find space name
                const spaceId = booking.spaceId || booking['Space ID'];
                const space = spaces.find(s => s.Id === spaceId || s['Space ID'] === spaceId);
                const spaceName = space ? space.SpaceName : 'Unknown Space';
                
                // Get activity (handle both old and new field names)
                const activity = booking.activity || booking.Activity || 'General';
                
                // Create a styled booking card
                message += prompts.bookings.booking_card_start;
                message += prompts.bookings.time_format.replace('{timeRange}', timeRange);
                message += prompts.bookings.space_format.replace('{spaceName}', spaceName);
                message += prompts.bookings.activity_format.replace('{activity}', activity);
                if (booking.notes) {
                    message += prompts.bookings.notes_format.replace('{notes}', booking.notes);
                }
                message += prompts.bookings.booking_card_end;
            });
        }
        
        message += prompts.bookings.date_separator;
        message += prompts.bookings.summary
            .replace('{count}', doctorBookings.length)
            .replace('{plural}', doctorBookings.length !== 1 ? 's' : '');
        message += prompts.bookings.date_separator;
        
        return message;
    } catch (error) {
        console.error('Error showing doctor bookings:', error);
        return prompts.conversation.bookings_fetch_error;
    }
};

// Book a space
const bookSpace = async (spaceId, spaceName, date, time, duration, activity) => {
    try {
        // Calculate start and end times
        const startDateTime = new Date(`${date} ${time}`);
        const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 60 * 1000));
        
        const bookingData = {
            spaceId: spaceId,
            doctorId: currentDoctor?.Id || null,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            duration: duration,
            activity: activity,
            notes: `Booked via chatbot for ${activity}`
        };
        
        const response = await apiCall('/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (response.success) {
            // Clear the AI recommendations timeout since booking was successful
            if (window.aiRecommendationsTimeout) {
                clearTimeout(window.aiRecommendationsTimeout);
                window.aiRecommendationsTimeout = null;
            }
            
            const successMessage = prompts.conversation.booking_success
                .replace('{spaceName}', spaceName)
                .replace('{date}', date)
                .replace('{time}', time)
                .replace('{duration}', duration)
                .replace('{durationPlural}', duration > 1 ? 's' : '')
                .replace('{activity}', activity);
            addMessage(successMessage, false);
        } else {
            const failedMessage = prompts.conversation.booking_failed.replace('{spaceName}', spaceName);
            addMessage(failedMessage, false);
        }
    } catch (error) {
        console.error('Booking error:', error);
        const errorMessage = prompts.conversation.booking_error.replace('{spaceName}', spaceName);
        addMessage(errorMessage, false);
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
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for booking-related queries FIRST (before conversation state checks)
    const bookingKeywords = prompts.booking_keywords;
    const isBookingQuery = bookingKeywords.some(keyword => lowerMessage.includes(keyword));
    if (isBookingQuery) {
        conversationState = 'initial'; // Reset state to avoid suggestion flow
        console.log('Booking query detected:', userMessage);
        return await showDoctorBookings();
    }
    
    // Check if this is a timing response
    if (conversationState === 'timing') {
        return processBookingRequest(userSelection, userMessage, userDuration);
    }
    
    // Check if this is a duration response
    if (conversationState === 'duration') {
        return processBookingRequest(userSelection, userTiming, userMessage);
    }
    
    // Simple response generation based on keywords
    const responses = {
        'hello': prompts.responses.hello.replace('{doctorName}', doctorName).replace('{specialty}', specialty),
        'how_are_you': prompts.responses.how_are_you,
        'help': prompts.responses.help,
        'booking': prompts.responses.booking,
        'schedule': prompts.responses.schedule,
        'availability': prompts.responses.availability
    };
    
    // Check for specific keywords
    const responseKeywords = prompts.response_keywords;
    
    if (responseKeywords.hello.some(keyword => lowerMessage.includes(keyword))) {
        return responses.hello;
    } else if (responseKeywords.how_are_you.some(keyword => lowerMessage.includes(keyword))) {
        return responses.how_are_you;
    } else if (responseKeywords.help.some(keyword => lowerMessage.includes(keyword))) {
        return responses.help;
    } else if (responseKeywords.booking.some(keyword => lowerMessage.includes(keyword))) {
        return responses.booking;
    } else if (responseKeywords.schedule.some(keyword => lowerMessage.includes(keyword))) {
        return responses.schedule;
    } else if (responseKeywords.availability.some(keyword => lowerMessage.includes(keyword))) {
        return responses.availability;
    } else {
        // Default response for unrecognized queries
        return prompts.responses.default.replace('{doctorName}', doctorName);
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
            addMessage(prompts.conversation.processing_error, false);
        }
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
};

// Make functions globally available
window.bookSpace = bookSpace;
window.showAIRecommendations = showAIRecommendations;

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Load prompts first
    await loadPrompts();
    
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
        const greetingMessage = prompts.conversation.new_doctor_greeting
            .replace('{doctorName}', currentDoctor?.Name)
            .replace('{specialty}', currentDoctor?.Specialty);
        addMessage(greetingMessage, false);
        
        // Start the conversation flow
        setTimeout(() => {
            addMessage(prompts.conversation.initial_question, false, prompts.activities.options);
        }, 1000);
    });
    
    // Check server health periodically
    let healthCheckInterval = null;
    const startHealthCheck = () => {
        if (healthCheckInterval) {
            clearInterval(healthCheckInterval);
        }
        healthCheckInterval = setInterval(async () => {
            try {
                await apiCall('/health');
                const statusElement = document.querySelector('#server-status .w-2');
                const textElement = document.querySelector('#server-status span');
                if (statusElement && textElement) {
                    statusElement.className = 'w-2 h-2 bg-green-500 rounded-full mr-2';
                    textElement.textContent = 'Server Online';
                }
            } catch (error) {
                const statusElement = document.querySelector('#server-status .w-2');
                const textElement = document.querySelector('#server-status span');
                if (statusElement && textElement) {
                    statusElement.className = 'w-2 h-2 bg-red-500 rounded-full mr-2';
                    textElement.textContent = 'Server Offline';
                }
            }
        }, 60000); // Check every 60 seconds instead of 30
    };
    
    // Start health check
    startHealthCheck();
    
    // Start the conversation flow after a short delay
    setTimeout(() => {
        addMessage(prompts.conversation.initial_question, false, prompts.activities.options);
    }, 2000);
});

// Parse natural language date/time using OpenAI
const parseDateTimeWithAI = async (timing) => {
    try {
        const prompt = `Parse this natural language date/time input and return a JSON object with the following structure:
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration": number (in hours),
  "confidence": "high|medium|low"
}

Input: "${timing}"

Rules:
- If it's "tomorrow", use tomorrow's date
- If it's "today", use today's date
- If it's "next week", add 7 days to current date
- Convert 12-hour format to 24-hour format
- Handle time ranges like "2 to 4" or "14:00 to 16:00"
- Default duration is 1 hour unless specified
- Default time is 09:00 if not specified
- Use current year 2025

Examples:
- "tomorrow at 2 PM" → {"date": "2025-07-06", "time": "14:00", "duration": 1, "confidence": "high"}
- "tomorrow 14:00 to 16:00" → {"date": "2025-07-06", "time": "14:00", "duration": 2, "confidence": "high"}
- "July 15th at 3 PM" → {"date": "2025-07-15", "time": "15:00", "duration": 1, "confidence": "high"}

Return only the JSON object, no additional text.`;

        const response = await fetch('/api/openai/parse-datetime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                userInput: timing
            })
        });

        if (!response.ok) {
            throw new Error('Failed to parse date/time with AI');
        }

        const data = await response.json();
        
        if (data.success && data.parsedData) {
            return data.parsedData;
        } else {
            throw new Error(data.error || 'Failed to parse date/time');
        }
    } catch (error) {
        console.error('Error parsing date/time with AI:', error);
        // Fallback to manual parsing
        return parseDateTimeManually(timing);
    }
};

// Manual fallback parsing (existing logic)
const parseDateTimeManually = (timing) => {
    let date, time, duration = 1;
    const timingLower = timing.toLowerCase();
    
    if (timingLower.includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        date = tomorrow.toISOString().split('T')[0];
        
        // Handle time ranges like "tomorrow from 2 to 4"
        const timeRangeMatch = timing.match(/from\s+(\d+)\s*(?:to|-)\s*(\d+)/i);
        if (timeRangeMatch) {
            let startHour = parseInt(timeRangeMatch[1]);
            let endHour = parseInt(timeRangeMatch[2]);
            
            // Assume PM if not specified and hour is 1-12
            if (startHour >= 1 && startHour <= 12) {
                startHour += 12; // Convert to 24-hour format
            }
            if (endHour >= 1 && endHour <= 12) {
                endHour += 12; // Convert to 24-hour format
            }
            
            // Use start time and calculate duration
            time = `${startHour.toString().padStart(2, '0')}:00`;
            duration = endHour - startHour;
        }
        // Extract time from "tomorrow at 2 PM" format
        else if (timingLower.includes('at')) {
            const timeMatch = timing.match(/at\s+(\d+)\s*(am|pm)/i);
            if (timeMatch) {
                let hour = parseInt(timeMatch[1]);
                const ampm = timeMatch[2].toLowerCase();
                if (ampm === 'pm' && hour !== 12) hour += 12;
                if (ampm === 'am' && hour === 12) hour = 0;
                time = `${hour.toString().padStart(2, '0')}:00`;
            } else {
                time = '09:00'; // Default time
            }
        } else {
            time = '09:00'; // Default time
        }
    } else if (timing.includes('2025-')) {
        const parts = timing.split(' ');
        date = parts[0];
        time = parts[1] || '09:00';
    } else {
        // Try to parse other formats like "July 15th at 2 PM"
        const dateMatch = timing.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?/i);
        if (dateMatch) {
            const month = dateMatch[1];
            const day = dateMatch[2];
            const monthIndex = ['january', 'february', 'march', 'april', 'may', 'june', 
                               'july', 'august', 'september', 'october', 'november', 'december']
                               .indexOf(month.toLowerCase());
            if (monthIndex !== -1) {
                date = `2025-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else {
                date = new Date().toISOString().split('T')[0];
            }
        } else {
            date = new Date().toISOString().split('T')[0];
        }
        
        // Extract time
        const timeMatch = timing.match(/(\d+):?(\d*)\s*(am|pm)/i);
        if (timeMatch) {
            let hour = parseInt(timeMatch[1]);
            const minutes = timeMatch[2] || '00';
            const ampm = timeMatch[3].toLowerCase();
            if (ampm === 'pm' && hour !== 12) hour += 12;
            if (ampm === 'am' && hour === 12) hour = 0;
            time = `${hour.toString().padStart(2, '0')}:${minutes}`;
        } else {
            time = '09:00';
        }
    }
    
    return { date, time, duration, confidence: 'low' };
};