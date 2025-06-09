// src/data/ai/welcomeMessages.js

const welcomeMessages = {
  binary: `🎓 Welcome! I'm your AI Assistant here to help you learn about **Binary Numbers**.  
You can ask questions, practice problems, or explore concepts.

🧠 At any point, you can take the **Binary Numbers Quiz** to earn credit toward completing this module.`,

  octal: (title) => `🎓 Welcome! I'm your AI Assistant here to help you learn about **${title}**.  
You can ask questions, practice problems, or explore concepts.

🧠 At any point, you can take the **${title} Quiz** to earn credit toward completing this module.`,

  hexadecimal: (title) => `🎓 Welcome! I'm your AI Assistant here to help you learn about **${title}**.  
You can ask questions, practice problems, or explore concepts.

🧠 At any point, you can take the **${title} Quiz** to earn credit toward completing this module.`,

  bcd: (title) => `🎓 Welcome! I'm your AI Assistant here to help you learn about **${title}**.  
You can ask questions, practice problems, or explore concepts.

🧠 At any point, you can take the **${title} Quiz** to earn credit toward completing this module.`,

  gray_code: (title) => `🎓 Welcome! I'm your AI Assistant here to help you learn about **${title}**.  
You can ask questions, practice problems, or explore concepts.

🧠 At any point, you can take the **${title} Quiz** to earn credit toward completing this module.`,

  general: (title) => `👋 Welcome! I'm your AI Assistant here to help with **${title}**.  
Ask me anything to get started!`
};

export default welcomeMessages;
