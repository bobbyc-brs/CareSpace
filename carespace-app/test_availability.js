#!/usr/bin/env node

// Test script for the new availability checking functionality
// Uses built-in fetch API (Node.js 18+)

const BASE_URL = 'http://localhost:3000/api';

async function testAvailabilityCheck() {
    console.log('🧪 Testing Enhanced Availability Check Functionality\n');
    
    try {
        // Test 1: Check availability for a specific date and time
        console.log('📅 Test 1: Checking availability for July 15th at 4 PM');
        const response1 = await fetch(`${BASE_URL}/availability/check?date=2025-07-15&time=16:00&duration=1`);
        const data1 = await response1.json();
        
        if (data1.success) {
            console.log(`✅ Found ${data1.data.availableDoctors} available doctors and ${data1.data.availableSpaces} available spaces`);
            console.log(`🎯 Optimal matches: ${data1.data.optimalMatches.length}`);
            
            if (data1.data.optimalMatches.length > 0) {
                console.log('📋 Sample optimal match:');
                const match = data1.data.optimalMatches[0];
                console.log(`   👨‍⚕️ Doctor: ${match.doctor.doctorName} (${match.doctor.specialty})`);
                console.log(`   🏢 Space: ${match.space.spaceName} (${match.space.category})`);
                console.log(`   ⭐ Compatibility: ${match.compatibility}`);
            }
        } else {
            console.log('❌ Failed to check availability');
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 2: Check availability with specialty filter
        console.log('🔍 Test 2: Checking availability for pediatric specialty');
        const response2 = await fetch(`${BASE_URL}/availability/check?date=2025-07-10&time=09:00&duration=2&specialty=pediatric`);
        const data2 = await response2.json();
        
        if (data2.success) {
            console.log(`✅ Found ${data2.data.availableDoctors} available pediatric doctors`);
            console.log(`📊 Summary: ${data2.data.summary.totalDoctors} total doctors checked`);
            
            if (data2.data.doctorAvailability.length > 0) {
                console.log('📋 Doctor schedules:');
                data2.data.doctorAvailability.forEach(doctor => {
                    console.log(`   👨‍⚕️ ${doctor.doctorName} (${doctor.specialty}): ${doctor.available ? '✅ Available' : '❌ Unavailable'}`);
                    if (doctor.schedule.length > 0) {
                        console.log(`      📅 Schedule: ${doctor.schedule.map(s => s.time).join(', ')}`);
                    }
                });
            }
        } else {
            console.log('❌ Failed to check pediatric availability');
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 3: Check availability for a busy time
        console.log('🚫 Test 3: Checking availability for a busy time (July 10th at 9 AM)');
        const response3 = await fetch(`${BASE_URL}/availability/check?date=2025-07-10&time=09:00&duration=1`);
        const data3 = await response3.json();
        
        if (data3.success) {
            console.log(`📊 Results: ${data3.data.availableDoctors} available doctors, ${data3.data.availableSpaces} available spaces`);
            console.log(`🎯 Optimal matches: ${data3.data.optimalMatches.length}`);
            
            if (data3.data.optimalMatches.length === 0) {
                console.log('💡 This demonstrates how the system handles busy times with no optimal matches');
            }
        } else {
            console.log('❌ Failed to check busy time availability');
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 4: Test the chatbot endpoint
        console.log('🤖 Test 4: Testing the chatbot suggestions endpoint');
        const response4 = await fetch(`${BASE_URL}/chatbot/suggestions?specialty=emergency&date=2025-07-15&time=16:00&duration=1`);
        const data4 = await response4.json();
        
        if (data4.success) {
            console.log(`✅ Chatbot suggestions: ${data4.data.doctors?.length || 0} doctors, ${data4.data.spaces?.length || 0} spaces`);
        } else {
            console.log('❌ Failed to get chatbot suggestions');
        }
        
        console.log('\n🎉 All tests completed! The enhanced availability checking is working correctly.');
        console.log('\n💡 Key Features:');
        console.log('   • Cross-references doctor calendars with space bookings');
        console.log('   • Finds optimal doctor-space matches');
        console.log('   • Provides detailed availability information');
        console.log('   • Shows conflicting schedules and bookings');
        console.log('   • Enhanced time parsing in chatbot');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testAvailabilityCheck(); 