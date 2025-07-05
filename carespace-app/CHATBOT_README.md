# Doctor Chatbot Feature

## Overview

The Doctor Chatbot is an AI-powered medical consultation interface that allows users to interact with virtual doctors from the CareSpace system. The chatbot randomly selects a doctor from the available medical staff and provides contextual responses based on the doctor's specialty.

## Features

### 🎯 **Random Doctor Selection**
- Automatically selects a random doctor from the system
- Displays doctor's profile including name, specialty, and contact information
- Shows office status and availability information

### 💬 **Interactive Chat Interface**
- Real-time chat with typing indicators and option buttons
- Structured conversation flow for space booking
- Professional medical disclaimers and safety warnings

### 🏥 **Booking-Focused Responses**
- Labwork: Recommends research and laboratory spaces
- Patient Consultation: Recommends clinical and consultation spaces
- Research: Recommends research and educational spaces
- Automatic space availability checking
- Doctor and space recommendations based on needs

### 🔄 **Dynamic Doctor Switching**
- "Get New Doctor" button to switch to a different specialist
- Maintains chat history while changing doctors
- Seamless transition between different medical perspectives

## How to Use

### Accessing the Chatbot
1. Navigate to the main dashboard at `http://localhost:3000`
2. Click the "Chatbot" link in the header
3. Or directly visit `http://localhost:3000/chatbot.html`

### Starting a Conversation
1. The system automatically loads a random doctor
2. Review the doctor's profile on the left panel
3. The chatbot will ask "What do you need to do today?"
4. Select from the provided options: Labwork, Patient Consultation, or Research
5. Specify when you need the space (date and time)
6. The chatbot will provide recommendations based on your needs

### Conversation Flow
1. **Initial Question**: "What do you need to do today?"
   - 🔬 Labwork
   - 👥 Patient Consultation  
   - 📚 Research

2. **Timing Question**: "When do you need the space?"
   - Enter date and time (e.g., "2025-07-15 14:00" or "tomorrow at 2 PM")

3. **Recommendations**: The chatbot will provide:
   - Available doctors matching your needs
   - Available spaces in appropriate categories
   - Booking suggestions

### Switching Doctors
1. Click the "Get New Doctor" button
2. A new random doctor will be selected
3. The conversation flow will restart with the new doctor

## Supported Topics

### General Health Questions
- Symptoms and their potential causes
- General health advice and information
- Appointment preparation guidance
- Medication information (general only)

### Specialty-Specific Topics
- **Pediatric**: Children's health, development, and care
- **Cardiology**: Heart health, cardiovascular conditions
- **Emergency Medicine**: Urgent care, emergency situations
- **Anesthesiology**: Surgical procedures, anesthesia
- **Oncology**: Cancer information and treatment options
- **Neurology**: Brain and nervous system conditions

## Safety Features

### ⚠️ **Medical Disclaimers**
- All responses include appropriate medical disclaimers
- Users are reminded that this is for informational purposes only
- Emergency situations are handled with appropriate warnings

### 🚨 **Emergency Handling**
- Automatic detection of emergency-related keywords
- Clear instructions to call emergency services
- Emphasis on seeking professional medical care

### 💊 **Medication Safety**
- No specific medication recommendations
- General information only
- Directs users to healthcare providers for prescriptions

## Technical Implementation

### Frontend Components
- **chatbot.html**: Main interface with responsive design
- **chatbot.js**: Interactive functionality and AI logic
- Tailwind CSS for modern styling
- Font Awesome icons for visual elements

### Backend Integration
- Connects to existing `/api/doctors` endpoint
- Loads real doctor data from CSV files
- Maintains chat history and session state

### AI Response System
- Keyword-based response generation
- Specialty-specific contextual responses
- Simulated typing delays for realistic interaction
- Fallback responses for unrecognized queries

## File Structure

```
public/
├── chatbot.html          # Main chatbot interface
├── chatbot.js           # Chatbot functionality
└── index.html           # Updated with chatbot link

data/
├── Doctors.csv          # Doctor data source
├── Spaces.csv           # Space information
└── SpaceBookings.csv    # Booking data
```

## API Endpoints Used

- `GET /api/doctors` - Load all available doctors
- `GET /api/health` - Server health monitoring

## Browser Compatibility

- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Real-time updates and smooth animations

## Future Enhancements

### Potential Improvements
- Integration with real AI/ML models
- Voice input and output capabilities
- Multi-language support
- Appointment booking integration
- Medical record integration (with proper security)
- Video consultation simulation

### Advanced Features
- Symptom checker with decision trees
- Medical image analysis
- Prescription drug interaction checking
- Telemedicine integration
- Patient education materials

## Security and Privacy

### Current Implementation
- Client-side only (no data persistence)
- No personal health information stored
- Educational purpose only

### Recommended for Production
- HIPAA compliance measures
- Secure data transmission
- User authentication and authorization
- Audit logging
- Data encryption

## Usage Guidelines

### For Users
- Use for general health information only
- Consult healthcare providers for specific medical advice
- Call emergency services for urgent situations
- Don't share personal health information

### For Developers
- Maintain medical disclaimers
- Update specialty responses as needed
- Monitor for inappropriate content
- Regular security reviews

## Testing

### Manual Testing
1. Load the chatbot page
2. Verify random doctor selection
3. Test various medical queries
4. Switch between doctors
5. Check emergency response handling

### Automated Testing
- API endpoint testing
- Frontend functionality testing
- Response generation testing
- Cross-browser compatibility

## Support

For technical issues or questions about the chatbot implementation, please refer to the main project documentation or create an issue in the project repository. 