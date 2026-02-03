-- Add geolocation columns to visitor_sessions table
ALTER TABLE visitor_sessions
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS isp VARCHAR(255) DEFAULT 'Unknown';

-- Create index for faster geolocation queries
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_city ON visitor_sessions(city);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_coordinates ON visitor_sessions(latitude, longitude);

-- Verify the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visitor_sessions' 
ORDER BY ordinal_position;
