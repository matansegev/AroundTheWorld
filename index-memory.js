import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// In-memory data storage
let countries = [];
let visitedCountries = [];

// Load countries from CSV file
function loadCountriesFromCSV() {
  const csvData = fs.readFileSync('countries.csv', 'utf8');
  const lines = csvData.split('\n');
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const [id, country_code, country_name] = line.split(',');
      if (country_code && country_name) {
        countries.push({
          id: parseInt(id),
          country_code: country_code,
          country_name: country_name.replace(/"/g, '') // Remove quotes if present
        });
      }
    }
  }
  console.log(`Loaded ${countries.length} countries from CSV`);
}

// Initialize data on startup
loadCountriesFromCSV();

function getVisitedCountries() {
  return visitedCountries;
}

function addVisitedCountry(countryCode) {
  const country = countries.find(c => c.country_code === countryCode);
  if (country && !visitedCountries.includes(countryCode)) {
    visitedCountries.push(countryCode);
    return true;
  }
  return false;
}

function removeVisitedCountry(countryCode) {
  const index = visitedCountries.indexOf(countryCode);
  if (index > -1) {
    visitedCountries.splice(index, 1);
    return true;
  }
  return false;
}

function findCountryByName(input) {
  const searchTerm = input.toLowerCase();
  return countries.find(country => 
    country.country_name.toLowerCase().includes(searchTerm)
  );
}

function searchCountries(query) {
  const searchTerm = query.toLowerCase();
  return countries
    .filter(country => 
      country.country_name.toLowerCase().startsWith(searchTerm)
    )
    .slice(0, 10)
    .map(country => country.country_name);
}

app.get("/", async (req, res) => {
  const username = req.query.username;
  
  if (!username) {
    return res.redirect('/login');
  }
  
  const visited = getVisitedCountries();
  res.render("index.ejs", {
    countries: visited,
    total: visited.length,
    username: username
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const username = req.query.username;
  
  try {
    const country = findCountryByName(input);
    
    if (!country) {
      const visited = getVisitedCountries();
      return res.render("index.ejs", {
        countries: visited,
        total: visited.length,
        username: username,
        error: "Country's name does not exist, try again",
      });
    }

    if (addVisitedCountry(country.country_code)) {
      res.redirect(`/?username=${encodeURIComponent(username)}`);
    } else {
      const visited = getVisitedCountries();
      res.render("index.ejs", {
        countries: visited,
        total: visited.length,
        username: username,
        error: "Country has already been added, try again",
      });
    }
  } catch (err) {
    console.log(err);
    const visited = getVisitedCountries();
    res.render("index.ejs", {
      countries: visited,
      total: visited.length,
      username: username,
      error: "An error occurred, try again",
    });
  }
});

// Autocomplete endpoint
app.get("/autocomplete", async (req, res) => {
  const query = req.query.q;
  
  if (!query || query.length < 2) {
    return res.json([]);
  }
  
  try {
    const suggestions = searchCountries(query);
    res.json(suggestions);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
});

// Get visited countries with names
app.get("/get-visited-countries", async (req, res) => {
  try {
    const visitedWithNames = visitedCountries.map(countryCode => {
      const country = countries.find(c => c.country_code === countryCode);
      return {
        country_code: countryCode,
        country_name: country ? country.country_name : countryCode
      };
    }).sort((a, b) => a.country_name.localeCompare(b.country_name));
    
    res.json(visitedWithNames);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch visited countries" });
  }
});

// Delete country from visited list
app.post("/delete-country", async (req, res) => {
  const country_code = req.body.country_code;
  const username = req.query.username;
  
  if (!country_code) {
    const visited = getVisitedCountries();
    return res.render("index.ejs", {
      countries: visited,
      total: visited.length,
      username: username,
      error: "Country code is required"
    });
  }
  
  try {
    if (removeVisitedCountry(country_code)) {
      res.redirect(`/?username=${encodeURIComponent(username)}`);
    } else {
      const visited = getVisitedCountries();
      res.render("index.ejs", {
        countries: visited,
        total: visited.length,
        username: username,
        error: "Country not found in visited list"
      });
    }
  } catch (err) {
    const visited = getVisitedCountries();
    res.render("index.ejs", {
      countries: visited,
      total: visited.length,
      username: username,
      error: "Failed to delete country"
    });
  }
});

// Login routes
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", (req, res) => {
  const username = req.body.username.trim();
  
  if (!username) {
    return res.redirect("/login");
  }
  
  // Redirect to main page with username as query parameter
  res.redirect(`/?username=${encodeURIComponent(username)}`);
});

// Reset data endpoint (useful for demo)
app.post("/reset", (req, res) => {
  visitedCountries = [];
  res.json({ message: "Data reset successfully" });
});

// Get all countries (for debugging)
app.get("/all-countries", (req, res) => {
  res.json(countries);
});

app.listen(port, () => {
  console.log(`Memory-based Travel Tracker running on http://localhost:${port}`);
  console.log(`Loaded ${countries.length} countries into memory`);
});
