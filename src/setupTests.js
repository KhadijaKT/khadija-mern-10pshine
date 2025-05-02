// src/setupTests.js
import '@testing-library/jest-dom';

// Add TextEncoder and TextDecoder which are required by some dependencies
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}