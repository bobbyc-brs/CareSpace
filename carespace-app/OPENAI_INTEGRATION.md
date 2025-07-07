# OpenAI Integration for Natural Language Date/Time Parsing

## Overview

The CareSpace chatbot now supports natural language date/time input processing using OpenAI's GPT-3.5-turbo model. This allows users to input dates and times in natural language (e.g., "tomorrow at 2 PM", "July 15th at 3 PM") and have them automatically parsed into structured data for space booking.

## Features

### ✅ Natural Language Processing
- **Flexible Input Formats**: Accepts various natural language formats
- **Time Range Support**: Handles ranges like "tomorrow 14:00 to 16:00"
- **Relative Dates**: Supports "tomorrow", "today", "next Monday", etc.
- **12/24 Hour Format**: Automatically converts between formats
- **Duration Calculation**: Automatically calculates duration from time ranges

### ✅ Fallback System
- **Manual Parsing**: Falls back to manual parsing if OpenAI is unavailable
- **Error Handling**: Graceful error handling for API failures
- **No API Key Required**: Works without OpenAI API key (uses manual parsing)

### ✅ Integration with Existing System
- **Seamless Integration**: Works with existing chatbot flow
- **Availability Checking**: Parsed data is used for space availability checks
- **Booking System**: Integrated with the booking system

## Supported Input Formats

| Input Example | Parsed Result |
|---------------|---------------|
| `"tomorrow at 2 PM"` | Date: tomorrow, Time: 14:00, Duration: 1 hour |
| `"tomorrow 14:00 to 16:00"` | Date: tomorrow, Time: 14:00, Duration: 2 hours |
| `"July 15th at 3 PM"` | Date: 2025-07-15, Time: 15:00, Duration: 1 hour |
| `"next Monday at 9 AM"` | Date: next Monday, Time: 09:00, Duration: 1 hour |
| `"today at 5 PM"` | Date: today, Time: 17:00, Duration: 1 hour |
| `"2025-07-20 15:30"` | Date: 2025-07-20, Time: 15:30, Duration: 1 hour |

## Technical Implementation

### Frontend (chatbot.js)

```javascript
// Parse natural language date/time using OpenAI
const parseDateTimeWithAI = async (timing) => {
    try {
        const response = await fetch('/api/openai/parse-datetime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, userInput: timing })
        });
        
        const data = await response.json();
        return data.parsedData;
    } catch (error) {
        // Fallback to manual parsing
        return parseDateTimeManually(timing);
    }
};
```

### Backend (server.js)

```javascript
// OpenAI API endpoint
app.post('/api/openai/parse-datetime', async (req, res) => {
    const { prompt, userInput } = req.body;
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Parse natural language date/time...' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 200
        })
    });
    
    // Parse and validate response
    const data = await response.json();
    const parsedData = JSON.parse(data.choices[0].message.content);
    
    res.json({ success: true, parsedData });
});
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# OpenAI API Configuration (Optional)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Install Dependencies

```bash
npm install node-fetch@2
```

### 3. Restart Server

```bash
npm start
```

## Usage Examples

### In the Chatbot

1. **Start a booking conversation**
2. **Select an activity** (e.g., "Lab work")
3. **Enter natural language timing**:
   - `"tomorrow at 2 PM"`
   - `"July 15th at 3 PM"`
   - `"tomorrow 14:00 to 16:00"`
4. **System automatically parses** and shows available spaces

### API Testing

Test the parsing endpoint directly:

```bash
curl -X POST http://localhost:3000/api/openai/parse-datetime \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Parse this natural language date/time input...",
    "userInput": "tomorrow at 2 PM"
  }'
```

## Error Handling

### OpenAI API Unavailable
- Falls back to manual parsing
- Continues to work without API key
- Logs errors for debugging

### Invalid Input
- Returns structured error messages
- Suggests alternative formats
- Maintains chatbot flow

### Network Issues
- Graceful timeout handling
- Automatic retry with manual parsing
- User-friendly error messages

## Benefits

### For Users
- **Natural Interaction**: No need to learn specific date formats
- **Faster Booking**: Quicker input process
- **Flexible Input**: Multiple ways to express the same time
- **Error Reduction**: Less chance of input errors

### For Developers
- **Maintainable Code**: Clean separation of concerns
- **Extensible**: Easy to add new parsing rules
- **Robust**: Fallback system ensures reliability
- **Testable**: Comprehensive test coverage

## Testing

Run the comprehensive test suite:

```bash
node test_openai_integration.js
```

This will test:
- Various input formats
- Error handling
- Integration with availability checking
- Fallback functionality

## Future Enhancements

### Potential Improvements
1. **More Date Formats**: Support for "next week", "in 2 days", etc.
2. **Time Zone Support**: Handle different time zones
3. **Recurring Bookings**: Support for weekly/monthly patterns
4. **Context Awareness**: Remember previous booking patterns
5. **Multi-language Support**: Parse dates in different languages

### Performance Optimizations
1. **Caching**: Cache common date/time patterns
2. **Batch Processing**: Handle multiple requests efficiently
3. **Response Optimization**: Reduce API call costs

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Set `OPENAI_API_KEY` in your `.env` file
   - Restart the server

2. **"Failed to parse date/time with AI"**
   - Check your internet connection
   - Verify OpenAI API key is valid
   - System will fall back to manual parsing

3. **"Invalid JSON response from AI"**
   - Usually indicates API rate limiting
   - Wait a moment and try again
   - System will use manual parsing as fallback

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
DEBUG=openai:*
```

## Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **Input Validation**: All user inputs are validated
3. **Rate Limiting**: Consider implementing rate limiting for API calls
4. **Error Logging**: Sensitive information is not logged

## Cost Considerations

- **OpenAI API Costs**: ~$0.002 per 1K tokens
- **Typical Usage**: ~100 tokens per date/time parsing
- **Estimated Cost**: ~$0.0002 per parsing request
- **Fallback Option**: Manual parsing is free

## Support

For issues or questions:
1. Check the test suite: `node test_openai_integration.js`
2. Review server logs for error details
3. Verify environment configuration
4. Test with manual parsing fallback 