const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    supabase = null;
    logger.warn('Supabase not configured — file upload features will be unavailable');
  }
} catch (err) {
  supabase = null;
  logger.warn({ err: err.message }, 'Supabase init failed');
}

module.exports = supabase;