// Reset popup flags in localStorage to test the popups again

console.log('Resetting popup flags...');

// Clear the flags
localStorage.removeItem('terms-accepted');
localStorage.removeItem('welcome-seen');

console.log('✅ Popup flags reset!');
console.log('Refresh the page to see the Terms popup, then the Welcome popup will appear after accepting.');
