const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parse/sync');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read CSV files
const readCSVFile = (filename) => {
  try {
    const csvData = fs.readFileSync(path.join(__dirname, 'data', filename));
    return csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
};

// Load data from CSV files
let doctors = [];
let spaces = [];
let spaceBookings = [];

// Load data on startup
const loadData = () => {
  doctors = readCSVFile('Doctors.csv');
  spaces = readCSVFile('Spaces.csv');
  spaceBookings = readCSVFile('SpaceBookings.csv');
  console.log(`Loaded ${doctors.length} doctors, ${spaces.length} spaces, ${spaceBookings.length} bookings`);
};

// Load data immediately
loadData();

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    dataStats: {
      doctors: doctors.length,
      spaces: spaces.length,
      bookings: spaceBookings.length
    }
  });
});

// ===== DOCTORS API ENDPOINTS =====

// Get all doctors
app.get('/api/doctors', (req, res) => {
  try {
    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch doctors',
      message: err.message 
    });
  }
});

// Get doctor by ID
app.get('/api/doctors/:id', (req, res) => {
  try {
    const doctor = doctors.find(d => d.Id === req.params.id);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Doctor not found' 
      });
    }
    res.json({
      success: true,
      data: doctor
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch doctor',
      message: err.message 
    });
  }
});

// Get doctors by specialty
app.get('/api/doctors/specialty/:specialty', (req, res) => {
  try {
    const specialty = req.params.specialty.toLowerCase();
    const filteredDoctors = doctors.filter(d => 
      d.Specialty.toLowerCase().includes(specialty)
    );
    
    res.json({
      success: true,
      count: filteredDoctors.length,
      specialty: req.params.specialty,
      data: filteredDoctors
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch doctors by specialty',
      message: err.message 
    });
  }
});

// Get available doctors (with dedicated space)
app.get('/api/doctors/available', (req, res) => {
  try {
    const availableDoctors = doctors.filter(d => d['Dedicated Space in Office'] === 'yes');
    
    res.json({
      success: true,
      count: availableDoctors.length,
      data: availableDoctors
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch available doctors',
      message: err.message 
    });
  }
});

// ===== SPACES API ENDPOINTS =====

// Get all spaces
app.get('/api/spaces', (req, res) => {
  try {
    res.json({
      success: true,
      count: spaces.length,
      data: spaces
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch spaces',
      message: err.message 
    });
  }
});

// Get bookable spaces
app.get('/api/spaces/bookable', (req, res) => {
  try {
    const bookableSpaces = spaces.filter(s => s.Bookable === 'Yes');
    
    res.json({
      success: true,
      count: bookableSpaces.length,
      data: bookableSpaces
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bookable spaces',
      message: err.message 
    });
  }
});

// Get spaces by category
app.get('/api/spaces/category/:category', (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const filteredSpaces = spaces.filter(s => 
      s.Category.toLowerCase().includes(category)
    );
    
    res.json({
      success: true,
      count: filteredSpaces.length,
      category: req.params.category,
      data: filteredSpaces
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch spaces by category',
      message: err.message 
    });
  }
});

// Get space by ID
app.get('/api/spaces/:id', (req, res) => {
  try {
    const space = spaces.find(s => s['Space ID'] === req.params.id);
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Space not found' 
      });
    }
    res.json({
      success: true,
      data: space
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch space',
      message: err.message 
    });
  }
});

// ===== BOOKINGS API ENDPOINTS =====

// Get all bookings
app.get('/api/bookings', (req, res) => {
  try {
    res.json({
      success: true,
      count: spaceBookings.length,
      data: spaceBookings
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bookings',
      message: err.message 
    });
  }
});

// Get bookings by space ID
app.get('/api/bookings/space/:spaceId', (req, res) => {
  try {
    const filteredBookings = spaceBookings.filter(b => b['Space ID'] === req.params.spaceId);
    
    res.json({
      success: true,
      count: filteredBookings.length,
      spaceId: req.params.spaceId,
      data: filteredBookings
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bookings by space',
      message: err.message 
    });
  }
});

