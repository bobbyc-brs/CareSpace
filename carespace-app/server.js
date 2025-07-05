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

// Global data storage
let doctors = [];
let spaces = [];
let bookings = [];
let doctorCalendars = []; // Add doctor calendars data

// Read CSV file
const readCSVFile = (filename) => {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return [];
  }
};

// Save bookings to CSV file
const saveBookingsToCSV = () => {
  try {
    const filePath = path.join(__dirname, 'data', 'SpaceBookings.csv');
    
    // Create CSV header
    const headers = ['Booking ID', 'Space ID', 'Doctor ID', 'Start Timestamp', 'End Timestamp', 'Duration (hours)', 'Activity', 'Notes', 'Status', 'Created At'];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...bookings.map(booking => [
        booking['Booking ID'] || '',
        booking['Space ID'] || '',
        booking['Doctor ID'] || '',
        booking['Start Timestamp'] || '',
        booking['End Timestamp'] || '',
        booking['Duration (hours)'] || '',
        booking['Activity'] || '',
        booking['Notes'] || '',
        booking['Status'] || '',
        booking['Created At'] || ''
      ].join(','))
    ].join('\n');
    
    fs.writeFileSync(filePath, csvContent, 'utf8');
    console.log(`✅ Saved ${bookings.length} bookings to SpaceBookings.csv`);
  } catch (error) {
    console.error('❌ Error saving bookings to CSV:', error.message);
  }
};

