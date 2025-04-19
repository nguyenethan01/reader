// This file will be used for scroll tracking and other page-specific functionality
console.log('Reader content script loaded');

// We'll add scroll tracking functionality here in the next phase 

// Make Readability available in the global scope
let Readability;
if (typeof window.Readability === 'undefined') {
  Readability = window.Readability = require('./readability.js').Readability;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'parseArticle') {
    try {
      // Create a clone of the document
      const documentClone = document.cloneNode(true);
      
      // Parse the article
      const reader = new window.Readability(documentClone);
      const article = reader.parse();
      
      // Send the parsed article back to the popup
      sendResponse({
        success: true,
        article: {
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          byline: article.byline,
          length: article.length,
          siteName: article.siteName,
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Error parsing article:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
    return true; // Keep the message channel open for async response
  }
}); 