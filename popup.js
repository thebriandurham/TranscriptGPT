document.getElementById('findAndCopyBtn').addEventListener('click', () => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { command: 'findAndCopy' });
  });
});

browser.runtime.onMessage.addListener((request) => {
  document.getElementById('status').textContent = request.message;
});

console.log('popup JS loaded...')