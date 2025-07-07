const fetch = require('node-fetch');

// Test cases for natural language date/time parsing
const testCases = [
    "tomorrow at 2 PM",
    "tomorrow 14:00 to 16:00",
    "July 15th at 3 PM",
    "next Monday at 9 AM",
    "today at 5 PM",
    "tomorrow from 10 to 12",
    "2025-07-20 15:30"
];

async function testOpenAIParsing() {
    console.log('🤖 Testing OpenAI Natural Language Date/Time Parsing\n');
    
    for (const testCase of testCases) {
        try {
            console.log(`📝 Testing: "${testCase}"`);
            
            const response = await fetch('http://localhost:3000/api/openai/parse-datetime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `Parse this natural language date/time input and return a JSON object with the following structure:
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration": number (in hours),
  "confidence": "high|medium|low"
}

Input: "${testCase}"

Rules:
- If it's "tomorrow", use tomorrow's date
- If it's "today", use today's date
- If it's "next week", add 7 days to current date
- Convert 12-hour format to 24-hour format
- Handle time ranges like "2 to 4" or "14:00 to 16:00"
- Default duration is 1 hour unless specified
- Default time is 09:00 if not specified
- Use current year 2025

Return only the JSON object, no additional text.`,
                    userInput: testCase
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const { date, time, duration, confidence } = data.parsedData;
                console.log(`✅ Parsed successfully:`);
                console.log(`   📅 Date: ${date}`);
                console.log(`   ⏰ Time: ${time}`);
                console.log(`   ⏱️ Duration: ${duration} hour(s)`);
                console.log(`   🎯 Confidence: ${confidence}`);
            } else {
                console.log(`❌ Failed: ${data.error}`);
                console.log(`   💡 Message: ${data.message}`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
}

// Test the availability check with parsed data
async function testAvailabilityWithParsedData() {
    console.log('🔍 Testing Availability Check with Parsed Data\n');
    
    const testInput = "tomorrow 14:00 to 16:00";
    
    try {
        // First, parse the natural language input
        const parseResponse = await fetch('http://localhost:3000/api/openai/parse-datetime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Parse this natural language date/time input and return a JSON object with the following structure:
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration": number (in hours),
  "confidence": "high|medium|low"
}

Input: "${testInput}"

Rules:
- If it's "tomorrow", use tomorrow's date
- Convert 12-hour format to 24-hour format
- Handle time ranges like "2 to 4" or "14:00 to 16:00"
- Default duration is 1 hour unless specified
- Use current year 2025

Return only the JSON object, no additional text.`,
                userInput: testInput
            })
        });
        
        const parseData = await parseResponse.json();
        
        if (parseData.success) {
            const { date, time, duration } = parseData.parsedData;
            
            console.log(`📝 Parsed "${testInput}" to:`);
            console.log(`   📅 Date: ${date}`);
            console.log(`   ⏰ Time: ${time}`);
            console.log(`   ⏱️ Duration: ${duration} hour(s)`);
            
            // Now check availability with the parsed data
            const availabilityResponse = await fetch(`http://localhost:3000/api/availability/check?date=${date}&time=${time}&duration=${duration}&specialty=General Medicine&activity=Lab work`);
            const availabilityData = await availabilityResponse.json();
            
            if (availabilityData.success) {
                const { doctorAvailability, spaceAvailability, optimalMatches } = availabilityData.data;
                
                console.log(`\n🔍 Availability Results:`);
                console.log(`   👨‍⚕️ Available Doctors: ${doctorAvailability.filter(d => d.available).length}`);
                console.log(`   🏢 Available Spaces: ${spaceAvailability.filter(s => s.available).length}`);
                console.log(`   🎯 Optimal Matches: ${optimalMatches.length}`);
                
                if (spaceAvailability.filter(s => s.available).length > 0) {
                    console.log(`\n📋 Available Spaces:`);
                    spaceAvailability.filter(s => s.available).slice(0, 3).forEach(space => {
                        console.log(`   • ${space.spaceName} (${space.category})`);
                    });
                }
            } else {
                console.log(`❌ Availability check failed: ${availabilityData.error}`);
            }
        } else {
            console.log(`❌ Parsing failed: ${parseData.error}`);
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Run the tests
async function runTests() {
    console.log('🚀 Starting OpenAI Integration Tests\n');
    console.log('=' .repeat(50));
    
    await testOpenAIParsing();
    console.log('=' .repeat(50));
    await testAvailabilityWithParsedData();
    
    console.log('\n✅ Tests completed!');
    console.log('\n💡 To use this in the chatbot:');
    console.log('   1. Set your OpenAI API key in the .env file');
    console.log('   2. Restart the server');
    console.log('   3. Try natural language inputs like "tomorrow at 2 PM"');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testOpenAIParsing, testAvailabilityWithParsedData }; 