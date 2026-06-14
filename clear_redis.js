require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { clearCachePattern } = require('./backend/utils/cache');

async function run() {
  console.log('Clearing Redis cache...');
  await clearCachePattern('courses:*');
  console.log('Done!');
  process.exit(0);
}

run();
