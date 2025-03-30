// src/data/ai/welcomeMessages.js

const welcomeMessages = {
  binary: (title) => `👋 Welcome! I'm your AI Assistant here to help you master ${title}.

You can choose how you’d like to get started:

1️⃣ **Explain ${title}** – I’ll walk you through the concept step by step.  
2️⃣ **Give Me a Practice Problem** – Try solving a ${title.toLowerCase()} conversion with my help.  
3️⃣ **Quiz Me** – I’ll generate a quick challenge to test your knowledge.

📊 I’ll monitor your progress as you interact in this chat.  
Ready when you are — just type your question to get started!`,

  octal: (title) => `👋 Welcome! I'm your AI Assistant here to help you master ${title}.

Here’s how you can begin:

1️⃣ **Understand ${title}** – Learn how octal groups binary digits in sets of 3.  
2️⃣ **Practice Conversions** – Try converting between octal, binary, and decimal.  
3️⃣ **Test Me** – I’m ready to quiz you!

📊 Progress will be tracked right here. Ask away!`,

  hexadecimal: (title) => `👋 Welcome! I'm your AI Assistant here to help you master ${title}.

Let’s begin:

1️⃣ **Understand ${title}** – Learn about base 16 and conversions.  
2️⃣ **Practice** – I’ll walk you through problems.  
3️⃣ **Quiz Me** – Let’s test your skills!

📊 I’ll track your progress as we go.`,

  // 🔁 Add more like `bcd`, `gray_code`, etc. below

  general: (title) => `👋 Welcome! I'm your AI Assistant here to help with ${title}.

Ask me anything to get started!`
};

export default welcomeMessages;
