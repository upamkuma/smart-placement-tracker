import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";

// --- Mock Data ---

const mockMCQQuestions = [
  { id: 1, question: "What is the time complexity of searching in a balanced Binary Search Tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 1 },
  { id: 2, question: "Which of the following is NOT a hook in React?", options: ["useState", "useEffect", "useHistory", "useFetch"], answer: 3 },
  { id: 3, question: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"], answer: 1 },
  { id: 4, question: "In JavaScript, what is the output of 'typeof null'?", options: ["'null'", "'undefined'", "'object'", "'string'"], answer: 2 },
  { id: 5, question: "Which SQL clause is used to filter records before grouping them?", options: ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], answer: 0 },
  { id: 6, question: "What port does HTTP run on by default?", options: ["21", "22", "80", "443"], answer: 2 },
  { id: 7, question: "In Git, what command is used to save your changes locally without committing?", options: ["git stash", "git save", "git commit", "git push"], answer: 0 },
  { id: 8, question: "What is the primary purpose of a Load Balancer?", options: ["To store data securely", "To distribute incoming network traffic across multiple servers", "To cache static files", "To encrypt passwords"], answer: 1 },
  { id: 9, question: "Which status code represents 'Not Found' in HTTP?", options: ["200", "401", "403", "404"], answer: 3 },
  { id: 10, question: "What does 'M' stand for in the MERN stack?", options: ["MySQL", "MongoDB", "Mongoose", "MariaDB"], answer: 1 }
];

const questionBankData = {
  "HTML & CSS": [
    { q: "What is semantic HTML and why is it important?", a: "Semantic HTML uses tags (like <article>, <header>, <nav>) that clearly describe their meaning. It improves accessibility for screen readers, boosts SEO, and makes code easier to maintain." },
    { q: "Explain the CSS Box Model.", a: "It's a box that wraps around every HTML element. It consists of: margins (outer space), borders, padding (inner space), and the actual content." },
    { q: "What is the difference between Flexbox and CSS Grid?", a: "Flexbox is designed for 1-dimensional layouts (either a row or a column). CSS Grid is designed for 2-dimensional layouts (rows and columns simultaneously)." },
    { q: "What is z-index and how does it work?", a: "z-index controls the vertical stacking order of elements that overlap. It only works on positioned elements (relative, absolute, fixed, or sticky)." },
    { q: "Explain the difference between 'display: none' and 'visibility: hidden'.", a: "'display: none' removes the element from the document flow completely (takes up no space). 'visibility: hidden' hides the element but it still takes up space in the layout." },
    { q: "What are CSS Preprocessors?", a: "Tools like Sass or LESS that extend CSS with variables, nesting, mixins, and functions, making CSS more maintainable and compiling down to standard CSS." }
  ],
  "JavaScript": [
    { q: "What are closures in JavaScript?", a: "A closure is a function that remembers its outer variables and can access them. It's created every time a function is created, at function creation time." },
    { q: "Explain Event Delegation.", a: "A technique involving adding event listeners to a parent element instead of adding them to the descendant elements. It uses event bubbling to catch events from children." },
    { q: "What is the difference between let, const, and var?", a: "'var' is function-scoped and hoisted. 'let' and 'const' are block-scoped and not hoisted in the same way. 'let' can be reassigned, 'const' cannot." },
    { q: "Explain Promises and Async/Await.", a: "Promises represent the eventual completion of an asynchronous operation. Async/Await is syntax sugar over Promises, making asynchronous code look and behave a bit more like synchronous code." },
    { q: "What is the 'this' keyword?", a: "'this' refers to the object that is executing the current function. Its value depends on how the function is called (e.g., as a method, alone, in strict mode, or via call/apply/bind)." },
    { q: "Explain Hoisting in JavaScript.", a: "Hoisting is JavaScript's default behavior of moving declarations to the top of the current scope before code execution. Only declarations are hoisted, not initializations." },
    { q: "What is the difference between == and ===?", a: "== compares values with type coercion (e.g., '1' == 1 is true). === compares both value and type without coercion (e.g., '1' === 1 is false)." }
  ],
  "React.js": [
    { q: "What is the Virtual DOM?", a: "A lightweight copy of the actual DOM that React uses to optimize updates. React compares the Virtual DOM to the real DOM (reconciliation) and only updates what changed." },
    { q: "Explain the useEffect hook.", a: "It lets you perform side effects in functional components, like data fetching, manual DOM mutations, or subscriptions. It takes a dependency array to control when it runs." },
    { q: "What is prop drilling and how do you avoid it?", a: "Prop drilling is passing props down through multiple nested components that don't need them. Avoid it using the Context API, Redux, or Zustand." },
    { q: "What is the difference between controlled and uncontrolled components?", a: "In a controlled component, form data is handled by React state. In an uncontrolled component, form data is handled directly by the DOM using refs." },
    { q: "What are React Server Components?", a: "Components that run exclusively on the server, resulting in zero bundle size on the client and direct access to backend resources like databases." },
    { q: "Explain useMemo and useCallback.", a: "useMemo caches the result of a calculation between renders. useCallback caches a function definition between renders. Both are used for performance optimization." }
  ],
  "Next.js": [
    { q: "What is the difference between SSR and SSG?", a: "Server-Side Rendering (SSR) generates HTML on each request. Static Site Generation (SSG) generates HTML at build time, making it much faster to serve via CDN." },
    { q: "What is the App Router in Next.js 13+?", a: "A new routing paradigm built on React Server Components, offering nested layouts, streaming, and a directory-based routing system." },
    { q: "How does Next.js handle Image Optimization?", a: "The next/image component automatically optimizes images by serving correctly sized formats (like WebP) based on the device, and lazy loads them to improve core web vitals." },
    { q: "What is ISR (Incremental Static Regeneration)?", a: "ISR allows you to update static pages after you've built your site. You can trigger rebuilds of specific pages in the background without needing a full site rebuild." }
  ],
  "Node.js & Express.js": [
    { q: "What is the Event Loop in Node.js?", a: "The mechanism that allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel, despite JavaScript being single-threaded." },
    { q: "What is middleware in Express?", a: "Functions that have access to the request (req) and response (res) objects. They can execute code, modify the req/res objects, end the cycle, or call next()." },
    { q: "How do you handle errors in Express?", a: "By using an error-handling middleware function that takes 4 arguments: (err, req, res, next). It should be placed at the end of all route and middleware definitions." },
    { q: "What is CORS?", a: "Cross-Origin Resource Sharing. It's an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources." },
    { q: "What are streams in Node.js?", a: "Streams are objects that let you read data from a source or write data to a destination in a continuous fashion, useful for handling large files without consuming too much memory." }
  ],
  "MongoDB": [
    { q: "What is the difference between SQL and NoSQL?", a: "SQL databases are relational, table-based, and have strict schemas. NoSQL databases (like MongoDB) are non-relational, document-based, and have dynamic schemas for unstructured data." },
    { q: "What is an index in MongoDB?", a: "Indexes support the efficient execution of queries. Without indexes, MongoDB must perform a collection scan (scan every document) to select those that match the query." },
    { q: "What is the Aggregation Framework?", a: "A pipeline-based framework for data aggregation in MongoDB. Documents enter a multi-stage pipeline that transforms them into aggregated results (like $match, $group, $sort)." },
    { q: "What is Mongoose?", a: "An Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straight-forward, schema-based solution to model application data." },
    { q: "What is Sharding?", a: "Sharding is a method for distributing data across multiple machines. MongoDB uses sharding to support deployments with very large data sets and high throughput operations." }
  ],
  "SQL": [
    { q: "What is a Primary Key vs Foreign Key?", a: "A Primary Key uniquely identifies a record in a table. A Foreign Key is a field in one table that uniquely identifies a row of another table, establishing a relationship." },
    { q: "Explain the different types of JOINs.", a: "INNER JOIN (returns records with matching values in both), LEFT JOIN (returns all from left, matched from right), RIGHT JOIN (all from right, matched from left), FULL OUTER JOIN (returns all when there is a match in either)." },
    { q: "What is Normalization?", a: "The process of organizing data in a database to reduce redundancy and improve data integrity, typically divided into normal forms (1NF, 2NF, 3NF)." },
    { q: "What is an Index in SQL?", a: "A data structure that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space." },
    { q: "What is the difference between WHERE and HAVING?", a: "WHERE is used to filter rows before aggregation (GROUP BY). HAVING is used to filter groups after the aggregations are applied." },
    { q: "What is a Transaction? (ACID properties)", a: "A logical unit of work. ACID stands for Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent execution is safe), Durability (saved permanently)." }
  ],
  "System Design": [
    { q: "What is a Load Balancer?", a: "A device that distributes network or application traffic across a number of servers to increase capacity, reliability, and ensure no single server is overwhelmed." },
    { q: "Explain Horizontal vs Vertical Scaling.", a: "Vertical Scaling: Adding more power (CPU, RAM) to an existing machine. Horizontal Scaling: Adding more machines to your pool of resources." },
    { q: "What is a Load Balancer?", a: "A device that distributes network or application traffic across a number of servers to increase capacity, reliability, and ensure no single server is overwhelmed." },
    { q: "Explain Horizontal vs Vertical Scaling.", a: "Vertical Scaling: Adding more power (CPU, RAM) to an existing machine. Horizontal Scaling: Adding more machines to your pool of resources." },
    { q: "What is Caching and where is it used?", a: "Caching stores copies of frequently accessed data in a temporary, fast-access layer (like Redis). It reduces latency and server load." },
    { q: "What is the CAP Theorem?", a: "It states that a distributed data store can only simultaneously provide two of the following three guarantees: Consistency, Availability, and Partition Tolerance." },
    { q: "Explain Microservices vs Monolith architecture.", a: "Monolith: All components are tightly coupled in one codebase. Microservices: Application is broken down into small, independent, loosely coupled services communicating via APIs." },
    { q: "What is a Message Queue?", a: "An asynchronous service-to-service communication used in serverless and microservices architectures (e.g., RabbitMQ, Kafka). It temporarily stores messages until the receiving service is ready." }
  ]
};

// Simulated External API Database
const externalApiDatabase = {
  "Python": [
    { q: "What is the difference between list and tuple?", a: "Lists are mutable (can be changed) and use square brackets []. Tuples are immutable (cannot be changed) and use parentheses ()." },
    { q: "What are decorators in Python?", a: "Decorators are functions that modify the functionality of another function or class without permanently modifying it. They use the @ symbol." },
    { q: "What is PEP 8?", a: "PEP 8 is the Python Enhancement Proposal that provides guidelines and best practices on how to write Python code for maximum readability." }
  ],
  "Java": [
    { q: "What is the difference between JDK, JRE, and JVM?", a: "JDK is the development kit. JRE is the runtime environment to run Java apps. JVM is the virtual machine that actually executes the bytecode." },
    { q: "Explain OOP concepts in Java.", a: "Encapsulation (hiding data), Inheritance (reusing code), Polymorphism (many forms/overriding), Abstraction (hiding implementation details)." },
    { q: "What is a memory leak in Java?", a: "It occurs when objects are no longer used by the application but the Garbage Collector cannot remove them because they are still referenced." }
  ],
  "AWS": [
    { q: "What is an EC2 instance?", a: "Amazon Elastic Compute Cloud (EC2) provides scalable computing capacity in the AWS cloud, basically virtual servers." },
    { q: "Explain S3.", a: "Amazon Simple Storage Service (S3) is an object storage service offering industry-leading scalability, data availability, security, and performance." },
    { q: "What is AWS Lambda?", a: "A serverless compute service that lets you run code without provisioning or managing servers, triggering code in response to events." }
  ],
  "Docker": [
    { q: "What is the difference between a Container and an Image?", a: "An Image is a read-only template with instructions for creating a container. A Container is a runnable instance of an Image." },
    { q: "What is Docker Compose?", a: "A tool for defining and running multi-container Docker applications using a YAML file to configure application services." }
  ],
  "Git": [
    { q: "What is the difference between git merge and git rebase?", a: "Merge creates a new commit that ties the histories together. Rebase rewrites history by moving the base of your branch to the tip of another branch." },
    { q: "What is a merge conflict?", a: "It happens when two branches modify the same line of a file, or one branch deletes a file while the other modifies it, requiring manual resolution." }
  ]
};

const companySheetsData = [
  {
    company: "Google",
    logo: "🔴🟡🟢🔵",
    questions: [
      "Invert a Binary Tree (Easy)",
      "Find the Longest Substring Without Repeating Characters (Medium)",
      "Design YouTube / Netflix (System Design)",
      "Trapping Rain Water (Hard)"
    ]
  },
  {
    company: "Amazon",
    logo: "📦",
    questions: [
      "Two Sum (Easy)",
      "Merge Intervals (Medium)",
      "Design an E-commerce Checkout System (System Design)",
      "Word Ladder (Hard)"
    ]
  },
  {
    company: "Microsoft",
    logo: "🪟",
    questions: [
      "Reverse a Linked List (Easy)",
      "Lowest Common Ancestor of a Binary Tree (Medium)",
      "Design Microsoft Teams (System Design)"
    ]
  }
];

const MockTests = () => {
  const [activeTab, setActiveTab] = useState("mcq"); // "mcq" | "audio" | "bank" | "sheets"
  
  // MCQ State
  const [mcqStarted, setMcqStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);

  // Audio State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [botSpeech, setBotSpeech] = useState("Hi! I'm your AI Interviewer. Tell me about yourself.");
  const recognitionRef = useRef(null);

  // Question Bank State
  const [activeTopic, setActiveTopic] = useState("React.js");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [customBankData, setCustomBankData] = useState(questionBankData);

  const handleSearchApi = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    // Simulate API Fetch Delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const query = searchQuery.trim().toLowerCase();
    
    // Check our external "API" mock
    let foundTopic = null;
    for (const key of Object.keys(externalApiDatabase)) {
      if (key.toLowerCase() === query || key.toLowerCase().includes(query)) {
        foundTopic = key;
        break;
      }
    }

    if (foundTopic) {
      setCustomBankData(prev => ({ ...prev, [foundTopic]: externalApiDatabase[foundTopic] }));
      setActiveTopic(foundTopic);
    } else {
      // Simulate an AI-generated generic response if topic not found
      const aiGeneratedTopic = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
      const aiData = [
        { q: `Explain the core concepts of ${aiGeneratedTopic}.`, a: `(Auto-fetched from API) ${aiGeneratedTopic} is widely used in modern software development for building scalable and maintainable applications. Its core concepts involve modularity, efficiency, and robust architecture.` },
        { q: `What are the advantages of using ${aiGeneratedTopic}?`, a: `(Auto-fetched from API) It improves developer productivity, has a strong community ecosystem, and offers excellent performance for enterprise-level applications.` },
        { q: `How does ${aiGeneratedTopic} handle state and data?`, a: `(Auto-fetched from API) It uses optimized data structures and memory management to ensure state is handled immutably or efficiently across different layers of the application.` }
      ];
      setCustomBankData(prev => ({ ...prev, [aiGeneratedTopic]: aiData }));
      setActiveTopic(aiGeneratedTopic);
    }
    
    setIsSearching(false);
    setSearchQuery("");
  };

  // Company Sheets State
  const [activeSheet, setActiveSheet] = useState(null);
  const [checkedQuestions, setCheckedQuestions] = useState({});

  const toggleQuestionCheck = (company, qIdx) => {
    const key = `${company}-${qIdx}`;
    setCheckedQuestions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
        }
        if (finalTranscript) setTranscript((prev) => prev + finalTranscript);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const handleStartMcq = () => {
    setMcqStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setShowReview(false);
    setScore(0);
  };

  const handleOptionSelect = (index) => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: index });

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockMCQQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      let newScore = 0;
      mockMCQQuestions.forEach((q, i) => { if (selectedAnswers[i] === q.answer) newScore++; });
      setScore(newScore);
      setShowResults(true);

      if (newScore === mockMCQQuestions.length) {
        // Trigger celebration for perfect score!
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;
        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
      }
    }
  };

  const handleShareScore = () => {
    const text = `🎯 I just scored ${score}/${mockMCQQuestions.length} on the Smart Placement Tracker Software Engineering Assessment! Think you can beat me?`;
    navigator.clipboard.writeText(text);
    alert("Score copied to clipboard!");
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setTimeout(() => {
        setBotSpeech("That's an interesting background. What is your greatest strength?");
        setTranscript("");
      }, 1000);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakBotText = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(botSpeech);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-lg shadow-primary-500/20">🎯</span>
            Interview Prep Hub
          </h1>
          <p className="text-dark-300">Master your interviews with Mock Tests, AI Audio, Question Banks, and Company Sheets.</p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-dark-800/50 p-2 rounded-2xl border border-dark-700/50 w-full sm:w-fit">
        {[
          { id: "mcq", icon: "📝", label: "MCQ Test" },
          { id: "audio", icon: "🎙️", label: "AI Audio" },
          { id: "bank", icon: "📚", label: "Question Bank" },
          { id: "sheets", icon: "🏢", label: "Company Sheets" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-inner"
                : "text-dark-300 hover:text-white hover:bg-dark-700/50 border border-transparent"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Areas */}
      <div className="animate-slide-up relative">
        
        {/* 1. MCQ Section */}
        {activeTab === "mcq" && (
          <div className="glass-card p-6 md:p-8">
            {!mcqStarted ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                  <span className="text-5xl">💻</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Software Engineering Assessment</h2>
                <p className="text-dark-300 mb-8 max-w-lg mx-auto">Test your core knowledge in React, JavaScript, and CSS. Get instant results and detailed explanations.</p>
                <button onClick={handleStartMcq} className="btn-primary px-8 py-3 text-lg rounded-xl">Start Assessment</button>
              </div>
            ) : showResults ? (
              <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-white mb-4">Assessment Complete!</h2>
                <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 mb-4 drop-shadow-lg">
                  {score} <span className="text-4xl text-dark-400">/ {mockMCQQuestions.length}</span>
                </div>
                {score === mockMCQQuestions.length ? (
                  <p className="text-emerald-400 font-bold mb-6 text-xl animate-pulse">🎉 Perfect Score! You are interview-ready! 🎉</p>
                ) : (
                  <p className="text-amber-400 font-bold mb-6 text-xl">Great effort! Keep practicing.</p>
                )}
                
                {!showReview ? (
                  <div className="flex flex-wrap gap-4 justify-center mt-6">
                    <button onClick={() => setShowReview(true)} className="btn-secondary px-6">Review Answers</button>
                    <button onClick={handleStartMcq} className="btn-secondary px-6">Retake Test</button>
                    <button onClick={handleShareScore} className="btn-primary px-6 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                      Share Score
                    </button>
                  </div>
                ) : (
                  <div className="mt-10 text-left animate-slide-up max-h-[500px] overflow-y-auto pr-4 space-y-6">
                    <div className="flex items-center justify-between sticky top-0 bg-dark-900/90 backdrop-blur-md p-3 z-10 border-b border-dark-700">
                      <h3 className="text-xl font-bold text-white">Review Your Answers</h3>
                      <button onClick={handleStartMcq} className="text-sm font-bold text-primary-400 hover:text-primary-300">Retake Test →</button>
                    </div>
                    {mockMCQQuestions.map((q, qIdx) => {
                      const userAns = selectedAnswers[qIdx];
                      const isCorrect = userAns === q.answer;
                      return (
                        <div key={qIdx} className={`p-5 rounded-2xl border ${isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                          <h4 className="text-lg font-bold text-white mb-3">
                            <span className="text-dark-400 mr-2">{qIdx + 1}.</span>{q.question}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, oIdx) => {
                              let optionClass = "border-dark-700 bg-dark-800/40 text-dark-300";
                              let icon = null;
                              
                              if (oIdx === q.answer) {
                                optionClass = "border-emerald-500 bg-emerald-500/20 text-emerald-100 font-bold";
                                icon = "✅";
                              } else if (oIdx === userAns && !isCorrect) {
                                optionClass = "border-red-500 bg-red-500/20 text-red-100 font-bold";
                                icon = "❌";
                              }

                              return (
                                <div key={oIdx} className={`px-4 py-3 rounded-xl border flex justify-between items-center ${optionClass}`}>
                                  <span>{opt}</span>
                                  {icon && <span>{icon}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6 text-sm text-dark-300 font-bold tracking-wide">
                  <span>QUESTION {currentQuestionIndex + 1} OF {mockMCQQuestions.length}</span>
                  <span className="text-red-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> 09:45 remaining</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-8">{mockMCQQuestions[currentQuestionIndex].question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {mockMCQQuestions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`text-left px-6 py-5 rounded-2xl border-2 transition-all duration-200 ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? "border-primary-500 bg-primary-500/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                          : "border-dark-700 bg-dark-800/40 text-dark-200 hover:border-dark-500"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-4 border-t border-dark-700/50">
                  <button 
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestionIndex] === undefined}
                    className="btn-primary px-8 disabled:opacity-50"
                  >
                    {currentQuestionIndex === mockMCQQuestions.length - 1 ? "Submit" : "Next Question"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Audio Interview Section */}
        {activeTab === "audio" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 to-purple-900/10"></div>
              <div className="w-32 h-32 mb-6 rounded-full bg-dark-900 border-4 border-primary-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] relative z-10">
                <span className="text-6xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 z-10">AI Recruiter</h3>
              <div className="bg-dark-900/80 border border-white/5 p-6 rounded-2xl z-10 w-full max-w-sm shadow-xl">
                <p className="text-dark-100 font-medium mb-4 text-lg">"{botSpeech}"</p>
                <button onClick={speakBotText} className="text-sm text-primary-400 hover:text-primary-300 font-bold flex items-center justify-center gap-2 mx-auto">
                  🔊 Listen Again
                </button>
              </div>
            </div>

            <div className="glass-card p-8 flex flex-col justify-between min-h-[450px]">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Your Response Transcript</h3>
                <div className="bg-dark-900 border border-dark-700 rounded-2xl p-5 min-h-[200px] shadow-inner text-lg">
                  {transcript ? <p className="text-white">{transcript}</p> : <p className="text-dark-500 italic">Click the microphone to start answering...</p>}
                </div>
              </div>
              <div className="flex flex-col items-center mt-8">
                <button
                  onClick={toggleListening}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isListening 
                      ? "bg-red-500/20 border-2 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse" 
                      : "bg-primary-500 hover:bg-primary-600 text-white"
                  }`}
                >
                  {isListening ? <span className="text-3xl">🛑</span> : <span className="text-4xl">🎙️</span>}
                </button>
                <p className="text-dark-300 font-bold tracking-wide mt-4 uppercase text-sm">
                  {isListening ? "Listening... Click to stop" : "Tap to Speak"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Question Bank */}
        {activeTab === "bank" && (
          <div className="space-y-6">
            {/* Simulated API Search Bar */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center border-primary-500/30">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                <span className="text-xl">🌐</span>
              </div>
              <div className="flex-1 w-full">
                <h4 className="text-white font-bold text-sm">Fetch from External API</h4>
                <p className="text-xs text-dark-400">Search for any other topic (e.g., Python, Docker, AWS) to fetch dynamic questions.</p>
              </div>
              <div className="flex w-full md:w-auto gap-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchApi()}
                  placeholder="Enter topic..."
                  className="input-field !py-2 !w-full md:!w-48"
                />
                <button 
                  onClick={handleSearchApi}
                  disabled={isSearching || !searchQuery.trim()}
                  className="btn-primary !py-2 !px-4 whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Fetching...</>
                  ) : "Fetch API"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card p-4 h-fit">
                <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-4 px-2">Topics</h3>
                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                  {Object.keys(customBankData).map(topic => (
                    <button
                      key={topic}
                      onClick={() => setActiveTopic(topic)}
                      className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${
                        activeTopic === topic ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" : "text-dark-300 hover:bg-dark-800 hover:text-white"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-3 space-y-4">
                <h2 className="text-2xl font-bold text-white mb-6 pl-2">{activeTopic} Questions</h2>
                {customBankData[activeTopic]?.map((item, idx) => (
                  <div key={idx} className="glass-card p-6 border-l-4 border-l-primary-500 hover:bg-dark-800/80 transition-colors">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                      <span className="text-primary-400 shrink-0">Q.</span> {item.q}
                    </h4>
                    <p className="text-dark-300 leading-relaxed flex items-start gap-3">
                      <span className="text-emerald-400 font-bold shrink-0">A.</span> {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Company Sheets */}
        {activeTab === "sheets" && (
          <div>
            {!activeSheet ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {companySheetsData.map((sheet, idx) => (
                  <div key={idx} className="glass-card p-0 overflow-hidden hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
                    <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800 to-dark-900 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="text-2xl">{sheet.logo}</span> {sheet.company}
                      </h3>
                      <span className="px-3 py-1 bg-dark-700 text-xs font-bold rounded-lg text-dark-300">{sheet.questions.length} Questions</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <ul className="space-y-4 mb-6 flex-1">
                        {sheet.questions.slice(0, 3).map((q, qIdx) => {
                          const difficulty = q.includes("Easy") ? "text-emerald-400 bg-emerald-400/10" : q.includes("Medium") ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10";
                          return (
                            <li key={qIdx} className="flex items-start gap-3 text-sm font-medium text-dark-200">
                              <svg className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                              <span className="leading-relaxed">
                                {q.replace(/\(.*\)/, '')} 
                                <span className={`ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-current opacity-80 ${difficulty}`}>
                                  {q.match(/\((.*)\)/)?.[1]}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                        {sheet.questions.length > 3 && (
                          <li className="text-sm font-medium text-dark-400 italic pl-8">
                            + {sheet.questions.length - 3} more questions...
                          </li>
                        )}
                      </ul>
                      <button 
                        onClick={() => setActiveSheet(sheet)}
                        className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-primary-400 font-bold rounded-xl text-sm transition-colors border border-dark-600 mt-auto"
                      >
                        Solve Full Sheet →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-slide-up">
                <button 
                  onClick={() => setActiveSheet(null)}
                  className="mb-6 flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm font-bold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                  Back to all companies
                </button>
                
                <div className="glass-card p-0 overflow-hidden">
                  <div className="p-8 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/80 to-dark-900/80 flex items-center gap-4">
                    <span className="text-5xl">{activeSheet.logo}</span>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white">{activeSheet.company} Interview Sheet</h2>
                      <p className="text-dark-400 mt-1">Master these {activeSheet.questions.length} questions to ace your {activeSheet.company} interview.</p>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {activeSheet.questions.map((q, qIdx) => {
                      const difficulty = q.includes("Easy") ? "text-emerald-400 bg-emerald-400/10" : q.includes("Medium") ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10";
                      const isChecked = checkedQuestions[`${activeSheet.company}-${qIdx}`];
                      
                      return (
                        <div 
                          key={qIdx} 
                          onClick={() => toggleQuestionCheck(activeSheet.company, qIdx)}
                          className={`flex items-center justify-between p-4 my-2 mx-4 rounded-xl cursor-pointer transition-all ${
                            isChecked ? "bg-primary-500/10 border border-primary-500/30" : "bg-dark-800/40 hover:bg-dark-800 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              isChecked ? "bg-primary-500 border-primary-500 text-white" : "border-dark-500"
                            }`}>
                              {isChecked && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                            </div>
                            <span className={`font-medium ${isChecked ? "text-primary-300 line-through opacity-70" : "text-white"}`}>
                              {q.replace(/\(.*\)/, '')}
                            </span>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-xs uppercase font-bold border border-current opacity-80 ${difficulty}`}>
                            {q.match(/\((.*)\)/)?.[1]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MockTests;
