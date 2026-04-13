import pool from './config/db.js';
async function getCompanyAdmin() {
  try {
    const [users] = await pool.query(
      "SELECT id, email, role, company_id FROM users WHERE role = 'companyadmin' AND company_id IS NOT NULL LIMIT 1"
    );
    if (users.length > 0) {
      console.log(JSON.stringify(users[0]));
    } else {
      console.log("{}");
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
getCompanyAdmin();
