// src/setupTests.js
import '@testing-library/jest-dom';
import { Buffer } from 'buffer';

// تهيئة كاملة لـ Buffer
global.Buffer = Buffer;
global.Buffer.alloc = Buffer.alloc;
global.Buffer.from = Buffer.from;
global.Buffer.isBuffer = Buffer.isBuffer;

// حل مشكلة process
global.process = {
    ...global.process,
    env: { ...global.process?.env, NODE_ENV: 'test' },
    version: '',
    nextTick: (callback) => setTimeout(callback, 0),
    browser: true,
};

// حل مشكلات TextEncoder و TextDecoder
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}