# 🌍 Around the World

A web application that allows users to track and manage countries they have visited. Built with Node.js, Express, and PostgreSQL.

## LIVE on render -  https://aroundtheworld-cihz.onrender.com/login

## What is AroundTheWorld?

AroundTheWorld is an interactive web application designed for travel enthusiasts who want to visualize and track their global adventures. Whether you're a seasoned traveler or just starting your journey, this app helps you:

- **Track Your Travels**: Add countries you've visited to your personal travel map
- **Visualize Your Journey**: See your visited countries highlighted on an interactive world map
- **Manage Your List**: Easily add or remove countries from your visited list
- **Share Your Progress**: Keep track of how many countries you've explored

The application features a user-friendly interface with autocomplete search functionality, making it easy to find and add countries to your travel history. Perfect for travel bloggers, adventure seekers, or anyone who loves to document their global experiences!

## ✨ Features

- **User Authentication**: Simple username-based login system
- **Country Tracking**: Add countries to your visited list
- **Autocomplete Search**: Smart country search with autocomplete suggestions
- **Interactive Map**: Visual representation of visited countries
- **Country Management**: Add and remove countries from your list
- **Responsive Design**: Modern UI that works on all devices

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Frontend**: EJS templating, CSS3
- **Database Driver**: pg (PostgreSQL client for Node.js)
- **Environment Management**: dotenv

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd around-the-world
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your actual database credentials:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=your_database_name
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   ```

4. **Set up the database**
   - Create a PostgreSQL database
   - Use the SQL queries from `queries.sql` to create the required tables
   - Import country data into the `countries` table

5. **Start the application**
   ```bash
   node index.js
   ```

   The application will be available at `http://localhost:3000`

## 🗄️ Database Schema

### Tables

#### `countries`
- `id`: Serial primary key
- `country_code`: 2-character unique country code
- `country_name`: Full country name

#### `visited_countries`
- `id`: Serial primary key
- `country_code`: 2-character country code (foreign key to countries table)

## 🔧 API Endpoints

- `GET /` - Main application page (requires username query parameter)
- `GET /login` - Login page
- `POST /login` - User authentication
- `POST /add` - Add a country to visited list
- `GET /autocomplete` - Get country suggestions for search
- `GET /get-visited-countries` - Get list of visited countries
- `POST /delete-country` - Remove country from visited list

## 📁 Project Structure

```
around-the-world/
├── index.js              # Main server file
├── package.json          # Project dependencies and scripts
├── queries.sql           # Database schema
├── countries.csv         # Country data
├── .env.example          # Environment variables template
├── public/               # Static assets
│   └── styles/          # CSS files
│       ├── login.css    # Login page styles
│       └── main.css     # Main application styles
└── views/               # EJS templates
    ├── header.ejs       # Header component
    ├── index.ejs        # Main application page
    └── login.ejs        # Login page
```

## 🎯 Usage

1. **Login**: Enter your username on the login page
2. **Add Countries**: Search for countries and add them to your visited list
3. **View Progress**: See your visited countries on an interactive map
4. **Manage List**: Remove countries you no longer want to track

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention using parameterized queries
- Environment variable management for sensitive data

## 🚧 Future Enhancements

- User accounts with persistent data
- Country statistics and analytics
- Social features (share travel maps)
- Mobile app version
- Integration with travel APIs

## ⚠️ Important Notes

- **`index-memory.js`**: This file is **NOT for production use**. It's only intended for running the website on Render without a database connection. Use `index.js` for local development with PostgreSQL.

---

**Note**: Make sure to have PostgreSQL running and properly configured before starting the application.
