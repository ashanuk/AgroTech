const fs = require('fs');
const FormData = require('form-data');

// Test file upload
async function testUpload() {
  try {
    // Create a simple test image buffer
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    
    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://agrotech-1-tbst.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Upload successful:', result);
    } else {
      console.error('Upload failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testUpload();
