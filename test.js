#!/usr/bin/env node

/**
 * Test script for M3U8 Proxy
 * This script demonstrates how to use the proxy with example M3U8 files
 */

const axios = require('axios');

const PROXY_BASE = 'http://localhost:8080';

async function test() {
  try {
    console.log('Testing M3U8 Proxy Server...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthRes = await axios.get(`${PROXY_BASE}/health`);
    console.log('✓ Server is healthy:', healthRes.data.status, '\n');
    
    // Test 2: Get API info
    console.log('2. Fetching API information...');
    const infoRes = await axios.get(`${PROXY_BASE}/`);
    console.log('✓ API Info:', infoRes.data.name);
    console.log('  Usage:', infoRes.data.usage, '\n');
    
    // Test 3: Proxy a test M3U8 (you would replace with real URL)
    console.log('3. Example proxy request:');
    const exampleUrl = 'https://example.com/playlist.m3u8';
    const proxyUrl = `${PROXY_BASE}/proxy?url=${encodeURIComponent(exampleUrl)}`;
    console.log('   Proxy URL:', proxyUrl);
    console.log('   (Note: This would fetch and rewrite the M3U8 from the provided URL)\n');
    
    console.log('✓ All tests passed! Server is ready to use.\n');
    console.log('Usage:');
    console.log(`  curl "${PROXY_BASE}/proxy?url=https://your-m3u8-url.com/stream.m3u8"`);
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error('\nMake sure the server is running:');
    console.error('  npm start');
    process.exit(1);
  }
}

test();
