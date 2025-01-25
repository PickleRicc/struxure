require('dotenv').config();
const { initializeContainers } = require('../utils/azureStorage');

async function init() {
  try {
    await initializeContainers();
    console.log('Azure Storage containers initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Azure Storage containers:', error);
    process.exit(1);
  }
}

init();
