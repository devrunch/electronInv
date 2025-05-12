/**
 * Send prescription information via WhatsApp using AiSensy API
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string[]} templateParams - The parameters to fill into the WhatsApp template
 * @returns {Promise} - Promise that resolves to the API response
 */
async function sendPrescriptionViaWhatsapp(phoneNumber, templateParams, mediaUrl) {
    const data = {
      "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGVhNWY4ODk4NjY3NjEwOGYwNjYyMSIsIm5hbWUiOiJTcmkgSmkgU2V2YSBTYW5zdGhhbiAiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjdkZWE1Zjc4OTg2Njc2MTA4ZjA2NjFjIiwiYWN0aXZlUGxhbiI6IkZSRUVfRk9SRVZFUiIsImlhdCI6MTc0MjY0NDcyOH0.dL2PlCL38U9xw3kctLGI_MYcNgvqrTJfSwFQpEP6FZM",
      "campaignName": "Prescription",
      "destination": phoneNumber,
      "userName": "Sri Ji Seva Sansthan ",
      "templateParams": templateParams,
      "source": "new-landing-page form",
      "media": {
        "url": mediaUrl,
        "filename": "prescription"
      },
      "buttons": [],
      "carouselCards": [],
      "location": {},
      "attributes": {},
      "paramsFallbackValue": {
        "FirstName": templateParams[0]
      }
    };
  
    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.error('Error sending prescription:', response.statusText);
      console.error('Response:', await response.text());
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  }
  module.exports = { sendPrescriptionViaWhatsapp };