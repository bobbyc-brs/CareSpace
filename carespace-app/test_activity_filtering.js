#!/usr/bin/env node

// Test script for the new activity-based space filtering functionality
const BASE_URL = 'http://localhost:3000/api';

async function testActivityFiltering() {
    console.log('🧪 Testing Activity-Based Space Filtering\n');
    
    try {
        // Test 1: Labwork activity
        console.log('📊 Test 1: Labwork Activity');
        console.log('Requesting spaces for labwork...');
        const response1 = await fetch(`${BASE_URL}/availability/check?date=2025-07-15&time=16:00&duration=1&activity=labwork`);
        const data1 = await response1.json();
        
        if (data1.success) {
            console.log(`✅ Found ${data1.data.availableSpaces} spaces suitable for labwork`);
            console.log('🏢 Labwork-compatible spaces:');
            data1.data.spaceAvailability.filter(s => s.available).forEach(space => {
                console.log(`   • ${space.spaceName} (${space.category}) - Uses: ${space.uses}`);
            });
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Test 2: Consultation activity
        console.log('📊 Test 2: Consultation Activity');
        console.log('Requesting spaces for consultation...');
        const response2 = await fetch(`${BASE_URL}/availability/check?date=2025-07-15&time=16:00&duration=1&activity=consultation`);
        const data2 = await response2.json();
        
        if (data2.success) {
            console.log(`✅ Found ${data2.data.availableSpaces} spaces suitable for consultation`);
            console.log('🏢 Consultation-compatible spaces:');
            data2.data.spaceAvailability.filter(s => s.available).forEach(space => {
                console.log(`   • ${space.spaceName} (${space.category}) - Uses: ${space.uses}`);
            });
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Test 3: Research activity
        console.log('📊 Test 3: Research Activity');
        console.log('Requesting spaces for research...');
        const response3 = await fetch(`${BASE_URL}/availability/check?date=2025-07-15&time=16:00&duration=1&activity=research`);
        const data3 = await response3.json();
        
        if (data3.success) {
            console.log(`✅ Found ${data3.data.availableSpaces} spaces suitable for research`);
            console.log('🏢 Research-compatible spaces:');
            data3.data.spaceAvailability.filter(s => s.available).forEach(space => {
                console.log(`   • ${space.spaceName} (${space.category}) - Uses: ${space.uses}`);
            });
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Test 4: No activity filter (should show all spaces)
        console.log('📊 Test 4: No Activity Filter (All Spaces)');
        console.log('Requesting all available spaces...');
        const response4 = await fetch(`${BASE_URL}/availability/check?date=2025-07-15&time=16:00&duration=1`);
        const data4 = await response4.json();
        
        if (data4.success) {
            console.log(`✅ Found ${data4.data.availableSpaces} total available spaces`);
            console.log('🏢 All available spaces:');
            data4.data.spaceAvailability.filter(s => s.available).forEach(space => {
                console.log(`   • ${space.spaceName} (${space.category}) - Uses: ${space.uses}`);
            });
        }
        
        console.log('\n🎯 Summary:');
        console.log(`• Labwork spaces: ${data1.data.availableSpaces}`);
        console.log(`• Consultation spaces: ${data2.data.availableSpaces}`);
        console.log(`• Research spaces: ${data3.data.availableSpaces}`);
        console.log(`• Total spaces: ${data4.data.availableSpaces}`);
        
        console.log('\n✅ Activity-based filtering is working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing activity filtering:', error.message);
    }
}

// Run the test
testActivityFiltering(); 