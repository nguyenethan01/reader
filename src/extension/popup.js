// Function to update the status message
function updateStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = isError ? '#dc2626' : '#4b5563';
}

// Function to format the date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}

// Function to format URL for display
function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove protocol and 'www'
    let displayUrl = urlObj.hostname.replace(/^www\./, '');
    // Add path, but truncate if too long
    const path = urlObj.pathname.replace(/\/$/, '');
    if (path) {
      const maxLength = 30;
      displayUrl += path.length > maxLength ? 
        path.substring(0, maxLength) + '...' : 
        path;
    }
    return displayUrl;
  } catch (e) {
    return url;
  }
}

// Function to show recent articles
async function showRecentArticles() {
  try {
    const result = await chrome.storage.local.get('articles');
    const articles = result.articles || [];
    const articleList = document.getElementById('articleList');
    
    if (articles.length === 0) {
      articleList.innerHTML = `
        <div class="empty-state">
          No articles saved yet. Click "Save Article" to get started!
        </div>
      `;
      return;
    }

    // Get the last 5 articles
    const recentArticles = articles.slice(-5).reverse();
    
    // Create HTML for each article
    const articlesHTML = recentArticles.map(article => `
      <div class="article-item" data-url="${article.url}">
        <div class="article-title">${article.title}</div>
        <div class="article-meta">
          ${article.siteName ? article.siteName + ' • ' : ''}
          ${formatDate(article.savedAt)}
        </div>
        <div class="article-url">
          ${formatUrl(article.url)}
        </div>
      </div>
    `).join('');
    
    articleList.innerHTML = articlesHTML;

    // Add click handlers for each article
    articleList.querySelectorAll('.article-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        chrome.tabs.create({ url });
      });
    });
    
  } catch (error) {
    console.error('Error loading recent articles:', error);
    updateStatus('Error loading recent articles', true);
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
      showRecentArticles(); // Refresh the list
    } else {
      throw new Error('Failed to save article');
    }
    
  } catch (error) {
    console.error('Error saving article:', error);
    updateStatus('Error saving article. Please try again.', true);
  }
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  const saveButton = document.getElementById('saveArticle');
  
  // Add click handler for save button
  saveButton.addEventListener('click', parseAndStoreArticle);
  
  // Show recent articles
  await showRecentArticles();
}); 