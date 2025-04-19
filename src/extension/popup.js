// Function to update the status message
function updateStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = isError ? '#dc2626' : '#4b5563';
}

// Function to show a preview of the parsed article
function showPreview(article) {
  const preview = document.getElementById('preview');
  if (article) {
    preview.innerHTML = `
      <strong>${article.title}</strong><br>
      <div style="margin-top: 8px">${article.excerpt ? article.excerpt.substring(0, 150) + '...' : ''}</div>
    `;
  } else {
    preview.innerHTML = '';
  }
}

// Function to save article to storage
async function saveToStorage(article) {
  try {
    // Get existing articles
    const result = await chrome.storage.local.get('articles');
    const articles = result.articles || [];
    
    // Add new article
    articles.push({
      ...article,
      savedAt: new Date().toISOString()
    });

    // Save back to storage
    await chrome.storage.local.set({ articles });
    
    return true;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return false;
  }
}

// Main function to parse and store the article
async function parseAndStoreArticle() {
  try {
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Execute the script in the context of the page
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['readability.js']
    });

    // Now that Readability is injected, parse the article
    const [{ result: article }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const documentClone = document.cloneNode(true);
        const reader = new window.Readability(documentClone);
        const article = reader.parse();
        return {
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          byline: article.byline,
          length: article.length,
          siteName: article.siteName,
          url: window.location.href,
          timestamp: new Date().toISOString()
        };
      }
    });

    // Save to storage
    const saved = await saveToStorage(article);
    
    if (saved) {
      updateStatus('Article saved successfully!');
      showPreview(article);
    } else {
      throw new Error('Failed to save article');
    }
    
  } catch (error) {
    console.error('Error saving article:', error);
    updateStatus('Error saving article. Please try again.', true);
  }
}

// Function to load and display the most recent article
async function loadMostRecentArticle() {
  try {
    const result = await chrome.storage.local.get('articles');
    const articles = result.articles || [];
    if (articles.length > 0) {
      showPreview(articles[articles.length - 1]);
    }
  } catch (error) {
    console.error('Error loading recent article:', error);
  }
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  const saveButton = document.getElementById('saveArticle');
  
  // Add click handler for save button
  saveButton.addEventListener('click', parseAndStoreArticle);
  
  // Show the most recently saved article if any
  await loadMostRecentArticle();
}); 