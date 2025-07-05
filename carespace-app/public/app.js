// API Base URL
const API_BASE = '/api';

// Global state
let currentDoctors = [];
let currentSpaces = [];

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

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

// Doctors API
const loadDoctors = async () => {
    try {
        const response = await apiCall('/doctors');
        currentDoctors = response.data || response;
        renderDoctors();
        updateStats();
    } catch (error) {
        console.error('Failed to load doctors:', error);
    }
};

const addDoctor = async (doctorData) => {
    try {
        const newDoctor = await apiCall('/doctors', {
            method: 'POST',
            body: JSON.stringify(doctorData)
        });
        currentDoctors.push(newDoctor);
        renderDoctors();
        updateStats();
        showNotification('Doctor added successfully!');
        return newDoctor;
    } catch (error) {
        console.error('Failed to add doctor:', error);
    }
};

const deleteDoctor = async (doctorId) => {
    try {
        await apiCall(`/doctors/${doctorId}`, {
            method: 'DELETE'
        });
        currentDoctors = currentDoctors.filter(doctor => doctor.Id !== doctorId);
        renderDoctors();
        updateStats();
        showNotification('Doctor deleted successfully!');
    } catch (error) {
        console.error('Failed to delete doctor:', error);
    }
};

// Spaces API
const loadSpaces = async () => {
    try {
        const response = await apiCall('/spaces');
        currentSpaces = response.data || response;
        renderSpaces();
        updateStats();
    } catch (error) {
        console.error('Failed to load spaces:', error);
    }
};

const addSpace = async (spaceData) => {
    try {
        const newSpace = await apiCall('/spaces', {
            method: 'POST',
            body: JSON.stringify(spaceData)
        });
        currentSpaces.push(newSpace);
        renderSpaces();
        updateStats();
        showNotification('Space added successfully!');
        return newSpace;
    } catch (error) {
        console.error('Failed to add space:', error);
    }
};

const deleteSpace = async (spaceId) => {
    try {
        await apiCall(`/spaces/${spaceId}`, {
            method: 'DELETE'
        });
        currentSpaces = currentSpaces.filter(space => space['Space ID'] !== spaceId);
        renderSpaces();
        updateStats();
        showNotification('Space deleted successfully!');
    } catch (error) {
        console.error('Failed to delete space:', error);
    }
};

// Stats API
const loadStats = async () => {
    try {
        const stats = await apiCall('/stats');
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
};

// UI Rendering functions
const renderDoctors = () => {
    const doctorsList = document.getElementById('users-list');
    doctorsList.innerHTML = '';
    
    currentDoctors.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'bg-white border border-gray-200 rounded-lg p-4 card-hover';
        doctorCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">${doctor.Name}</h3>
                    <p class="text-gray-600">${doctor.Email}</p>
                    <p class="text-sm text-blue-600 font-medium">${doctor.Specialty}</p>
                    <div class="flex items-center space-x-2 mt-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${doctor['Dedicated Space in Office'] === 'yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${doctor['Dedicated Space in Office'] === 'yes' ? 'Has Office' : 'No Office'}
                        </span>
                        ${doctor['Home Office'] === 'yes' ? '<span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Home Office</span>' : ''}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="deleteDoctor('${doctor.Id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        doctorsList.appendChild(doctorCard);
    });
};

const renderSpaces = () => {
    const spacesList = document.getElementById('tasks-list');
    spacesList.innerHTML = '';
    
    currentSpaces.forEach(space => {
        const spaceCard = document.createElement('div');
        spaceCard.className = 'bg-white border border-gray-200 rounded-lg p-4 card-hover';
        spaceCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">${space.SpaceName}</h3>
                    <p class="text-gray-600">${space.Category} • ${space['Area (sqm)']} sqm • ${space['Capacity (people)']} people</p>
                    <p class="text-sm text-gray-500">${space['Specialized Equipment']}</p>
                    <div class="flex items-center space-x-2 mt-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${space.Bookable === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${space.Bookable === 'Yes' ? 'Bookable' : 'Not Bookable'}
                        </span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="deleteSpace('${space['Space ID']}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        spacesList.appendChild(spaceCard);
    });
};

