const bcrypt = require('bcrypt');

(async () => {
  const password = process.env.ADMIN_PASSWORD || process.argv[2];
  if (!password) {
    console.error('Usage: ADMIN_PASSWORD=your_password node backend/hash.js');
    console.error('   or: node backend/hash.js your_password');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
})();
