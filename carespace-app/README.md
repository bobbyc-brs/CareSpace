# Node.js GUI Application

A modern Node.js application with a beautiful GUI for managing users and tasks, built with Express.js and a responsive frontend.

## Features

- 🖥️ **Modern GUI**: Beautiful, responsive web interface built with Tailwind CSS
- 📊 **Dashboard**: Real-time statistics and overview cards
- 👥 **User Management**: Add, view, and delete users with full CRUD operations
- ✅ **Task Management**: Create, update, and delete tasks with status tracking
- 🔄 **Real-time Updates**: Live data synchronization between frontend and backend
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🚀 **RESTful API**: Complete REST API with proper HTTP methods
- 📈 **Statistics**: Real-time statistics and analytics
- 🔔 **Notifications**: Toast notifications for user feedback

## Tech Stack

### Backend
- **Node.js** with Express.js
- **CORS** for cross-origin requests
- **Morgan** for HTTP request logging
- **Dotenv** for environment variables

### Frontend
- **HTML5** with semantic markup
- **Tailwind CSS** for modern styling
- **Vanilla JavaScript** for interactivity
- **Font Awesome** for icons

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Statistics
- `GET /api/stats` - Get application statistics

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nodejs-gui-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PORT=3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nodejs-gui-app/
├── public/
│   ├── index.html          # Main HTML file
│   └── app.js              # Frontend JavaScript
├── server.js               # Express server
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
└── README.md              # Project documentation
```

## Usage

### Dashboard Overview

The application opens with a dashboard showing:
- **Total Users**: Number of registered users
- **Total Tasks**: Number of tasks in the system
- **Completed Tasks**: Tasks marked as completed
- **Pending Tasks**: Tasks awaiting completion

### Managing Users

1. Click on the "Users" tab
2. View all users in the system
3. Click "Add User" to create a new user
4. Fill in the form with name, email, and optional age
5. Delete users using the trash icon

### Managing Tasks

1. Click on the "Tasks" tab
2. View all tasks with their current status
3. Click "Add Task" to create a new task
4. Fill in the form with title, description, and status
5. Update task status using the dropdown
6. Delete tasks using the trash icon

### API Testing

You can test the API endpoints using tools like Postman or curl:

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'

# Get statistics
curl http://localhost:3000/api/stats
```

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Adding New Features

1. **New API Endpoints**: Add routes in `server.js`
2. **Frontend Features**: Modify `public/app.js` and `public/index.html`
3. **Styling**: Update Tailwind classes in HTML files

## Customization

### Adding New Data Types

To add a new data type (e.g., Projects):

1. Add data array in `server.js`:
```javascript
let projects = [
  { id: 1, name: 'Project A', description: 'Description', status: 'active' }
];
```

2. Add API endpoints:
```javascript
app.get('/api/projects', (req, res) => {
  res.json(projects);
});
```

3. Add frontend functionality in `app.js`

### Styling Changes

The application uses Tailwind CSS. You can:

1. Modify classes in HTML files
2. Add custom CSS in the `<style>` section
3. Extend Tailwind configuration if needed

### Database Integration

Currently, the app uses in-memory storage. To add a database:

1. Install a database driver (e.g., `mongoose` for MongoDB)
2. Replace in-memory arrays with database queries
3. Add proper error handling for database operations

## Deployment

### Production Build

1. Set environment variables:
```bash
NODE_ENV=production
PORT=3000
```

2. Start the server:
```bash
npm start
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [ISC License](LICENSE).

## Support

For support or questions, please open an issue on the GitHub repository. 