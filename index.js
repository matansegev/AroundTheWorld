import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";


// Load environment variables
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));




const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) =>{
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  const username = req.query.username;
  
  if (!username) {
    return res.redirect('/login');
  }
  
  const countries = await checkVisisted();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    username: username
  });
});


app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const username = req.query.username;
  
  try {
  const result = await db.query(
   "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
  );

  const data = result.rows[0];
  const countryCode = data.country_code;
  try{
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",
     [countryCode]
     );
    res.redirect(`/?username=${encodeURIComponent(username)}`);
  }
  catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries:countries,
      total: countries.length,
      username: username,
      error: "Country has already been added, try again",
    });
  }
}
catch (err) {
  console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries:countries,
      total: countries.length,
      username: username,
      error: "Country's name does not exist, try again",
    });
}
});

// New autocomplete endpoint
app.get("/autocomplete", async (req, res) => {
  const query = req.query.q;
  
  if (!query || query.length < 2) {
    return res.json([]);
  }
  
  try {
    const result = await db.query(
      "SELECT country_name FROM countries WHERE LOWER(country_name) LIKE $1 || '%' ORDER BY country_name LIMIT 10",
      [query.toLowerCase()]
    );
    
    const suggestions = result.rows.map(row => row.country_name);
    res.json(suggestions);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
});

// Get visited countries with names
app.get("/get-visited-countries", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT vc.country_code, c.country_name 
      FROM visited_countries vc 
      JOIN countries c ON vc.country_code = c.country_code 
      ORDER BY c.country_name
    `);
    
    res.json(result.rows);
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
    const countries = await checkVisisted();
    return res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      username: username,
      error: "Country code is required"
    });
  }
  
  try {
    const result = await db.query("DELETE FROM visited_countries WHERE country_code = $1", [country_code]);
    if (result.rowCount === 0) {
      const countries = await checkVisisted();
      return res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        username: username,
        error: "Country not found in visited list"
      });
    }
    
    // Redirect back to home page after successful deletion
    res.redirect(`/?username=${encodeURIComponent(username)}`);
  } catch (err) {
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