// Get bookings by date
app.get('/api/bookings/date/:date', (req, res) => {
  try {
    const date = req.params.date;
    const filteredBookings = spaceBookings.filter(b => b.Date === date);
    
    res.json({
      success: true,
      count: filteredBookings.length,
      date: date,
      data: filteredBookings
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bookings by date',
      message: err.message 
    });
  }
});

// ===== CHATBOT API ENDPOINTS =====

// Search doctors by query
app.get('/api/chatbot/search-doctors', (req, res) => {
  try {
    const { query, specialty } = req.query;
    let filteredDoctors = [...doctors];
    
    if (query) {
      const searchQuery = query.toLowerCase();
      filteredDoctors = filteredDoctors.filter(d => 
        d.Name.toLowerCase().includes(searchQuery) ||
        d.Specialty.toLowerCase().includes(searchQuery) ||
        d.Email.toLowerCase().includes(searchQuery)
      );
    }
    
    if (specialty) {
      const specialtyQuery = specialty.toLowerCase();
      filteredDoctors = filteredDoctors.filter(d => 
        d.Specialty.toLowerCase().includes(specialtyQuery)
      );
    }
    
    res.json({
      success: true,
      count: filteredDoctors.length,
      query: query || null,
      specialty: specialty || null,
      data: filteredDoctors
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search doctors',
      message: err.message 
    });
  }
});

// Find available spaces for booking
app.get('/api/chatbot/available-spaces', (req, res) => {
  try {
    const { date, time, duration, category } = req.query;
    let availableSpaces = spaces.filter(s => s.Bookable === 'Yes');
    
    // Filter by category if provided
    if (category) {
      const categoryQuery = category.toLowerCase();
      availableSpaces = availableSpaces.filter(s => 
        s.Category.toLowerCase().includes(categoryQuery)
      );
    }
    
    // Check for conflicts if date and time provided
    if (date && time) {
      const requestedDateTime = new Date(`${date} ${time}`);
      const requestedEndTime = new Date(requestedDateTime.getTime() + (duration || 1) * 60 * 60 * 1000);
      
      // Filter out spaces that have conflicting bookings
      availableSpaces = availableSpaces.filter(space => {
        const filteredBookings = spaceBookings.filter(b => b['Space ID'] === space['Space ID']);
        return !filteredBookings.some(booking => {
          const bookingStart = new Date(booking['Start Timestamp']);
          const bookingEnd = new Date(booking['End Timestamp']);
          return (requestedDateTime < bookingEnd && requestedEndTime > bookingStart);
        });
      });
    }
    
    res.json({
      success: true,
      count: availableSpaces.length,
      date: date || null,
      time: time || null,
      duration: duration || null,
      category: category || null,
      data: availableSpaces
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to find available spaces',
      message: err.message 
    });
  }
});

// Get booking suggestions
app.get('/api/chatbot/suggestions', (req, res) => {
  try {
    const { specialty, date, time, duration = 1 } = req.query;
    
    let suggestions = {
      doctors: [],
      spaces: [],
      message: '',
      requestDetails: {
        date: date,
        time: time,
        duration: duration,
        specialty: specialty
      }
    };
    
    // Find doctors by specialty
    if (specialty) {
      const specialtyQuery = specialty.toLowerCase();
      suggestions.doctors = doctors.filter(d => 
        d.Specialty.toLowerCase().includes(specialtyQuery) && 
        d['Dedicated Space in Office'] === 'yes'
      );
    }
    
    // Find available spaces with detailed availability
    if (date && time) {
      const requestedDateTime = new Date(`${date} ${time}`);
      const requestedEndTime = new Date(requestedDateTime.getTime() + (parseInt(duration) || 1) * 60 * 60 * 1000);
      
      suggestions.spaces = spaces.filter(space => {
        if (space.Bookable !== 'Yes') return false;
        
        const filteredBookings = spaceBookings.filter(b => b['Space ID'] === space['Space ID']);
        const hasConflict = filteredBookings.some(booking => {
          const bookingStart = new Date(booking['Start Timestamp']);
          const bookingEnd = new Date(booking['End Timestamp']);
          return (requestedDateTime < bookingEnd && requestedEndTime > bookingStart);
        });
        
        if (!hasConflict) {
          // Add availability details to the space
          space.availability = {
            startTime: time,
            endTime: requestedEndTime.toTimeString().slice(0, 5),
            duration: `${duration} hour${parseInt(duration) > 1 ? 's' : ''}`,
            date: date,
            available: true
          };
          return true;
        }
        return false;
      });
    }
    
    // Generate helpful message with time details
    if (suggestions.doctors.length > 0 && suggestions.spaces.length > 0) {
      suggestions.message = `Found ${suggestions.doctors.length} doctors and ${suggestions.spaces.length} available spaces for ${date} at ${time} (${duration} hour${parseInt(duration) > 1 ? 's' : ''}).`;
    } else if (suggestions.doctors.length > 0) {
      suggestions.message = `Found ${suggestions.doctors.length} doctors, but no available spaces for ${date} at ${time}.`;
    } else if (suggestions.spaces.length > 0) {
      suggestions.message = `Found ${suggestions.spaces.length} available spaces for ${date} at ${time} (${duration} hour${parseInt(duration) > 1 ? 's' : ''}), but no doctors match your specialty.`;
    } else {
      suggestions.message = 'No matches found for your request.';
    }
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get suggestions',
      message: err.message 
    });
  }
});

