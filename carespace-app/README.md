# CareSpace - Healthcare Space Management System

A comprehensive Node.js application for managing doctors, spaces, and bookings in healthcare facilities, featuring an intelligent chatbot interface and calendar system.

## Features

- 🏥 **Doctor Management**: Complete doctor profiles with specialties and availability
- 🏢 **Space Management**: Comprehensive space inventory with equipment and capacity
- 📅 **Booking System**: Advanced booking management with conflict detection
- 🤖 **AI-Powered Chatbot**: Intelligent booking assistant with OpenAI integration
- 📊 **Calendar View**: Visual calendar interface for booking management
- 🎯 **AI Recommendations**: Smart space recommendations based on activity requirements
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🔄 **Real-time Updates**: Live data synchronization between frontend and backend
- 📈 **Statistics Dashboard**: Real-time analytics and reporting
- 🔔 **Notifications**: Toast notifications for user feedback

## Tech Stack & Tools

### Backend Technologies
- **Node.js** (v18.20.8) - JavaScript runtime environment
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing middleware
- **Morgan** - HTTP request logger middleware
- **Dotenv** - Environment variables management
- **CSV Parser** - CSV file reading and writing
- **Path** - File path utilities
- **FS** - File system operations

### Frontend Technologies
- **HTML5** - Semantic markup structure
- **CSS3** - Styling and layout
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - Frontend interactivity
- **Font Awesome** - Icon library
- **Responsive Design** - Mobile-first approach

### AI & Machine Learning
- **OpenAI GPT-3.5-turbo** - Natural language processing for date/time parsing
- **OpenAI API** - AI-powered space recommendations
- **JSON** - Data exchange format for AI responses

### Data Management
- **CSV Files** - Data storage format
  - `Doctors.csv` - Doctor profiles and specialties
  - `Spaces.csv` - Space inventory and specifications
  - `SpaceBookings.csv` - Booking records
  - `DoctorCalendars.csv` - Doctor availability schedules

### Development Tools
- **npm** - Package manager
- **Git** - Version control
- **ESLint** - Code linting (if configured)
- **Nodemon** - Development server with auto-restart

### API & Communication
- **RESTful API** - Complete REST API with proper HTTP methods
- **JSON** - Data exchange format
- **HTTP/HTTPS** - Communication protocols
- **WebSocket** - Real-time communication (if implemented)

### UI/UX Components
- **Modal Dialogs** - Interactive popup forms
- **Toast Notifications** - User feedback system
- **Loading Indicators** - User experience enhancement
- **Responsive Tables** - Data display components
- **Form Validation** - Input validation and error handling

### Security & Performance
- **CORS Configuration** - Cross-origin security
- **Input Validation** - Data sanitization
- **Error Handling** - Comprehensive error management
- **Health Checks** - System monitoring endpoints

### File Structure
```
carespace-app/
├── data/                    # CSV data files
│   ├── Doctors.csv         # Doctor profiles
│   ├── Spaces.csv          # Space inventory
│   ├── SpaceBookings.csv   # Booking records
│   └── DoctorCalendars.csv # Availability schedules
├── public/                 # Frontend files
│   ├── index.html          # Main dashboard
│   ├── chatbot.html        # Chatbot interface
│   ├── calendar.html       # Calendar view
│   ├── app.js              # Main frontend logic
│   ├── chatbot.js          # Chatbot functionality
│   ├── calendar.js         # Calendar functionality
│   └── prompts.json        # AI prompts configuration
├── server.js               # Express server
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
└── README.md              # Project documentation
```

## API Endpoints

### Health & Monitoring
- `GET /api/health` - Server health status

### Doctor Management
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/specialty/:specialty` - Get doctors by specialty
- `GET /api/doctors/available` - Get available doctors

### Space Management
- `GET /api/spaces` - Get all spaces
- `GET /api/spaces/:id` - Get space by ID
- `GET /api/spaces/bookable` - Get bookable spaces
- `GET /api/spaces/category/:category` - Get spaces by category

### Booking Management
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/space/:spaceId` - Get bookings by space
- `GET /api/bookings/date/:date` - Get bookings by date

### Chatbot & AI
- `GET /api/chatbot/search-doctors` - Search doctors
- `GET /api/chatbot/available-spaces` - Find available spaces
- `GET /api/chatbot/suggestions` - Get booking suggestions
- `POST /api/openai/parse-datetime` - Parse natural language dates
- `POST /api/openai/recommendations` - Get AI space recommendations

### Statistics
- `GET /api/stats` - Get overall statistics
- `GET /api/stats/specialties` - Get specialty statistics

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- OpenAI API key (optional, for enhanced features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd carespace-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# OpenAI API Configuration (Optional - for enhanced date/time parsing)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-api-key-here
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Dashboard Overview

The application provides three main interfaces:

1. **Main Dashboard** (`/`) - Overview of doctors, spaces, and bookings
2. **Chatbot Interface** (`/chatbot.html`) - AI-powered booking assistant
3. **Calendar View** (`/calendar.html`) - Visual booking calendar

### Chatbot Features

- **Natural Language Processing**: Understand booking requests in plain English
- **AI Recommendations**: Get intelligent space suggestions
- **Automatic Date Parsing**: Convert natural language to structured dates
- **Activity Matching**: Match activities to appropriate spaces
- **Booking Management**: Create and manage bookings through conversation

### Calendar Features

- **Visual Calendar**: Monthly view of all bookings
- **Category Filtering**: Filter bookings by activity type
- **Booking Details**: Click to view detailed booking information
- **Responsive Design**: Works on all device sizes

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (if configured)

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key-here
```

### Adding New Features

1. **New API Endpoints**: Add routes in `server.js`
2. **Frontend Features**: Modify JavaScript files in `public/`
3. **Styling**: Update Tailwind classes in HTML files
4. **AI Prompts**: Update `public/prompts.json` for chatbot responses

## Customization

### Adding New Data Types

To add a new data type (e.g., Equipment):

1. Add data array in `server.js`
2. Add API endpoints
3. Add frontend functionality
4. Update CSV files if needed

### Styling Changes

The application uses Tailwind CSS. You can:

1. Modify classes in HTML files
2. Add custom CSS in the `<style>` section
3. Extend Tailwind configuration if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 