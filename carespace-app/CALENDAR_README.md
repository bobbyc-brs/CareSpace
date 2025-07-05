# CareSpace Calendar Feature

## Overview

The CareSpace Calendar is a comprehensive booking management interface that displays all space bookings in a monthly calendar view. It provides an intuitive way to view, filter, and interact with booking data from the CareSpace system.

## Features

### 📅 **Monthly Calendar View**
- Full monthly calendar display with navigation
- Color-coded bookings by space category
- Today highlighting and current month focus
- Previous/next month navigation
- "Today" button for quick return to current date

### 🎨 **Color-Coded Categories**
- **Clinical** (Yellow): Patient care and treatment spaces
- **Education** (Blue): Training and learning facilities
- **Admin** (Green): Administrative and office spaces
- **Research** (Purple): Research and laboratory facilities
- **Public** (Pink): Public access areas
- **Surgical** (Red): Operating rooms and surgical facilities
- **Diagnostic** (Emerald): Imaging and diagnostic facilities
- **Support** (Orange): Support and service areas

### 🔍 **Advanced Filtering**
- Filter bookings by space category
- Real-time filtering without page reload
- Clear visual distinction of filtered results
- Easy reset to view all categories

### 📋 **Interactive Booking Details**
- Click any booking to view detailed information
- Modal popup with comprehensive booking details
- Space information including capacity and equipment
- Time and duration information
- Equipment and conference facility details

### 📱 **Responsive Design**
- Mobile-friendly calendar layout
- Touch-friendly navigation controls
- Responsive grid system
- Optimized for all screen sizes

## How to Use

### Accessing the Calendar
1. Navigate to the main dashboard at `http://localhost:3000`
2. Click the "Calendar" link in the header
3. Or directly visit `http://localhost:3000/calendar.html`

### Calendar Navigation
1. **Month Navigation**: Use the left/right arrow buttons to navigate between months
2. **Today Button**: Click "Today" to quickly return to the current month
3. **Category Filter**: Use the dropdown to filter bookings by space category
4. **Booking Details**: Click on any booking item to view detailed information

### Viewing Booking Details
1. Click on any colored booking item in the calendar
2. A modal will open showing:
   - Space name and category
   - Booking date and time
   - Duration information
   - Space capacity and area
   - Specialized equipment (if any)
   - Conference equipment (if any)
3. Click outside the modal or the X button to close

### Filtering Bookings
1. Select a category from the "Filter" dropdown
2. The calendar will update to show only bookings in that category
3. Select "All Categories" to view all bookings again

## Technical Implementation

### Frontend Components
- **calendar.html**: Main calendar interface with responsive design
- **calendar.js**: Interactive functionality and data management
- Tailwind CSS for modern styling
- Font Awesome icons for visual elements

### Backend Integration
- Connects to existing `/api/bookings` endpoint
- Connects to existing `/api/spaces` endpoint
- Real-time data loading and filtering
- Modal system for detailed information display

### Data Flow
1. **Data Loading**: Fetches bookings and spaces data on page load
2. **Calendar Generation**: Creates monthly grid based on current date
3. **Booking Mapping**: Matches bookings to spaces for category information
4. **Filtering**: Real-time filtering based on selected category
5. **Modal Display**: Detailed information display on booking click

## API Endpoints Used

- `GET /api/bookings` - Load all booking data
- `GET /api/spaces` - Load all space information
- `GET /api/health` - Server health monitoring

## Calendar Features

### Month Navigation
- Previous month button (left arrow)
- Next month button (right arrow)
- Current month/year display
- Today button for quick navigation

### Day Display
- Day numbers clearly displayed
- Today highlighted with blue border
- Other month days grayed out
- Booking items displayed below day number

### Booking Items
- Color-coded by space category
- Time range displayed (start-end)
- Hover effects for better UX
- Clickable for detailed information

### Modal System
- Fade-in animation
- Comprehensive booking details
- Space information display
- Equipment and facility details
- Easy close functionality

## File Structure

```
public/
├── calendar.html          # Main calendar interface
├── calendar.js           # Calendar functionality
└── index.html           # Updated with calendar link

test_calendar.html        # Test page for calendar functionality
```

## Browser Compatibility

- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Real-time updates and smooth animations
- Touch-friendly interface

## Future Enhancements

### Potential Improvements
- Add new booking functionality
- Edit existing bookings
- Delete booking capability
- Week view option
- Day view option
- Export calendar data
- Print calendar view

### Advanced Features
- Drag and drop booking rescheduling
- Recurring booking support
- Booking conflict detection
- Email notifications
- Calendar sharing
- Integration with external calendars

## Testing

### Manual Testing
1. Load the calendar page
2. Test month navigation
3. Test category filtering
4. Click on booking items
5. Test modal functionality
6. Test responsive design

### Automated Testing
- API endpoint testing
- Frontend functionality testing
- Calendar navigation testing
- Filter functionality testing
- Modal interaction testing

## Performance Considerations

### Current Implementation
- Efficient data loading with Promise.all
- Minimal DOM manipulation
- Optimized calendar rendering
- Responsive design with CSS Grid

### Optimization Opportunities
- Virtual scrolling for large datasets
- Lazy loading of booking details
- Caching of frequently accessed data
- Progressive web app features

## Security and Privacy

### Current Implementation
- Client-side only (no data persistence)
- No personal information stored
- Read-only booking display

### Recommended for Production
- User authentication and authorization
- Booking permission controls
- Audit logging for booking changes
- Data encryption for sensitive information

## Usage Guidelines

### For Users
- Use for viewing existing bookings
- Filter by category to find specific spaces
- Click bookings for detailed information
- Navigate between months to view different time periods

### For Developers
- Maintain consistent color coding
- Update category mappings as needed
- Monitor API performance
- Regular testing of calendar functionality

## Support

For technical issues or questions about the calendar implementation, please refer to the main project documentation or create an issue in the project repository.

## Quick Start

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Access the calendar**:
   - Main dashboard: `http://localhost:3000`
   - Direct calendar: `http://localhost:3000/calendar.html`
   - Test page: `http://localhost:3000/test_calendar.html`

3. **Test functionality**:
   - Navigate between months
   - Filter by category
   - Click on bookings
   - View booking details

The calendar provides a comprehensive view of all CareSpace bookings with an intuitive interface for managing and viewing booking information. 