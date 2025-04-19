// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Reader extension installed');
  
  // Initialize storage with empty articles array
  chrome.storage.local.get('articles', (data) => {
    if (!data.articles) {
      chrome.storage.local.set({ articles: [] });
    }
  });
}); 