const updateStats = () => {
    document.getElementById('total-users').textContent = currentDoctors.length;
    document.getElementById('total-tasks').textContent = currentSpaces.length;
    document.getElementById('completed-tasks').textContent = currentDoctors.filter(d => d['Dedicated Space in Office'] === 'yes').length;
    document.getElementById('pending-tasks').textContent = currentSpaces.filter(s => s.Bookable === 'Yes').length;
};

const updateStatsDisplay = (stats) => {
    if (stats.data) {
        document.getElementById('total-users').textContent = stats.data.doctors.total;
        document.getElementById('total-tasks').textContent = stats.data.spaces.total;
        document.getElementById('completed-tasks').textContent = stats.data.doctors.withDedicatedSpace;
        document.getElementById('pending-tasks').textContent = stats.data.spaces.bookable;
    } else {
        document.getElementById('total-users').textContent = stats.users?.total || 0;
        document.getElementById('total-tasks').textContent = stats.tasks?.total || 0;
        document.getElementById('completed-tasks').textContent = stats.tasks?.completed || 0;
        document.getElementById('pending-tasks').textContent = stats.tasks?.pending || 0;
    }
};

// Modal functions
const showModal = (modalId) => {
    document.getElementById(modalId).classList.remove('hidden');
};

const hideModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
};

// Tab functions
const switchTab = (tabName) => {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active state from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('border-blue-500', 'text-blue-600');
        button.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-content`).classList.remove('hidden');
    
    // Add active state to selected tab button
    document.getElementById(`${tabName}-tab`).classList.remove('border-transparent', 'text-gray-500');
    document.getElementById(`${tabName}-tab`).classList.add('border-blue-500', 'text-blue-600');
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadDoctors();
    loadSpaces();
    loadStats();
    
    // Tab switching
    document.getElementById('users-tab').addEventListener('click', () => switchTab('users'));
    document.getElementById('tasks-tab').addEventListener('click', () => switchTab('tasks'));
    
    // Add doctor modal
    document.getElementById('add-user-btn').addEventListener('click', () => showModal('add-user-modal'));
    document.getElementById('close-user-modal').addEventListener('click', () => hideModal('add-user-modal'));
    document.getElementById('cancel-user').addEventListener('click', () => hideModal('add-user-modal'));
    
    // Add space modal
    document.getElementById('add-task-btn').addEventListener('click', () => showModal('add-task-modal'));
    document.getElementById('close-task-modal').addEventListener('click', () => hideModal('add-task-modal'));
    document.getElementById('cancel-task').addEventListener('click', () => hideModal('add-task-modal'));
    
    // Form submissions
    document.getElementById('add-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const doctorData = {
            Name: document.getElementById('user-name').value,
            Email: document.getElementById('user-email').value,
            Specialty: document.getElementById('user-age').value || 'General Medicine',
            'Dedicated Space in Office': 'no',
            'Home Office': 'no'
        };
        
        await addDoctor(doctorData);
        hideModal('add-user-modal');
        e.target.reset();
    });
    
    document.getElementById('add-task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const spaceData = {
            Name: document.getElementById('task-title').value,
            Category: document.getElementById('task-description').value || 'Admin',
            'Area (sqm)': '20',
            'Capacity (people)': '2',
            'Specialized Equipment': 'Desk, computer',
            'Conference Equip.': 'None',
            Bookable: document.getElementById('task-status').value === 'completed' ? 'Yes' : 'No'
        };
        
        await addSpace(spaceData);
        hideModal('add-task-modal');
        e.target.reset();
    });
    
    // Close modals when clicking outside
    document.getElementById('add-user-modal').addEventListener('click', (e) => {
        if (e.target.id === 'add-user-modal') {
            hideModal('add-user-modal');
        }
    });
    
    document.getElementById('add-task-modal').addEventListener('click', (e) => {
        if (e.target.id === 'add-task-modal') {
            hideModal('add-task-modal');
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

// Make functions globally available for onclick handlers
window.deleteDoctor = deleteDoctor;
window.deleteSpace = deleteSpace; 