// ===== STATISTICS API ENDPOINTS =====

// Get overall statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      doctors: {
        total: doctors.length,
        withDedicatedSpace: doctors.filter(d => d['Dedicated Space in Office'] === 'yes').length,
        specialties: [...new Set(doctors.map(d => d.Specialty))].length
      },
      spaces: {
        total: spaces.length,
        bookable: spaces.filter(s => s.Bookable === 'Yes').length,
        categories: [...new Set(spaces.map(s => s.Category))].length
      },
      bookings: {
        total: spaceBookings.length,
        upcoming: spaceBookings.filter(b => new Date(b['Start Timestamp']) > new Date()).length
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get statistics',
      message: err.message 
    });
  }
});

// Get specialty statistics
app.get('/api/stats/specialties', (req, res) => {
  try {
    const specialtyStats = {};
    doctors.forEach(doctor => {
      const specialty = doctor.Specialty;
      if (!specialtyStats[specialty]) {
        specialtyStats[specialty] = {
          count: 0,
          withDedicatedSpace: 0
        };
      }
      specialtyStats[specialty].count++;
      if (doctor['Dedicated Space in Office'] === 'yes') {
        specialtyStats[specialty].withDedicatedSpace++;
      }
    });
    
    res.json({
      success: true,
      data: specialtyStats
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get specialty statistics',
      message: err.message 
    });
  }
});

// ===== LEGACY ENDPOINTS (for backward compatibility) =====

// Legacy users endpoint (now returns doctors)
app.get('/api/users', (req, res) => {
  try {
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read doctors data' });
  }
});

// Legacy tasks endpoint (now returns spaces)
app.get('/api/tasks', (req, res) => {
  try {
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read spaces data' });
  }
});

// Serve the main HTML page for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🌐 GUI available at http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET /api/health - Server health check`);
  console.log(`   GET /api/doctors - Get all doctors`);
  console.log(`   GET /api/doctors/:id - Get doctor by ID`);
  console.log(`   GET /api/doctors/specialty/:specialty - Get doctors by specialty`);
  console.log(`   GET /api/doctors/available - Get available doctors`);
  console.log(`   GET /api/spaces - Get all spaces`);
  console.log(`   GET /api/spaces/:id - Get space by ID`);
  console.log(`   GET /api/spaces/bookable - Get bookable spaces`);
  console.log(`   GET /api/spaces/category/:category - Get spaces by category`);
  console.log(`   GET /api/bookings - Get all bookings`);
  console.log(`   GET /api/bookings/space/:spaceId - Get bookings by space`);
  console.log(`   GET /api/bookings/date/:date - Get bookings by date`);
  console.log(`   GET /api/chatbot/search-doctors - Search doctors`);
  console.log(`   GET /api/chatbot/available-spaces - Find available spaces`);
  console.log(`   GET /api/chatbot/suggestions - Get booking suggestions`);
  console.log(`   GET /api/stats - Get overall statistics`);
  console.log(`   GET /api/stats/specialties - Get specialty statistics`);
});