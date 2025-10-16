-- Create database
CREATE DATABASE IF NOT EXISTS lucerne_crowd;
USE lucerne_crowd;

-- Create locations table
CREATE TABLE locations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crowd measurements table
CREATE TABLE crowd_measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id VARCHAR(50) NOT NULL,
    visitor_count INT NOT NULL,
    date DATE NOT NULL,
    hour INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_location_date (location_id, date),
    INDEX idx_date (date)
);

-- Insert locations
INSERT INTO locations (id, name, description) VALUES
('kapellbrücke', 'Kapellbrücke', 'The iconic Chapel Bridge and Water Tower'),
('rathausquai', 'Rathausquai', 'The historic Old Town with its medieval architecture'),
('löwendenkmal', 'Löwendenkmal', 'The famous Lion of Lucerne rock relief'),
('schwanenplatz', 'Schwanenplatz', 'Central square with shopping and cafes'),
('hertensteinstrasse', 'Hertensteinstrasse', 'Lakeside promenade with beautiful views');

-- Insert sample data for the last 30 days
DELIMITER $$
CREATE PROCEDURE GenerateSampleData()
BEGIN
    DECLARE current_date DATE;
    DECLARE day_counter INT DEFAULT 0;
    DECLARE location_id VARCHAR(50);
    DECLARE base_visitors INT;
    DECLARE random_variation INT;
    DECLARE final_visitors INT;
    
    -- Loop through last 30 days
    WHILE day_counter < 30 DO
        SET current_date = DATE_SUB(CURDATE(), INTERVAL day_counter DAY);
        
        -- For each location
        SET location_id = 'kapellbrücke';
        WHILE location_id IS NOT NULL DO
            SELECT id INTO location_id FROM locations LIMIT 1 OFFSET 0;
            
            -- Generate 8 measurements per day (every 3 hours)
            SET @hour = 8;
            WHILE @hour <= 20 DO
                -- Base visitors based on location and day type
                IF location_id = 'kapellbrücke' THEN
                    SET base_visitors = IF(DAYNAME(current_date) IN ('Saturday', 'Sunday'), 90, 50);
                ELSEIF location_id = 'rathausquai' THEN
                    SET base_visitors = IF(DAYNAME(current_date) = 'Saturday', 80, 
                                          IF(DAYNAME(current_date) = 'Sunday', 65, 55));
                ELSEIF location_id = 'löwendenkmal' THEN
                    SET base_visitors = 45;
                ELSEIF location_id = 'schwanenplatz' THEN
                    SET base_visitors = IF(DAYNAME(current_date) = 'Saturday', 85, 60);
                ELSEIF location_id = 'hertensteinstrasse' THEN
                    SET base_visitors = IF(DAYNAME(current_date) IN ('Saturday', 'Sunday'), 70, 40);
                END IF;
                
                -- Adjust for time of day (peak hours)
                IF @hour BETWEEN 11 AND 16 THEN
                    SET base_visitors = base_visitors * 1.3;
                ELSEIF @hour BETWEEN 17 AND 19 THEN
                    SET base_visitors = base_visitors * 1.1;
                ELSE
                    SET base_visitors = base_visitors * 0.7;
                END IF;
                
                -- Add random variation
                SET random_variation = FLOOR(RAND() * 40) - 20;
                SET final_visitors = GREATEST(10, base_visitors + random_variation);
                
                INSERT INTO crowd_measurements (location_id, visitor_count, date, hour)
                VALUES (location_id, final_visitors, current_date, @hour);
                
                SET @hour = @hour + 3;
            END WHILE;
            
            -- Get next location
            SELECT id INTO location_id FROM locations WHERE id > location_id ORDER BY id LIMIT 1;
        END WHILE;
        
        SET day_counter = day_counter + 1;
    END WHILE;
END$$
DELIMITER ;

-- Call the procedure to generate sample data
CALL GenerateSampleData();

-- Drop the procedure after use
DROP PROCEDURE GenerateSampleData;