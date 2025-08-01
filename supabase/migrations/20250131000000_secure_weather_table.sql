-- Enable RLS on weather table
ALTER TABLE public.weather ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view weather data for locations where they have logs
CREATE POLICY "Users can view weather for their log locations" ON public.weather
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.log 
    WHERE log.user_id = auth.uid() 
    AND log.latitude = weather.latitude 
    AND log.longitude = weather.longitude
  )
);

-- Create policy to allow insertion of weather data (for your weather webhook)
CREATE POLICY "Allow weather data insertion" ON public.weather
FOR INSERT WITH CHECK (true);

-- Create policy to allow updates of weather data (for your weather webhook)
CREATE POLICY "Allow weather data updates" ON public.weather
FOR UPDATE USING (true);

-- Add unique constraint to prevent duplicate weather records for same location and date
ALTER TABLE public.weather 
ADD CONSTRAINT weather_location_date_unique 
UNIQUE (latitude, longitude, date);

-- Add index for better performance on location queries
CREATE INDEX idx_weather_location ON public.weather (latitude, longitude, date); 