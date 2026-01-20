// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SrJ4GPdwGSXGQTKpKZXFUvPchWkJK1Gt6aHw38z9kWwzaA6Jjc6ommhaeicCLL8lM4XerhqTPtyWGqIw6wAfJSi00etnB3zyo';

// API Configuration (deprecated - use Supabase Edge Functions)
export const API_BASE_URL = 'http://192.168.30.107:3000';

// Supabase Configuration
export const SUPABASE_URL = 'https://pxrakmxiodlfqwsycmdw.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cmFrbXhpb2RsZnF3c3ljbWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNzA2MDIsImV4cCI6MjA1Mjg0NjYwMn0.yqNuSdX1Kh6xVZ95rC8JZ7GlF7CHlSrqwJKQZEj7bRg'; // ← Lấy từ Supabase Dashboard
export const SUPABASE_PASSWORD = '2JcAvNYty8d!R%b';

// Supabase Edge Functions
export const SUPABASE_FUNCTIONS = {
  CREATE_PAYMENT_INTENT: `${SUPABASE_URL}/functions/v1/create-payment-intent`,
};
        