// Load all data
const loadData = () => {
  doctors = readCSVFile('Doctors.csv');
  spaces = readCSVFile('Spaces.csv');
  bookings = readCSVFile('SpaceBookings.csv');
  doctorCalendars = readCSVFile('DoctorCalendars.csv'); // Load doctor calendars
  
  console.log(`Loaded ${doctors.length} doctors, ${spaces.length} spaces, ${bookings.length} bookings, ${doctorCalendars.length} doctor calendar entries`);
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
      bookings: bookings.length
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

// Get doctor calendar by ID
app.get('/api/doctors/:id/calendar', (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctorCalendar = doctorCalendars.filter(cal => cal.DoctorID === doctorId);
    
    if (doctorCalendar.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor calendar not found',
        message: `No calendar entries found for doctor ID ${doctorId}`
      });
    }
    
    res.json({
      success: true,
      count: doctorCalendar.length,
      doctorId: doctorId,
      data: doctorCalendar
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
});

// Get doctor calendar by date range
app.get('/api/doctors/:id/calendar/range', (req, res) => {
  try {
    const doctorId = req.params.id;
    const { startDate, endDate } = req.query;
    
    let filteredCalendar = doctorCalendars.filter(cal => cal.DoctorID === doctorId);
    
    if (startDate) {
      filteredCalendar = filteredCalendar.filter(cal => cal.Date >= startDate);
    }
    
    if (endDate) {
      filteredCalendar = filteredCalendar.filter(cal => cal.Date <= endDate);
    }
    
    res.json({
      success: true,
      count: filteredCalendar.length,
      doctorId: doctorId,
      startDate: startDate || 'all',
      endDate: endDate || 'all',
      data: filteredCalendar
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
});

// Get all doctor calendars
app.get('/api/doctor-calendars', (req, res) => {
  try {
    res.json({
      success: true,
      count: doctorCalendars.length,
      data: doctorCalendars
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
});

// Get doctor availability for a specific date
app.get('/api/doctors/:id/availability/:date', (req, res) => {
  try {
    const doctorId = req.params.id;
    const date = req.params.date;
    
    const daySchedule = doctorCalendars.filter(cal => 
      cal.DoctorID === doctorId && cal.Date === date
    );
    
    if (daySchedule.length === 0) {
      return res.json({
        success: true,
        doctorId: doctorId,
        date: date,
        available: false,
        message: 'No schedule found for this date',
        data: []
      });
    }
    
    // Check if doctor is available (not "OFF")
    const isAvailable = daySchedule.some(entry => entry.Time !== 'OFF');
    
    res.json({
      success: true,
      doctorId: doctorId,
      date: date,
      available: isAvailable,
      data: daySchedule
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
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
      count: bookings.length,
      data: bookings
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
    const filteredBookings = bookings.filter(b => b['Space ID'] === req.params.spaceId);
    
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
    const filteredBookings = bookings.filter(b => b.Date === date);
    
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
        const filteredBookings = bookings.filter(b => b['Space ID'] === space['Space ID']);
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

// Enhanced chatbot suggestions with doctor availability
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
      },
      alternativeSlots: [],
      doctorAvailability: []
    };
    
    // Find doctors by specialty
    if (specialty) {
      const specialtyQuery = specialty.toLowerCase();
      suggestions.doctors = doctors.filter(d => 
        d.Specialty.toLowerCase().includes(specialtyQuery) && 
        d['Dedicated Space in Office'] === 'yes'
      );
      
      // Add doctor availability information
      if (date && suggestions.doctors.length > 0) {
        suggestions.doctorAvailability = suggestions.doctors.map(doctor => {
          const doctorSchedule = doctorCalendars.filter(cal => 
            cal.DoctorID === doctor.Id && cal.Date === date
          );
          
          const isAvailable = doctorSchedule.some(entry => entry.Time !== 'OFF');
          const daySchedule = doctorSchedule.map(entry => ({
            time: entry.Time,
            activity: entry.Activity,
            location: entry.Location,
            notes: entry.Notes
          }));
          
          return {
            doctorId: doctor.Id,
            doctorName: doctor.Name,
            specialty: doctor.Specialty,
            available: isAvailable,
            schedule: daySchedule
          };
        });
      }
    }
    
    // Find available spaces with detailed availability
    if (date && time) {
      const requestedDateTime = new Date(`${date} ${time}`);
      const requestedEndTime = new Date(requestedDateTime.getTime() + (parseInt(duration) || 1) * 60 * 60 * 1000);
      
      const bookableSpaces = spaces.filter(space => space.Bookable === 'Yes');
      
      suggestions.spaces = bookableSpaces.filter(space => {
        const filteredBookings = bookings.filter(b => b['Space ID'] === space['Space ID']);
        const hasConflict = filteredBookings.some(booking => {
          const bookingStart = new Date(booking['Start Timestamp']);
          const bookingEnd = new Date(booking['End Timestamp']);
          
          return (requestedDateTime < bookingEnd && requestedEndTime > bookingStart);
        });
        
        if (!hasConflict) {
          // Add availability details
          space.availability = {
            date: date,
            startTime: time,
            endTime: requestedEndTime.toTimeString().slice(0, 5),
            duration: duration,
            requestedSlot: {
              start: requestedDateTime.toISOString(),
              end: requestedEndTime.toISOString()
            }
          };
        }
        
        return !hasConflict;
      });
      
      // Find alternative time slots for unavailable spaces
      const unavailableSpaces = bookableSpaces.filter(space => {
        const filteredBookings = bookings.filter(b => b['Space ID'] === space['Space ID']);
        const hasConflict = filteredBookings.some(booking => {
          const bookingStart = new Date(booking['Start Timestamp']);
          const bookingEnd = new Date(booking['End Timestamp']);
          return (requestedDateTime < bookingEnd && requestedEndTime > bookingStart);
        });
        return hasConflict;
      });
      
      // Generate alternative slots for unavailable spaces
      unavailableSpaces.forEach(space => {
        const alternativeSlots = [];
        const baseTime = new Date(`${date} 08:00`);
        
        for (let hour = 8; hour <= 17; hour++) {
          const slotDateTime = new Date(baseTime.getTime() + hour * 60 * 60 * 1000);
          const slotEndTime = new Date(slotDateTime.getTime() + (parseInt(duration) || 1) * 60 * 60 * 1000);
          
          const filteredBookings = bookings.filter(b => b['Space ID'] === space['Space ID']);
          const hasConflict = filteredBookings.some(booking => {
            const bookingStart = new Date(booking['Start Timestamp']);
            const bookingEnd = new Date(booking['End Timestamp']);
            return (slotDateTime < bookingEnd && slotEndTime > bookingStart);
          });
          
          if (!hasConflict) {
            alternativeSlots.push({
              spaceId: space['Space ID'],
              spaceName: space.SpaceName,
              startTime: slotDateTime.toTimeString().slice(0, 5),
              endTime: slotEndTime.toTimeString().slice(0, 5),
              duration: duration
            });
          }
        }
        
        if (alternativeSlots.length > 0) {
          suggestions.alternativeSlots.push({
            space: space,
            alternatives: alternativeSlots.slice(0, 3) // Limit to 3 alternatives
          });
        }
      });
    }
    
    // Generate response message
    let message = '';
    if (suggestions.doctors.length > 0) {
      message += `👨‍⚕️ **Available Doctors:** ${suggestions.doctors.length} found\n`;
      suggestions.doctors.forEach(doctor => {
        const availability = suggestions.doctorAvailability.find(av => av.doctorId === doctor.Id);
        if (availability) {
          message += `• **${doctor.Name}** (${doctor.Specialty}) - ${availability.available ? '✅ Available' : '❌ Unavailable'}\n`;
        }
      });
      message += '\n';
    }
    
    if (suggestions.spaces.length > 0) {
      message += `🏢 **Available Spaces:** ${suggestions.spaces.length} found\n`;
    } else {
      message += `❌ **No spaces available** for the requested time.\n`;
      if (suggestions.alternativeSlots.length > 0) {
        message += `💡 **Alternative time slots available** for some spaces.\n`;
      }
    }
    
    suggestions.message = message;
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
});

// ===== AVAILABILITY CHECK API ENDPOINTS =====

// Check doctor and space availability for a specific date and time
app.get('/api/availability/check', (req, res) => {
  try {
    const { date, time, duration = 1, specialty, activity } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'Date and time are required'
      });
    }
    
    // Parse the requested time
    const requestedDateTime = new Date(`${date} ${time}`);
    const endDateTime = new Date(requestedDateTime.getTime() + (parseInt(duration) || 1) * 60 * 60 * 1000);
    
    // Get all doctors (filter by specialty if provided)
    let availableDoctors = [...doctors];
    if (specialty) {
      availableDoctors = availableDoctors.filter(d => 
        d.Specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }
    
    // Check doctor availability for the requested date and time
    const doctorAvailability = [];
    availableDoctors.forEach(doctor => {
      const doctorSchedule = doctorCalendars.filter(cal =>
        cal.DoctorID === doctor.Id && cal.Date === date
      );
      
      if (doctorSchedule.length === 0) {
        // No schedule found, assume available
        doctorAvailability.push({
          doctorId: doctor.Id,
          doctorName: doctor.Name,
          specialty: doctor.Specialty,
          available: true,
          reason: 'No schedule found for this date',
          schedule: []
        });
      } else {
        // Check if doctor is available during the requested time
        const conflictingSchedule = doctorSchedule.filter(entry => {
          if (entry.Time === 'OFF') return true;
          
          const [startTime, endTime] = entry.Time.split('-');
          const scheduleStart = new Date(`${date} ${startTime}`);
          const scheduleEnd = new Date(`${date} ${endTime}`);
          
          // Check for overlap
          return (requestedDateTime < scheduleEnd && endDateTime > scheduleStart);
        });
        
        const isAvailable = conflictingSchedule.length === 0;
        doctorAvailability.push({
          doctorId: doctor.Id,
          doctorName: doctor.Name,
          specialty: doctor.Specialty,
          available: isAvailable,
          reason: isAvailable ? 'Available during requested time' : 'Busy during requested time',
          schedule: doctorSchedule.map(entry => ({
            time: entry.Time,
            activity: entry.Activity,
            location: entry.Location,
            notes: entry.Notes
          }))
        });
      }
    });
    
    // Get all bookable spaces and filter by activity type
    let bookableSpaces = spaces.filter(s => s.Bookable === 'Yes');
    
    // Filter spaces based on activity type and uses column
    if (activity) {
      const activityLower = activity.toLowerCase();
      bookableSpaces = bookableSpaces.filter(space => {
        const uses = space.uses || '';
        const usesLower = uses.toLowerCase();
        
        // Map activity types to uses keywords
        if (activityLower.includes('labwork') || activityLower.includes('lab work')) {
          return usesLower.includes('lab work') || 
                 usesLower.includes('research') || 
                 space.Category.toLowerCase().includes('research') ||
                 space.Category.toLowerCase().includes('lab');
        } else if (activityLower.includes('consultation') || activityLower.includes('patient consultation')) {
          return usesLower.includes('patient consultation') || 
                 usesLower.includes('consultation') ||
                 space.Category.toLowerCase().includes('clinical') ||
                 space.Category.toLowerCase().includes('education');
        } else if (activityLower.includes('research')) {
          return usesLower.includes('research') || 
                 space.Category.toLowerCase().includes('research');
        } else if (activityLower.includes('teaching') || activityLower.includes('education')) {
          return usesLower.includes('teaching') || 
                 usesLower.includes('education') ||
                 space.Category.toLowerCase().includes('education');
        } else if (activityLower.includes('administration') || activityLower.includes('admin')) {
          return usesLower.includes('administration') || 
                 usesLower.includes('admin') ||
                 space.Category.toLowerCase().includes('admin');
        } else if (activityLower.includes('private')) {
          return usesLower.includes('private') || 
                 space.Category.toLowerCase().includes('admin');
        } else {
          // If no specific activity match, return all bookable spaces
          return true;
        }
      });
    }
    
    // Check space availability for the requested date and time
    const spaceAvailability = [];
    bookableSpaces.forEach(space => {
      const spaceBookings = bookings.filter(b => b['Space ID'] === space['Space ID']);
      
      // Check for conflicts with existing bookings
      const conflictingBookings = spaceBookings.filter(booking => {
        const bookingStart = new Date(booking['Start Timestamp']);
        const bookingEnd = new Date(booking['End Timestamp']);
        
        // Check for overlap
        return (requestedDateTime < bookingEnd && endDateTime > bookingStart);
      });
      
      const isAvailable = conflictingBookings.length === 0;
      spaceAvailability.push({
        spaceId: space['Space ID'],
        spaceName: space.SpaceName,
        category: space.Category,
        capacity: space['Capacity (people)'],
        area: space['Area (sqm)'],
        equipment: space['Specialized Equipment'],
        uses: space.uses,
        available: isAvailable,
        reason: isAvailable ? 'Available during requested time' : 'Booked during requested time',
        conflictingBookings: conflictingBookings.map(booking => ({
          startTime: booking['Start Timestamp'],
          endTime: booking['End Timestamp'],
          duration: booking['Duration (hours)']
        }))
      });
    });
    
    // Find optimal matches (available doctors + available spaces)
    const availableDoctorsList = doctorAvailability.filter(d => d.available);
    const availableSpacesList = spaceAvailability.filter(s => s.available);
    
    const optimalMatches = [];
    availableDoctorsList.forEach(doctor => {
      availableSpacesList.forEach(space => {
        // Check if space category matches doctor's needs
        let isCompatible = true;
        if (doctor.specialty.toLowerCase().includes('surgery') || 
            doctor.specialty.toLowerCase().includes('anesthesiology')) {
          isCompatible = space.category.toLowerCase().includes('operating') || 
                        space.category.toLowerCase().includes('clinical');
        } else if (doctor.specialty.toLowerCase().includes('cardiology')) {
          isCompatible = space.category.toLowerCase().includes('clinical') || 
                        space.category.toLowerCase().includes('diagnostic');
        } else if (doctor.specialty.toLowerCase().includes('pediatric')) {
          isCompatible = space.category.toLowerCase().includes('clinical') || 
                        space.category.toLowerCase().includes('education');
        }
        
        if (isCompatible) {
          optimalMatches.push({
            doctor: doctor,
            space: space,
            compatibility: 'High'
          });
        }
      });
    });
    
    res.json({
      success: true,
      data: {
        requestedDateTime: requestedDateTime.toISOString(),
        requestedDuration: duration,
        requestedActivity: activity,
        doctorAvailability: doctorAvailability,
        spaceAvailability: spaceAvailability,
        availableDoctors: availableDoctorsList.length,
        availableSpaces: availableSpacesList.length,
        optimalMatches: optimalMatches,
        summary: {
          totalDoctors: doctorAvailability.length,
          totalSpaces: spaceAvailability.length,
          availableDoctors: availableDoctorsList.length,
          availableSpaces: availableSpacesList.length,
          optimalMatches: optimalMatches.length
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
});

// ===== BOOKING API ENDPOINTS =====

// Create a new booking
app.post('/api/bookings', (req, res) => {
  try {
    const { spaceId, doctorId, startTime, endTime, duration, activity, notes } = req.body;
    
    if (!spaceId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'Space ID, start time, and end time are required'
      });
    }
    
    // Validate that the space exists and is bookable
    const space = spaces.find(s => s['Space ID'] === spaceId);
    if (!space) {
      return res.status(404).json({
        success: false,
        error: 'Space not found',
        message: 'The specified space does not exist'
      });
    }
    
    if (space.Bookable !== 'Yes') {
      return res.status(400).json({
        success: false,
        error: 'Space not bookable',
        message: 'This space is not available for booking'
      });
    }
    
    // Check for booking conflicts
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    
    const conflictingBookings = bookings.filter(booking => {
      const bookingStart = new Date(booking['Start Timestamp']);
      const bookingEnd = new Date(booking['End Timestamp']);
      
      return booking['Space ID'] === spaceId && 
             (startDateTime < bookingEnd && endDateTime > bookingStart);
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Booking conflict',
        message: 'This space is already booked for the requested time period',
        conflictingBookings: conflictingBookings
      });
    }
    
    // Create new booking
    const newBooking = {
      'Booking ID': `BK${Date.now()}`,
      'Space ID': spaceId,
      'Doctor ID': doctorId || null,
      'Start Timestamp': startTime,
      'End Timestamp': endTime,
      'Duration (hours)': duration || 1,
      'Activity': activity || 'General',
      'Notes': notes || '',
      'Status': 'Confirmed',
      'Created At': new Date().toISOString()
    };
    
    // Add to bookings array and save to CSV file
    bookings.push(newBooking);
    saveBookingsToCSV();
    
    res.json({
      success: true,
      data: {
        booking: newBooking,
        space: {
          id: space['Space ID'],
          name: space.SpaceName,
          category: space.Category
        },
        message: 'Booking created successfully and saved to CSV'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
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
        total: bookings.length,
        upcoming: bookings.filter(b => new Date(b['Start Timestamp']) > new Date()).length
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
  console.log(`   GET /api/doctors/:id/calendar - Get doctor calendar`);
  console.log(`   GET /api/doctors/:id/calendar/range - Get doctor calendar by date range`);
  console.log(`   GET /api/doctors/:id/availability/:date - Get doctor availability for date`);
  console.log(`   GET /api/doctor-calendars - Get all doctor calendars`);
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
  console.log(`   GET /api/availability/check - Check doctor and space availability`);
  console.log(`   POST /api/bookings - Create a new booking`);
  console.log(`   GET /api/stats - Get overall statistics`);
  console.log(`   GET /api/stats/specialties - Get specialty statistics`);
});