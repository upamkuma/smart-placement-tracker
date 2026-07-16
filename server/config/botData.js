/**
 * botData.js
 *
 * Static data for the SPT Bot auto-reply system.
 * Contains room-specific tips and keyword-triggered responses.
 * Consumed by config/socket.js.
 */

/**
 * Room-specific tip arrays.
 * When no keyword matches, a random tip from the current room is sent.
 * @type {Record<string, string[]>}
 */
const botReplies = {
  general: [
    "💡 Tip: Keep your LinkedIn profile updated with your latest projects and skills. Recruiters check it!",
    "📌 Did you know? Companies typically take 1-2 weeks to respond after applying. Stay patient and keep applying!",
    "🎯 Pro tip: Apply to at least 5-10 positions per week to maximize your chances. Quality over quantity though!",
    "📊 Track every application here on SPT to stay organized. It really helps during placement season!",
    "🌟 Networking is key! Connect with alumni and attend virtual career fairs to get referrals.",
    "💼 Most companies have multiple interview rounds. Prepare for technical, HR, and group discussions!",
    "🔑 Always customize your resume for each job application. One size does NOT fit all!",
    "📝 Follow up with a thank-you email after interviews. It shows professionalism and genuine interest.",
  ],
  "interview-tips": [
    "🎯 For technical interviews: Practice DSA on LeetCode/HackerRank for at least 1 hour daily.",
    "💡 STAR Method: Structure your behavioral answers as Situation → Task → Action → Result.",
    "📝 Always research the company before the interview. Know their products, culture, and recent news.",
    "🤝 Prepare 3-5 good questions to ask the interviewer. It shows genuine interest in the role!",
    "⏰ Join 5 minutes early for video interviews. Test your camera, mic, and internet beforehand.",
    "👔 Dress professionally even for video calls. First impressions matter!",
    "🧠 For system design interviews: Think aloud! Interviewers want to see your thought process.",
    "💪 Practice mock interviews with friends or on Pramp.com. It builds confidence!",
    "📌 Common mistake: Don't just say 'I worked on X.' Instead, explain the WHY and IMPACT.",
  ],
  "resume-help": [
    "📄 Keep your resume to 1 page if you have less than 5 years of experience.",
    "✅ Use action verbs: 'Built', 'Implemented', 'Optimized', 'Led' — not 'Responsible for'.",
    "📊 Quantify achievements! 'Improved API response time by 40%' is better than 'Improved performance'.",
    "🎨 Use our ATS Score feature to check how well your resume matches a job description!",
    "💡 Include a skills section with technologies from the job description. ATS systems scan for keywords.",
    "🔗 Add links to your GitHub, LinkedIn, and live project demos. Make it easy for recruiters!",
    "❌ Avoid: Selfies as profile photos, fancy fonts, tables/columns (ATS can't read them), or typos.",
    "📝 Tailor your summary/objective for each application. Generic statements don't stand out.",
  ],
  "offer-negotiation": [
    "💰 Research salary ranges on Glassdoor and Levels.fyi before negotiating. Know your market value!",
    "📊 For freshers, typical CTC in India: ₹3-6 LPA (service), ₹8-15 LPA (product), ₹15-40+ LPA (top tier).",
    "🤝 Always negotiate politely: 'Based on my skills and market research, I was expecting around X...'",
    "📝 Consider the full package: base salary, bonuses, stock options, learning opportunities, and WLB.",
    "💡 It's okay to ask for time to consider an offer. Say: 'I'd like a few days to review this.'",
    "✅ Get the offer in writing before accepting verbally. Review all terms carefully.",
    "🎯 If you have multiple offers, be transparent (but tactful) to get the best deal.",
    "💼 Remember: Your first job sets the baseline. Negotiate well — even a small bump compounds over time!",
  ],
  "off-topic": [
    "😄 Taking breaks is important! The Pomodoro technique works great: 25 min work, 5 min break.",
    "🎮 What's everyone's favorite coding playlist? Music really helps with focus!",
    "☕ Fun fact: The average developer drinks 3+ cups of coffee per day. Stay hydrated too!",
    "📚 Book recommendation: 'Cracking the Coding Interview' by Gayle McDowell — a must-read!",
    "🏃 Don't forget physical health during placement season. Even a 20-minute walk helps!",
    "🤖 AI is changing tech hiring. Brush up on ML basics even if you're not an ML engineer.",
    "🌍 Remote work is here to stay. Build skills in async communication and self-management.",
    "💬 Remember: Placement season stress is temporary. Your worth isn't defined by a single company's decision!",
  ],
};

/**
 * Keyword-triggered contextual replies.
 * Each entry has a list of trigger keywords and a reply function.
 * Checked before falling back to room-specific tips.
 *
 * @type {Array<{ keywords: string[], reply: (name: string) => string }>}
 */
const keywordReplies = [
  {
    keywords: ["hello", "hi", "hey", "hii", "helo"],
    reply: (name) =>
      `Hey ${name}! 👋 Welcome to the chat! Feel free to discuss anything placement-related. I'm here to help!`,
  },
  {
    keywords: ["help", "stuck", "confused", "don't know", "what should"],
    reply: (name) =>
      `Don't worry ${name}! 💪 Every placement journey has ups and downs. What specific area do you need help with? Resume, interviews, or applications?`,
  },
  {
    keywords: ["reject", "rejected", "not selected", "failed"],
    reply: (name) =>
      `Hey ${name}, rejections are part of the journey! 🌟 Even top engineers faced many rejections before landing their dream job. Keep improving and applying!`,
  },
  {
    keywords: ["offer", "selected", "got placed", "placed", "accepted"],
    reply: (name) =>
      `🎉 Congratulations ${name}! That's amazing news! Hard work pays off. Don't forget to help others in their journey too!`,
  },
  {
    keywords: ["dsa", "leetcode", "algorithm", "data structure"],
    reply: () =>
      `📚 For DSA prep: Start with Easy problems → Medium → Hard. Focus on Arrays, Strings, Trees, Graphs, and DP. Aim for 200+ problems for good coverage!`,
  },
  {
    keywords: ["resume", "cv", "ats"],
    reply: () =>
      `📄 Check out our ATS Score page! Upload your resume and match it against a job description to see how well it performs. Click 'ATS Score' in the navbar.`,
  },
  {
    keywords: ["salary", "ctc", "package", "lpa"],
    reply: () =>
      `💰 Salary depends on company, role, and location. Research on Glassdoor/Levels.fyi. For freshers: Service (3-6 LPA) | Product (8-15 LPA) | Top Tier (15-40+ LPA).`,
  },
  {
    keywords: ["thank", "thanks", "thx"],
    reply: (name) =>
      `You're welcome, ${name}! 😊 Happy to help. All the best for your placements! 🚀`,
  },
];

module.exports = { botReplies, keywordReplies };
