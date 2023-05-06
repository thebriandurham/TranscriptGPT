browser.runtime.onMessage.addListener((request) => {
  if (request.command === 'findAndCopy') {
    findElementAndCopy();
  }
});

function copyToClipboard(text) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function findElementAndCopy() {
  const targetElements = document.querySelectorAll('.group.w-full');
  if (targetElements.length > 0) {
    const conversation = Array.from(targetElements)
      .map((element) => {
        let textContent = element.textContent;
        if (textContent.includes("ChatGPTChatGPT1 / 1")) {
          textContent = textContent.replace("ChatGPTChatGPT1 / 1", "`USER-END` `GPT-START`ChatGPT:\n");
        } else if (textContent.includes("1 / 1") && !textContent.includes("ChatGPTChatGPT")) {
          textContent = textContent.replace("1 / 1", "`USER-START`User:\n");
        } 
        return textContent.trim();
      })
      .join('\n');

    const conversationText = generateConversation(conversation);
    copyToClipboard(conversationText);

    browser.runtime.sendMessage({ message: 'GPT chat copied!' });
  } else {
    browser.runtime.sendMessage({ message: 'Error finding chat!' });
  }
}

function generateConversation(blob) {
  // Define the start and end tags for both USER and GPT
  const userStartTag = '`USER-START`';
  const userEndTag = '`USER-END`';
  const gptStartTag = '`GPT-START`';
  const gptEndTag = '`USER-START`';

  // Use regex to find all matching text blocks for both USER and GPT
  const userRegexPattern = `${userStartTag}(.*?)(${userEndTag})`;
  const gptRegexPattern = `${gptStartTag}(.*?)(?:${gptEndTag}|$)`;

  const userRegex = new RegExp(userRegexPattern, 'gs');
  const gptRegex = new RegExp(gptRegexPattern, 'gs');

  const userMatches = blob.match(userRegex) || [];
  const gptMatches = blob.match(gptRegex) || [];

  // Create a list to store the conversation text blocks with delimiter
  const conversation = [];

  // Add each matching text block in turn, alternating between USER and GPT
  const maxMatches = Math.max(userMatches.length, gptMatches.length);

  for (let i = 0; i < maxMatches; i++) {
    if (i < userMatches.length) {
      conversation.push(`\n\`\`\`\nUSER Match ${i + 1}:`);
      conversation.push(userMatches[i].replace(userStartTag,'').replace(userEndTag,'').trim());
      conversation.push('```');
    }

    if (i < gptMatches.length) {
      conversation.push(`\n\`\`\`\nGPT Match ${i + 1}:`);
      conversation.push(gptMatches[i].replace(gptStartTag,'').replace(gptEndTag,'').trim());
      conversation.push('```');
    }
  }

  // Join the conversation text blocks and return the result
  return conversation.join('\n');
}