/**
 * Certificate Path Test Script
 * 
 * This script tests if the certificate file can be found
 * in any of the expected locations. Use it to troubleshoot
 * deployment issues.
 */

const fs = require('fs');
const path = require('path');

// All potential certificate locations
const certLocations = [
  path.join(__dirname, 'certs', 'isrgrootx1.pem'),    // Certs directory (preferred)
  path.join(__dirname, 'isrgrootx1.pem'),             // Local development
  '/var/task/certs/isrgrootx1.pem',                   // Vercel with certs dir
  '/var/task/isrgrootx1.pem',                         // Vercel
  '/var/task/backend/isrgrootx1.pem',                 // Vercel with subfolder
  '/var/task/backend/certs/isrgrootx1.pem',           // Vercel with backend/certs
  path.join(process.cwd(), 'certs', 'isrgrootx1.pem'), // Alternative with certs dir
  path.join(process.cwd(), 'isrgrootx1.pem'),          // Alternative local path
  path.join(process.cwd(), 'backend/isrgrootx1.pem'),  // Alternative subfolder
  path.join(process.cwd(), 'backend/certs/isrgrootx1.pem') // Alternative with backend/certs
];

console.log('🔍 Certificate Finder - Deployment Test');
console.log('=======================================');
console.log(`Current directory: ${__dirname}`);
console.log(`Process working directory: ${process.cwd()}`);
console.log('---------------------------------------');

let certFound = false;

// Test each location
for (const certPath of certLocations) {
  try {
    if (fs.existsSync(certPath)) {
      console.log(`✅ FOUND: ${certPath}`);
      
      // Try reading it to make sure we have access
      try {
        const certContent = fs.readFileSync(certPath, 'utf8');
        const certLines = certContent.split('\n').length;
        console.log(`   → Successfully read certificate (${certLines} lines)`);
        certFound = true;
      } catch (readErr) {
        console.log(`   ❌ ERROR reading certificate: ${readErr.message}`);
      }
    } else {
      console.log(`❌ NOT FOUND: ${certPath}`);
    }
  } catch (err) {
    console.log(`❌ ERROR checking path ${certPath}: ${err.message}`);
  }
}

console.log('---------------------------------------');

// Check for environment variable
if (process.env.DB_CA_CERT) {
  console.log('✅ DB_CA_CERT environment variable is set');
  console.log(`   Length: ${process.env.DB_CA_CERT.length} characters`);
} else {
  console.log('❌ DB_CA_CERT environment variable is NOT set');
}

// Final status
console.log('---------------------------------------');
if (certFound) {
  console.log('✅ CERTIFICATE FOUND: Deployment should work correctly');
} else if (process.env.DB_CA_CERT) {
  console.log('✅ USING ENV VARIABLE: Deployment should work correctly');
} else {
  console.log('❌ NO CERTIFICATE AVAILABLE: Deployment might fail');
}

// List directory contents to help troubleshoot
console.log('\nDirectory contents:');
try {
  const currentDirContents = fs.readdirSync(__dirname);
  console.log(`Contents of ${__dirname}:`);
  currentDirContents.forEach(item => console.log(` - ${item}`));
  
  // Check for certs directory
  const certsDir = path.join(__dirname, 'certs');
  if (fs.existsSync(certsDir)) {
    console.log(`\nContents of ${certsDir}:`);
    const certsDirContents = fs.readdirSync(certsDir);
    certsDirContents.forEach(item => console.log(` - ${item}`));
  }
} catch (error) {
  console.log(`Error listing directory: ${error.message}`);
} 