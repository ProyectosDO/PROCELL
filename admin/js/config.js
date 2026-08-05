const SUPABASE_URL = "https://zfbzmaefmaromelcpmbw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmYnptYWVmbWFyb21lbGNwbWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MDMzNDAsImV4cCI6MjEwMTE3OTM0MH0.TgyABNvMgiSriSs3jDI5TAsxj4pv0cjKY27Cm5_-DnM";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);