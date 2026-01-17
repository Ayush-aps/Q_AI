import { neon } from '@neondatabase/serverless';

// Enable connection pooling for better performance
const sql = neon(process.env.DATABASE_URL, {
  fetchConnectionCache: true,
});

export default sql;