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
        
        // Map activity to specialty
        let specialty = 'General Medicine';
        if (activity.toLowerCase().includes('labwork')) {
            specialty = 'Research';
        } else if (activity.toLowerCase().includes('consultation')) {
            specialty = 'Pediatric';
        } else if (activity.toLowerCase().includes('research')) {
            specialty = 'Research';
        }
        
        // Use the new availability check endpoint with activity filtering
        const response = await fetch(`/api/availability/check?date=${date}&time=${time}&duration=${duration || 1}&specialty=${specialty}&activity=${encodeURIComponent(activity)}`);
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
        
        let message = `Here are the available options for **${activity}** on **${date}** at **${timeDisplay}** (${duration || 1} hour${parseInt(duration) > 1 ? 's' : ''}):\n\n`;

        // Show only available doctors in table format
        const availableDoctors = availability.doctorAvailability.filter(d => d.available);
        if (availableDoctors.length > 0) {
            message += `👨‍⚕️ **Available Doctors:**\n\n`;
            message += `| Doctor Name | Specialty |\n`;
            message += `|-------------|-----------|\n`;
            availableDoctors.forEach(doctor => {
                message += `| **${doctor.doctorName}** | ${doctor.specialty} |\n`;
            });
            message += `\n`;
        }

        // Show only available spaces in a styled HTML table with booking buttons
        const availableSpaces = availability.spaceAvailability.filter(s => s.available);
        if (availableSpaces.length > 0) {
            message += `🏢 <b>Available Spaces:</b><br/>`;
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
<button onclick="bookSpace('${space.spaceId}', '${space.spaceName}', '${date}', '${time}', ${duration || 1}, '${activity}')" 
class="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition-colors">
📅 Book
</button>
</td>
</tr>`;
            });
            table += `</tbody></table></div>`;
            message += table;
        }

        // Show optimal matches in table format
        if (availability.optimalMatches.length > 0) {
            message += `🎯 **Optimal Matches:**\n\n`;
            message += `| Doctor | Space |\n`;
            message += `|--------|-------|\n`;
            availability.optimalMatches.forEach(match => {
                message += `| **${match.doctor.doctorName}** | **${match.space.spaceName}** |\n`;
            });
            message += `\nWould you like to book any of these?`;
        } else if (availableSpaces.length === 0) {
            message += `❌ **No available spaces found** for your requested time.\n`;
            message += `💡 Try a different time, date, or activity.\n`;
        }

        // Show summary (optional, can be commented out)
        // message += `\n📊 **Summary:**\n`;
        // message += `• Available Doctors: ${availableDoctors.length}\n`;
        // message += `• Available Spaces: ${availableSpaces.length}\n`;
        // message += `• Optimal Matches: ${availability.optimalMatches.length}\n`;

        return message;
    } catch (error) {
        console.error('Error processing booking request:', error);
        return `Sorry, I encountered an error while processing your request: ${error.message}`;
    }
};

// Show doctor's bookings
const showDoctorBookings = async () => {
    try {
        console.log('showDoctorBookings called, currentDoctor:', currentDoctor);
        if (!currentDoctor) {
            return "I'm sorry, but I need to know which doctor you are to show your bookings. Please select a doctor first.";
        }
        
        // Get all bookings
        const bookingsResponse = await apiCall('/bookings');
        if (!bookingsResponse.success) {
            return "Sorry, I couldn't retrieve your bookings at the moment. Please try again later.";
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
            return `📅 **Your Schedule - ${currentDoctor.Name}**\n\nYou don't have any bookings scheduled at the moment. This could be because:\n\n• You haven't made any bookings yet\n• Your existing bookings weren't assigned to a specific doctor\n• You're a new doctor in the system\n\nWould you like to make a new booking? I can help you find available spaces and schedule appointments.`;
        }
        
        // Get spaces data for booking details
        const spacesResponse = await apiCall('/spaces');
        const spaces = spacesResponse.success ? spacesResponse.data : [];
        
        let message = `📅 **Your Schedule - ${currentDoctor.Name}**\n\nHere are your upcoming bookings:\n\n`;
        
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
        
        // Display bookings grouped by date
        for (const [date, bookings] of Object.entries(bookingsByDate)) {
            message += `**📆 ${date}**\n`;
            
            bookings.forEach(booking => {
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
                
                message += `• ⏰ **${timeRange}** - ${spaceName}\n`;
                message += `  🎯 Activity: ${activity}\n`;
                if (booking.notes) {
                    message += `  📝 Notes: ${booking.notes}\n`;
                }
                message += `\n`;
            });
        }
        
        message += `\n💡 **Total Bookings:** ${doctorBookings.length}`;
        
        return message;
    } catch (error) {
        console.error('Error showing doctor bookings:', error);
        return "Sorry, I encountered an error while retrieving your bookings. Please try again later.";
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
            addMessage(`✅ **Booking Confirmed!**\n\n📅 **Space:** ${spaceName}\n📆 **Date:** ${date}\n⏰ **Time:** ${time}\n⏱️ **Duration:** ${duration} hour${duration > 1 ? 's' : ''}\n🎯 **Activity:** ${activity}\n\nYour booking has been successfully created!`, false);
        } else {
            addMessage(`❌ **Booking Failed**\n\nSorry, I couldn't book ${spaceName} for you. Please try again or contact support.`, false);
        }
    } catch (error) {
        console.error('Booking error:', error);
        addMessage(`❌ **Booking Error**\n\nSorry, there was an error while booking ${spaceName}. Please try again later.`, false);
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
    if (lowerMessage.includes('my booking') || lowerMessage.includes('my bookings') || 
        lowerMessage.includes('show my booking') || lowerMessage.includes('show my bookings') ||
        lowerMessage.includes('my schedule') || lowerMessage.includes('my appointments') ||
        lowerMessage.includes('my calendar') || lowerMessage.includes('what do i have') ||
        lowerMessage.includes('when am i') || lowerMessage.includes('my meetings') ||
        lowerMessage.includes('show me my booking') || lowerMessage.includes('show me my bookings') ||
        lowerMessage.includes('what are my bookings') || lowerMessage.includes('what are my appointments') ||
        lowerMessage.includes('my schedule') || lowerMessage.includes('my meetings')) {
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
        'hello': `Hello! I'm ${doctorName}, a ${specialty}. How can I help you today?`,
        'how are you': `I'm doing well, thank you for asking! How can I assist you today?`,
        'help': `I'm here to help you with booking spaces, checking availability, and managing your schedule. What would you like to do?`,
        'booking': `I can help you book spaces for your activities. What type of activity do you need to do?`,
        'schedule': `I can help you check your schedule and manage your bookings. Would you like to see your current bookings?`,
        'availability': `I can check space availability for you. What type of activity and when do you need it?`
    };
    
    // Check for specific keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return responses.hello;
    } else if (lowerMessage.includes('how are you')) {
        return responses['how are you'];
    } else if (lowerMessage.includes('help')) {
        return responses.help;
    } else if (lowerMessage.includes('booking') || lowerMessage.includes('book')) {
        return responses.booking;
    } else if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
        return responses.schedule;
    } else if (lowerMessage.includes('availability') || lowerMessage.includes('available')) {
        return responses.availability;
    } else {
        // Default response for unrecognized queries
        return `I'm ${doctorName}, and I'm here to help you with space bookings and scheduling. You can ask me about:\n\n• Booking spaces for activities\n• Checking your schedule\n• Finding available spaces\n• Managing your appointments\n\nWhat would you like to do?`;
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

// Make bookSpace function globally available
window.bookSpace = bookSpace;

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