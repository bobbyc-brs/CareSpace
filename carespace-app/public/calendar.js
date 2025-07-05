// API Base URL
const API_BASE = '/api';

// Global state
let currentDate = new Date();
let bookings = [];
let spaces = [];
let selectedCategory = '';

// Utility functions
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getCategoryClass = (category) => {
    const categoryMap = {
        'Clinical': 'booking-clinical',
        'Education': 'booking-education',
        'Admin': 'booking-admin',
        'Research': 'booking-research',
        'Public': 'booking-public',
        'Surgical': 'booking-surgical',
        'Diagnostic': 'booking-diagnostic',
        'Support': 'booking-support'
    };
    return categoryMap[category] || 'booking-admin';
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
        throw error;
    }
};

// Load bookings and spaces
const loadData = async () => {
    try {
        const [bookingsResponse, spacesResponse] = await Promise.all([
            apiCall('/bookings'),
            apiCall('/spaces')
        ]);
        
        bookings = bookingsResponse.data || bookingsResponse;
        spaces = spacesResponse.data || spacesResponse;
        
        renderCalendar();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
};

// Calendar functions
const getMonthData = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    return days;
};

const getBookingsForDate = (date) => {
    const dateStr = formatDate(date);
    return bookings.filter(booking => booking.Date === dateStr);
};

const renderCalendar = () => {
    const monthData = getMonthData(currentDate);
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    
    // Update month display
    currentMonthElement.textContent = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Generate calendar days
    monthData.forEach(date => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const isOtherMonth = date.getMonth() !== currentDate.getMonth();
        const isToday = formatDate(date) === formatDate(new Date());
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'text-sm font-medium mb-2';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        // Bookings for this day
        const dayBookings = getBookingsForDate(date);
        const filteredBookings = selectedCategory 
            ? dayBookings.filter(booking => {
                const space = spaces.find(s => s['Space ID'] === booking['Space ID']);
                return space && space.Category === selectedCategory;
            })
            : dayBookings;
        
        filteredBookings.forEach(booking => {
            const space = spaces.find(s => s['Space ID'] === booking['Space ID']);
            if (!space) return;
            
            const bookingElement = document.createElement('div');
            bookingElement.className = `booking-item ${getCategoryClass(space.Category)}`;
            bookingElement.textContent = `${space.Name} (${formatTime(booking['Start Timestamp'])}-${formatTime(booking['End Timestamp'])})`;
            bookingElement.onclick = () => showBookingDetails(booking, space);
            dayElement.appendChild(bookingElement);
        });
        
        calendarGrid.appendChild(dayElement);
    });
};

// Modal functions
const showBookingDetails = (booking, space) => {
    const modal = document.getElementById('booking-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = `Booking: ${space.Name}`;
    
    const startTime = formatTime(booking['Start Timestamp']);
    const endTime = formatTime(booking['End Timestamp']);
    const duration = booking['Duration (hours)'];
    
    modalContent.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold text-gray-900">Space Details</h4>
                    <p class="text-sm text-gray-600">Name: ${space.Name}</p>
                    <p class="text-sm text-gray-600">Category: ${space.Category}</p>
                    <p class="text-sm text-gray-600">Capacity: ${space['Capacity (people)']} people</p>
                    <p class="text-sm text-gray-600">Area: ${space['Area (sqm)']} sqm</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">Booking Details</h4>
                    <p class="text-sm text-gray-600">Date: ${booking.Date}</p>
                    <p class="text-sm text-gray-600">Time: ${startTime} - ${endTime}</p>
                    <p class="text-sm text-gray-600">Duration: ${duration} hours</p>
                </div>
            </div>
            
            ${space['Specialized Equipment'] && space['Specialized Equipment'] !== 'None' ? `
                <div>
                    <h4 class="font-semibold text-gray-900">Equipment</h4>
                    <p class="text-sm text-gray-600">${space['Specialized Equipment']}</p>
                </div>
            ` : ''}
            
            ${space['Conference Equip.'] && space['Conference Equip.'] !== 'None' ? `
                <div>
                    <h4 class="font-semibold text-gray-900">Conference Equipment</h4>
                    <p class="text-sm text-gray-600">${space['Conference Equip.']}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
};

const hideModal = () => {
    const modal = document.getElementById('booking-modal');
    modal.style.display = 'none';
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadData();
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    document.getElementById('today-btn').addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });
    
    // Category filter
    document.getElementById('category-filter').addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        renderCalendar();
    });
    
    // Modal close
    document.getElementById('close-modal').addEventListener('click', hideModal);
    
    // Close modal when clicking outside
    document.getElementById('booking-modal').addEventListener('click', (e) => {
        if (e.target.id === 'booking-modal') {
            hideModal();
        }
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
}); 