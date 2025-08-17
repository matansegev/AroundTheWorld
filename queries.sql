--Reuired Queries--
DROP TABLE IF EXISTS visited_countries, 

CREATE TABLE visited_countries(
id SERIAL PRIMARY KEY,
country_code CHAR(2) UNIQUE NOT NULL,
);

CREATE TABLE countries(
id SERIAL PRIMARY KEY,
country_code  CHAR(2) UNIQUE NOT NULL,
country_name VARCHAR(100)
);