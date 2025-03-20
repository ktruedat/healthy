-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS healthisis;

-- Use the database
USE healthisis;

-- Create the diseases table
CREATE TABLE IF NOT EXISTS diseases (
    id String,
    name String,
    category String,
    year UInt16,
    quarter UInt8,
    region String,
    cases UInt32,
    deaths UInt32,
    recoveries UInt32,
    population UInt32,
    incidence_rate Float64,
    mortality_rate Float64,
    environment_data String
) ENGINE = MergeTree()
ORDER BY (year, quarter, category, name, region);

-- Create a view for easy yearly statistics
CREATE VIEW IF NOT EXISTS yearly_disease_stats AS
SELECT
    year,
    category,
    name,
    SUM(cases) AS total_cases,
    SUM(deaths) AS total_deaths,
    SUM(recoveries) AS total_recoveries,
    AVG(incidence_rate) AS avg_incidence_rate,
    AVG(mortality_rate) AS avg_mortality_rate
FROM diseases
GROUP BY year, category, name
ORDER BY year DESC, total_cases DESC;

-- Create a view for quarterly trends
CREATE VIEW IF NOT EXISTS quarterly_trends AS
SELECT
    year,
    quarter,
    category,
    SUM(cases) AS total_cases,
    SUM(deaths) AS total_deaths
FROM diseases
GROUP BY year, quarter, category
ORDER BY year, quarter, total_cases DESC;
