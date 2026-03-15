// Helper script na generovanie bcrypt hash pre heslo
// Použitie: node generate-hash.js "tvojeheslo"

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Chyba:', err);
    return;
  }

  console.log('\n=================================');
  console.log('BCRYPT HASH GENERATOR');
  console.log('=================================');
  console.log(`Heslo: ${password}`);
  console.log(`Hash:  ${hash}`);
  console.log('=================================\n');
  console.log('Použitie v SQL:');
  console.log(`INSERT INTO users (email, password_hash, role, company_id)`);
  console.log(`VALUES ('admin@montio.sk', '${hash}', 'superadmin', NULL);\n`);
});
