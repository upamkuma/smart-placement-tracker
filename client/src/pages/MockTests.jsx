import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { placementTopicsData } from "../services/placementContent";

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
    color: "from-blue-500/10 to-red-500/10",
    tags: ["Arrays", "Trees", "System Design", "DP"],
    questions: [
      { title: "Invert a Binary Tree", difficulty: "Easy", type: "Tree", hint: "Recursively swap left and right children for every node." },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", type: "Sliding Window", hint: "Use a sliding window + HashMap to track last seen index of each character." },
      { title: "Design YouTube / Netflix", difficulty: "System Design", type: "System Design", hint: "Cover CDN, video encoding, recommendation engine, metadata DB, and load balancers." },
      { title: "Trapping Rain Water", difficulty: "Hard", type: "Two Pointers", hint: "Two pointer approach: water[i] = min(maxLeft, maxRight) - height[i]." },
      { title: "Word Break", difficulty: "Medium", type: "DP", hint: "dp[i] = true if s[0..i-1] can be segmented using dictionary words." },
      { title: "Median of Two Sorted Arrays", difficulty: "Hard", type: "Binary Search", hint: "Binary search on smaller array to find correct partition. O(log(min(m,n)))." },
      { title: "Design Google Search", difficulty: "System Design", type: "System Design", hint: "Web crawling, indexing, PageRank, query processing, and result ranking." },
      { title: "Number of Islands", difficulty: "Medium", type: "BFS/DFS", hint: "DFS/BFS from each '1' cell, marking visited cells to count components." }
    ]
  },
  {
    company: "Amazon",
    logo: "📦",
    color: "from-amber-500/10 to-orange-500/10",
    tags: ["Arrays", "Graphs", "System Design", "OOP"],
    questions: [
      { title: "Two Sum", difficulty: "Easy", type: "Arrays", hint: "HashMap: for each num check if target-num exists in map. O(n) time." },
      { title: "Merge Intervals", difficulty: "Medium", type: "Arrays", hint: "Sort by start time, merge overlapping intervals greedily." },
      { title: "Design Amazon E-commerce System", difficulty: "System Design", type: "System Design", hint: "Product catalog, inventory, cart, order processing, payment gateway, recommendations." },
      { title: "Word Ladder", difficulty: "Hard", type: "BFS", hint: "BFS where each transformation is one edge. Use bidirectional BFS for optimization." },
      { title: "LRU Cache", difficulty: "Medium", type: "Design", hint: "HashMap + Doubly Linked List. O(1) get and put operations." },
      { title: "Design Amazon Warehouse System", difficulty: "System Design", type: "System Design", hint: "Inventory tracking, robotics routing, order fulfillment, real-time updates." },
      { title: "K Closest Points to Origin", difficulty: "Medium", type: "Heap", hint: "Min-heap of size K by distance. O(n log K)." },
      { title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", type: "Tree", hint: "Preorder traversal with null markers for serialization and deserialization." }
    ]
  },
  {
    company: "Microsoft",
    logo: "🪟",
    color: "from-blue-500/10 to-cyan-500/10",
    tags: ["Linked List", "Trees", "System Design", "DP"],
    questions: [
      { title: "Reverse a Linked List", difficulty: "Easy", type: "Linked List", hint: "Iterative: prev=null, curr=head. Three-pointer reversal. O(n) O(1)." },
      { title: "Lowest Common Ancestor of Binary Tree", difficulty: "Medium", type: "Tree", hint: "Postorder DFS: if node==p or q return it. LCA is where both subtrees are non-null." },
      { title: "Design Microsoft Teams", difficulty: "System Design", type: "System Design", hint: "WebRTC for video, WebSockets for chat, presence service, screen sharing CDN." },
      { title: "Maximum Subarray (Kadane's)", difficulty: "Easy", type: "DP", hint: "currentSum = max(num, currentSum+num). O(n) time O(1) space." },
      { title: "Clone Graph", difficulty: "Medium", type: "Graph", hint: "BFS/DFS with HashMap<original, clone> to handle visited nodes." },
      { title: "Design a Distributed File System", difficulty: "System Design", type: "System Design", hint: "Master-slave architecture, chunking, replication, fault tolerance, metadata server." },
      { title: "Edit Distance", difficulty: "Hard", type: "DP", hint: "2D DP: dp[i][j] = min(insert, delete, replace) to convert word1[0..i-1] to word2[0..j-1]." }
    ]
  },
  {
    company: "Meta (Facebook)",
    logo: "🔵",
    color: "from-blue-600/10 to-indigo-500/10",
    tags: ["Graphs", "Arrays", "Trees", "System Design"],
    questions: [
      { title: "Valid Parentheses", difficulty: "Easy", type: "Stack", hint: "Push opening brackets, pop and match on closing brackets." },
      { title: "Binary Tree Right Side View", difficulty: "Medium", type: "Tree", hint: "BFS level-order: collect last element of each level." },
      { title: "Design Facebook News Feed", difficulty: "System Design", type: "System Design", hint: "Fan-out on write vs read, ranking algorithm, caching, pagination with cursor." },
      { title: "Accounts Merge", difficulty: "Medium", type: "Graph", hint: "Union-Find: merge emails in same account. Group by root representative." },
      { title: "Minimum Remove to Make Valid Parentheses", difficulty: "Medium", type: "Stack", hint: "Track unmatched indices with stack, then remove those characters." },
      { title: "Design Instagram", difficulty: "System Design", type: "System Design", hint: "Photo storage (S3), CDN, follower graph, feed generation, search." },
      { title: "Subarray Sum Equals K", difficulty: "Medium", type: "Arrays", hint: "Prefix sum + HashMap. count += map.get(prefixSum - k)." }
    ]
  },
  {
    company: "Apple",
    logo: "🍎",
    color: "from-gray-400/10 to-slate-500/10",
    tags: ["Arrays", "Strings", "System Design", "OOP"],
    questions: [
      { title: "Move Zeroes", difficulty: "Easy", type: "Arrays", hint: "Two pointers: place non-zero elements at slow pointer position." },
      { title: "3Sum", difficulty: "Medium", type: "Two Pointers", hint: "Sort + Two Pointers. For each i, use left/right pointers. Skip duplicates." },
      { title: "Design Apple Maps", difficulty: "System Design", type: "System Design", hint: "Graph for road network, Dijkstra/A* for routing, tile-based map rendering, GPS." },
      { title: "Implement Trie (Prefix Tree)", difficulty: "Medium", type: "Trie", hint: "Each node has 26 children array + isEnd flag. Insert/Search in O(L)." },
      { title: "Design App Store", difficulty: "System Design", type: "System Design", hint: "App submission, review pipeline, versioning, download CDN, search indexing." },
      { title: "Sliding Window Maximum", difficulty: "Hard", type: "Sliding Window", hint: "Monotonic deque (decreasing): front = current window max. O(n) overall." }
    ]
  },
  {
    company: "Netflix",
    logo: "🎬",
    color: "from-red-600/10 to-rose-500/10",
    tags: ["System Design", "Graphs", "DP", "Algorithms"],
    questions: [
      { title: "Course Schedule (Topological Sort)", difficulty: "Medium", type: "Graph", hint: "Kahn's BFS: in-degrees, process 0 in-degree nodes. Cycle if not all processed." },
      { title: "Design Netflix Streaming", difficulty: "System Design", type: "System Design", hint: "Adaptive bitrate streaming, CDN edge servers, content encoding, recommendation engine." },
      { title: "Longest Increasing Subsequence", difficulty: "Medium", type: "DP", hint: "O(n log n): maintain tails[] array with binary search (patience sorting)." },
      { title: "Design Movie Recommendation System", difficulty: "System Design", type: "System Design", hint: "Collaborative filtering, matrix factorization, content-based, A/B testing." },
      { title: "Pacific Atlantic Water Flow", difficulty: "Medium", type: "BFS/DFS", hint: "Reverse BFS from both oceans. Cell reachable to both = answer." }
    ]
  },
  {
    company: "Uber",
    logo: "🚗",
    color: "from-emerald-500/10 to-teal-500/10",
    tags: ["Graphs", "System Design", "Geospatial"],
    questions: [
      { title: "Find the Celebrity", difficulty: "Medium", type: "Graph", hint: "Elimination: if A knows B, A is not celebrity. Run until one candidate left, verify." },
      { title: "Design Uber / Ride Sharing", difficulty: "System Design", type: "System Design", hint: "Driver location (geohash), matching algorithm, surge pricing, trip tracking, payments." },
      { title: "Shortest Path in Grid", difficulty: "Medium", type: "BFS", hint: "BFS guarantees shortest path in unweighted grid. Track visited to avoid cycles." },
      { title: "Design Real-time Location Tracking", difficulty: "System Design", type: "System Design", hint: "WebSockets for live updates, geospatial indexing (geohash/quadtree), Kafka for events." },
      { title: "Task Scheduler", difficulty: "Medium", type: "Greedy", hint: "Max frequency task determines min time. Slots = (maxFreq-1) * (n+1) + countOfMaxFreq." }
    ]
  },
  {
    company: "Adobe",
    logo: "🎨",
    color: "from-red-500/10 to-pink-500/10",
    tags: ["Arrays", "DP", "Strings", "System Design"],
    questions: [
      { title: "Product of Array Except Self", difficulty: "Medium", type: "Arrays", hint: "Two-pass: left products then multiply right products in-place. No division. O(n) O(1)." },
      { title: "Design a Document Editor", difficulty: "System Design", type: "System Design", hint: "OT (Operational Transform) or CRDT for collaboration, undo/redo stack, versioning." },
      { title: "Wildcard Matching", difficulty: "Hard", type: "DP", hint: "2D DP. For '*': dp[i][j] = dp[i-1][j] (use *) OR dp[i][j-1] (* = empty)." },
      { title: "Design Photoshop Undo System", difficulty: "System Design", type: "System Design", hint: "Command pattern with doubly linked list or stack for O(1) undo/redo operations." },
      { title: "Minimum Window Substring", difficulty: "Hard", type: "Sliding Window", hint: "Sliding window + frequency map. Expand right until valid, contract left to minimize." }
    ]
  },
  {
    company: "Flipkart",
    logo: "🛒",
    color: "from-yellow-500/10 to-amber-500/10",
    tags: ["Arrays", "DP", "System Design", "OOP"],
    questions: [
      { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", type: "Arrays", hint: "Track minPrice and maxProfit in one pass. O(n) time O(1) space." },
      { title: "Design Flipkart Cart System", difficulty: "System Design", type: "System Design", hint: "Redis for cart, inventory locking during checkout, payment gateway, order queue." },
      { title: "0/1 Knapsack Problem", difficulty: "Medium", type: "DP", hint: "2D DP or 1D (traverse right-to-left). dp[w] = max(dp[w], val + dp[w-wt])." },
      { title: "Validate Binary Search Tree", difficulty: "Medium", type: "Tree", hint: "Pass valid range [min, max] to each node. Node value must be strictly within range." },
      { title: "Design Flash Sale System", difficulty: "System Design", type: "System Design", hint: "Redis atomic decrement for inventory, queue for requests, rate limiting, idempotency." }
    ]
  },
  {
    company: "Infosys",
    logo: "💼",
    color: "from-teal-500/10 to-cyan-500/10",
    tags: ["OOP", "SQL", "Algorithms", "Design Patterns"],
    questions: [
      { title: "Implement a Stack using Arrays", difficulty: "Easy", type: "Stack", hint: "Use top pointer, push increments and assigns, pop returns and decrements. Handle overflow." },
      { title: "Find all duplicates in an Array", difficulty: "Medium", type: "Arrays", hint: "Use cyclic sort: place nums[i] at index nums[i]-1. Then check where arr[i]!=i+1." },
      { title: "SOLID Principles in OOP", difficulty: "Concept", type: "OOP", hint: "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion." },
      { title: "SQL: Find Second Highest Salary", difficulty: "Medium", type: "SQL", hint: "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)." },
      { title: "Design Patterns: Singleton vs Factory", difficulty: "Concept", type: "Design Patterns", hint: "Singleton: single instance, lazy init with double-checked locking. Factory: create without specifying concrete class." }
    ]
  },
  {
    company: "TCS",
    logo: "🏢",
    color: "from-purple-500/10 to-violet-500/10",
    tags: ["Algorithms", "OOP", "SQL", "Data Structures"],
    questions: [
      { title: "Fibonacci using DP and Recursion", difficulty: "Easy", type: "DP", hint: "Memoization: cache results. Tabulation: build bottom-up. Space-optimized: keep last 2 values." },
      { title: "Reverse a String in Place", difficulty: "Easy", type: "Strings", hint: "Two pointers from both ends, swap until they meet. O(n) time O(1) space." },
      { title: "Explain Normalization (1NF, 2NF, 3NF)", difficulty: "Concept", type: "DBMS", hint: "1NF: atomic values. 2NF: no partial dependency. 3NF: no transitive dependency." },
      { title: "Binary Search Implementation", difficulty: "Easy", type: "Algorithms", hint: "lo=0, hi=n-1. mid=lo+(hi-lo)/2. Adjust lo or hi based on comparison." },
      { title: "Explain OOP Polymorphism", difficulty: "Concept", type: "OOP", hint: "Compile-time: method overloading. Runtime: method overriding via virtual dispatch." }
    ]
  },
  {
    company: "Wipro",
    logo: "🌐",
    color: "from-indigo-500/10 to-blue-500/10",
    tags: ["Java", "SQL", "Algorithms", "OOP"],
    questions: [
      { title: "Check if a Number is Prime", difficulty: "Easy", type: "Math", hint: "Check divisors up to sqrt(n). If any divides n evenly, not prime. O(sqrt(n))." },
      { title: "Find Intersection of Two Arrays", difficulty: "Easy", type: "Arrays", hint: "Use HashSet for first array, check second array against set. O(n+m)." },
      { title: "SQL: Employees with Same Salary", difficulty: "Medium", type: "SQL", hint: "GROUP BY salary HAVING COUNT(*) > 1, then JOIN back to get employee names." },
      { title: "Explain Java Collections Framework", difficulty: "Concept", type: "Java", hint: "List (ArrayList, LinkedList), Set (HashSet, TreeSet), Map (HashMap, TreeMap), Queue (PriorityQueue)." },
      { title: "Design Pattern: Observer", difficulty: "Medium", type: "Design Patterns", hint: "Subject maintains list of observers, notifies all on state change. Used in event systems, MVC." }
    ]
  }
];

const mcqTopicsData = {
  "Data Structures": [
    { question: "What is the time complexity of accessing an element by index in an array?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 0, explanation: "Arrays store elements in contiguous memory, so any element is accessed directly via base_address + index * size — constant O(1) time." },
    { question: "Which data structure uses LIFO (Last In First Out) principle?", options: ["Queue", "Stack", "Linked List", "Tree"], answer: 1, explanation: "A Stack follows LIFO — the last element pushed is the first one popped. Used in function call stack, undo/redo, expression evaluation." },
    { question: "What is the worst-case time complexity of QuickSort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], answer: 2, explanation: "QuickSort's worst case O(n²) occurs when the pivot is always the smallest or largest element (e.g., sorted array with fixed pivot). Randomized pivot makes average O(n log n)." },
    { question: "Which traversal of a BST gives elements in sorted order?", options: ["Preorder", "Postorder", "Inorder", "Level-order"], answer: 2, explanation: "Inorder traversal (Left → Root → Right) of a Binary Search Tree visits all nodes in ascending sorted order. This is a key property of BSTs." },
    { question: "What data structure is used to implement BFS (Breadth-First Search)?", options: ["Stack", "Queue", "Heap", "Array"], answer: 1, explanation: "BFS uses a Queue (FIFO) to explore nodes level by level. A node is enqueued when discovered and dequeued when processed." },
    { question: "What is the time complexity of inserting into a Hash Table (average case)?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], answer: 2, explanation: "Hash tables use a hash function to compute index directly, giving O(1) average for insert, delete, and search. Worst case O(n) due to collisions." },
    { question: "Which algorithm finds the shortest path in a weighted graph with non-negative edges?", options: ["DFS", "BFS", "Dijkstra's", "Bellman-Ford"], answer: 2, explanation: "Dijkstra's algorithm uses a min-heap priority queue to greedily pick the nearest unvisited vertex, giving O((V+E) log V) shortest paths for non-negative weights." },
    { question: "What is the space complexity of DFS on a tree with n nodes?", options: ["O(1)", "O(n)", "O(log n)", "O(h) where h is height"], answer: 3, explanation: "DFS recursion stack depth equals the height of the tree — O(h). For balanced trees O(log n), for skewed trees O(n) worst case." },
    { question: "Which sorting algorithm is stable and has guaranteed O(n log n) time?", options: ["QuickSort", "HeapSort", "Merge Sort", "Selection Sort"], answer: 2, explanation: "Merge Sort is stable (preserves relative order of equal elements) and guarantees O(n log n) for all cases. It requires O(n) extra space." },
    { question: "What is the minimum number of edges in a spanning tree of a graph with V vertices?", options: ["V", "V-1", "V+1", "V²"], answer: 1, explanation: "A spanning tree of a connected graph with V vertices has exactly V-1 edges. This is the minimum edges needed to keep all vertices connected without cycles." }
  ],
  "JavaScript": [
    { question: "What is the output of: typeof null?", options: ["'null'", "'undefined'", "'object'", "'boolean'"], answer: 2, explanation: "typeof null === 'object' is a famous JavaScript bug from its original implementation. null is not an object but typeof returns 'object'. Use === null to check for null." },
    { question: "Which array method returns a NEW array without modifying the original?", options: ["push()", "sort()", "splice()", "map()"], answer: 3, explanation: "map() returns a new array with each element transformed by the callback. push(), sort(), and splice() all mutate the original array." },
    { question: "What is event bubbling in JavaScript?", options: ["Events go from parent to child", "Events go from child to parent", "Events execute immediately", "Events are canceled"], answer: 1, explanation: "Event bubbling means an event fired on a child element propagates upward through its ancestors. Use event.stopPropagation() to stop it. Capturing phase is the opposite (parent to child)." },
    { question: "What does the spread operator (...) do?", options: ["Creates a deep copy", "Expands iterable into individual elements", "Merges classes", "Declares rest parameters only"], answer: 1, explanation: "The spread operator expands an iterable (array, string, object) into individual elements. Used in function calls, array literals, and object literals. Note: creates shallow copy for objects." },
    { question: "What is a closure in JavaScript?", options: ["A function with no parameters", "A function that closes the program", "A function retaining access to outer scope variables", "An immediately invoked function"], answer: 2, explanation: "A closure is formed when a function retains access to its lexical scope even when executed outside that scope. This enables data encapsulation, factory functions, and memoization." },
    { question: "What is the difference between Promise.all() and Promise.allSettled()?", options: ["No difference", "all() rejects on first failure; allSettled() waits for all", "allSettled() is faster", "all() is for sync code"], answer: 1, explanation: "Promise.all() short-circuits and rejects if any promise rejects. Promise.allSettled() always waits for all promises and returns an array of {status, value/reason} for each." },
    { question: "Which statement correctly describes 'let' in JavaScript?", options: ["Function-scoped like var", "Block-scoped, can be reassigned, not re-declared", "Cannot be reassigned", "Is hoisted and initialized to undefined"], answer: 1, explanation: "'let' is block-scoped ({}), exists in TDZ before declaration (ReferenceError if accessed), can be reassigned but not re-declared in same scope. Use const by default, let when reassignment needed." },
    { question: "What does Array.prototype.reduce() return by default when called on empty array without initialValue?", options: ["undefined", "null", "0", "TypeError"], answer: 3, explanation: "Calling reduce() on an empty array without an initial value throws a TypeError. Always provide an initial value as the second argument to reduce() for safety." },
    { question: "What is the purpose of 'use strict' in JavaScript?", options: ["Enables ES6 features", "Enforces stricter parsing and error handling", "Makes code run faster", "Enables TypeScript"], answer: 1, explanation: "'use strict' enables strict mode: prevents using undeclared variables, disallows duplicate parameters, throws errors for silent failures, and disables some confusing features like with statement." },
    { question: "Which method would you use to check if ALL elements in an array satisfy a condition?", options: ["Array.some()", "Array.find()", "Array.every()", "Array.filter()"], answer: 2, explanation: "Array.every() returns true only if ALL elements pass the test callback. Array.some() returns true if AT LEAST ONE element passes. Short-circuits: every() stops on first false, some() on first true." }
  ],
  "React.js": [
    { question: "Which hook is used to run side effects in a React functional component?", options: ["useState", "useEffect", "useContext", "useRef"], answer: 1, explanation: "useEffect runs after render. It takes a callback for the side effect and a dependency array. Return a cleanup function to run on unmount or before next effect." },
    { question: "What triggers a re-render in React?", options: ["Any variable change", "State or prop change", "All function calls", "setTimeout calls"], answer: 1, explanation: "React re-renders a component when its state (via setState/useState setter) or props change. useRef changes, module variables, and closures do NOT trigger re-renders." },
    { question: "What is the correct way to update state based on previous state?", options: ["setState(state + 1)", "setState(prev => prev + 1)", "state = state + 1", "this.state++"], answer: 1, explanation: "Always use the functional update form setState(prev => newValue) when new state depends on previous state. This ensures you get the latest state even if updates are batched." },
    { question: "What does React.memo() do?", options: ["Memoizes values", "Prevents component re-render if props unchanged", "Caches API calls", "Creates a pure component class"], answer: 1, explanation: "React.memo() is a HOC that wraps a component. It prevents re-rendering if props haven't changed (shallow comparison). Use with useCallback for function props to maintain stable references." },
    { question: "What is the key prop in React lists used for?", options: ["CSS styling", "React internal optimization — track which items changed", "Event handling", "Data fetching"], answer: 1, explanation: "Keys help React identify which items in a list have changed, been added, or removed. They must be unique among siblings. Avoid using array index as key for dynamic lists." },
    { question: "What is the Context API used for?", options: ["Making API calls", "Managing global state without prop drilling", "Styling components", "Code splitting"], answer: 1, explanation: "Context API provides a way to share values (theme, auth, locale) without passing props through every intermediate component. createContext() + Provider + useContext(). For complex state, combine with useReducer." },
    { question: "When does useEffect with an empty dependency array [] run?", options: ["Every render", "Only on mount (once)", "Never", "Only on unmount"], answer: 1, explanation: "useEffect with [] runs once after the initial render (componentDidMount equivalent). The returned cleanup function runs on unmount. No deps = runs every render. [dep] = runs when dep changes." },
    { question: "What is the Virtual DOM?", options: ["The real DOM", "A JavaScript object representation of the DOM", "A CSS framework", "A browser API"], answer: 1, explanation: "The Virtual DOM is a lightweight JS object tree representing the real DOM. React diffs old vs new VDOM (reconciliation), then batch-updates only changed real DOM nodes — much faster than full re-renders." },
    { question: "What does the useCallback hook do?", options: ["Runs a callback on mount", "Memoizes a function reference", "Cancels async operations", "Handles form callbacks"], answer: 1, explanation: "useCallback(fn, deps) returns a memoized function that only changes when dependencies change. Prevents child components from re-rendering due to new function references on every parent render. Pair with React.memo." },
    { question: "What is the difference between controlled and uncontrolled components?", options: ["Performance only", "Controlled: React state drives value. Uncontrolled: DOM/ref drives value.", "Styling only", "No difference"], answer: 1, explanation: "Controlled: form element value is bound to React state, onChange updates state. Uncontrolled: form element manages own state, read value via ref. Controlled preferred for validation, uncontrolled for simple use cases." }
  ],
  "System Design": [
    { question: "What does CDN stand for and what is its primary purpose?", options: ["Central Data Node", "Content Delivery Network — serve assets from nearest server", "Cloud Database Network", "Code Distribution Network"], answer: 1, explanation: "A CDN is a network of geographically distributed servers that cache and serve static content (images, JS, CSS, videos) from the server closest to the user, reducing latency and load on origin servers." },
    { question: "Which database would you choose for a high-write, horizontally scalable scenario?", options: ["PostgreSQL", "SQLite", "Cassandra (NoSQL)", "Microsoft Access"], answer: 2, explanation: "Cassandra is designed for high write throughput and horizontal scalability. It uses a distributed, peer-to-peer architecture with eventual consistency, tunable consistency levels, and excellent write performance." },
    { question: "What is the CAP theorem?", options: ["Cache, API, Performance", "A distributed system can guarantee only 2 of: Consistency, Availability, Partition Tolerance", "A database must have all 3: CRUD, ACID, Performance", "Compression, Authentication, Privacy"], answer: 1, explanation: "CAP Theorem: distributed systems can only guarantee 2 of: Consistency (all nodes see same data), Availability (every request gets a response), Partition Tolerance (works despite network partitions). In practice, network partitions happen, so you choose CP or AP." },
    { question: "What is the purpose of a message queue in distributed systems?", options: ["Store permanent data", "Decouple services, handle backpressure, enable async processing", "Replace databases", "Only for logging"], answer: 1, explanation: "Message queues (Kafka, RabbitMQ, SQS) decouple producers and consumers. Benefits: handle traffic spikes (backpressure), retry on failure, enable async processing, order guarantees, fan-out to multiple consumers." },
    { question: "What is horizontal scaling?", options: ["Adding more RAM to existing server", "Adding more servers to distribute load", "Improving database indexes", "Using faster CPUs"], answer: 1, explanation: "Horizontal scaling (scale out) adds more machines to handle increased load. Vertical scaling (scale up) adds more power to existing machine. Horizontal is preferred for large scale — load balancer distributes requests." },
    { question: "What caching strategy updates cache and database simultaneously on write?", options: ["Cache-aside", "Write-through", "Write-behind", "Read-through"], answer: 1, explanation: "Write-through: data written to cache and database at the same time. Consistent but adds write latency. Write-behind (write-back): write to cache, async write to DB later. Cache-aside (lazy loading): app manages cache on miss." },
    { question: "What is consistent hashing used for?", options: ["Password hashing", "Distribute keys across servers with minimal remapping when servers added/removed", "Load balancing only", "Encrypting data"], answer: 1, explanation: "Consistent hashing minimizes key redistribution when nodes join/leave a distributed system. Only K/N keys need to be remapped on average (vs full redistribution in simple modulo hashing). Used in distributed caches, DHTs, load balancers." },
    { question: "What is a rate limiter and why is it needed?", options: ["Limit file sizes", "Control request rate per user/IP to prevent abuse and ensure fair usage", "Limit database size", "Throttle CPU usage"], answer: 1, explanation: "Rate limiting controls how many requests a client can make in a time window. Prevents DDoS attacks, brute force, API abuse. Algorithms: Token Bucket, Leaky Bucket, Fixed Window, Sliding Window. Implement with Redis for distributed systems." },
    { question: "What is a microservices architecture?", options: ["Using tiny files", "Breaking application into small, independent, separately deployable services", "Using micro-databases", "Minimizing code size"], answer: 1, explanation: "Microservices: each service handles a specific business function, has its own database, communicates via APIs/message queues. Benefits: independent scaling, deployment, tech stack. Drawbacks: distributed system complexity, network overhead, data consistency." },
    { question: "Which load balancing algorithm sends each request to the server with fewest active connections?", options: ["Round Robin", "Least Connections", "IP Hash", "Random"], answer: 1, explanation: "Least Connections routes to the server with fewest active connections — good when requests have variable processing time. Round Robin distributes equally. IP Hash routes same client to same server (session persistence)." }
  ],
  "Algorithms": [
    { question: "What is the time complexity of Binary Search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: 1, explanation: "Binary Search divides the search space in half each iteration. T(n) = T(n/2) + O(1), solving to O(log n). Requires sorted array. Avoids O(n) linear scan for large datasets." },
    { question: "What problem does Kadane's algorithm solve?", options: ["Shortest path", "Maximum subarray sum", "Sorting", "String matching"], answer: 1, explanation: "Kadane's algorithm finds the maximum sum contiguous subarray in O(n) time and O(1) space. Key: currentSum = max(num, currentSum + num). If current element alone is better, start new subarray." },
    { question: "What technique does the Two Pointer approach use to solve problems?", options: ["Divide and conquer", "Two indices moving to reduce brute force O(n²) to O(n)", "Dynamic programming", "Greedy approach"], answer: 1, explanation: "Two Pointers uses two indices (opposite ends or same direction) to solve array/string problems in O(n) instead of O(n²). Works on sorted arrays for pair problems, used in sliding window, merge, and cycle detection." },
    { question: "What is Memoization in algorithms?", options: ["Memory management", "Caching results of expensive function calls to avoid recomputation", "Memorizing algorithms", "Memory allocation"], answer: 1, explanation: "Memoization is a top-down DP technique that caches the result of expensive recursive calls. When the same input occurs again, return the cached result. Converts exponential recursion (e.g., naive Fibonacci O(2^n)) to O(n)." },
    { question: "Which algorithm detects cycles in a linked list using O(1) space?", options: ["HashSet approach", "Floyd's Cycle Detection (slow/fast pointers)", "Array copy", "Counting traversal"], answer: 1, explanation: "Floyd's Cycle Detection uses slow (1 step) and fast (2 steps) pointers. If they meet, cycle exists. O(n) time, O(1) space. Also finds cycle start by resetting slow to head after detection." },
    { question: "What is the greedy approach in algorithm design?", options: ["Always pick the largest element", "Make locally optimal choice at each step hoping for global optimum", "Try all possibilities", "Divide and solve recursively"], answer: 1, explanation: "Greedy algorithms make the locally optimal choice at each step. Works when problem has greedy choice property and optimal substructure. Examples: Activity Selection, Huffman Coding, Dijkstra's, Kruskal's MST. Doesn't always give global optimum (use DP then)." },
    { question: "What is the Master Theorem used for?", options: ["Graph algorithms", "Solving recurrences of the form T(n) = aT(n/b) + f(n)", "Dynamic programming", "String matching"], answer: 1, explanation: "Master Theorem gives asymptotic bounds for divide-and-conquer recurrences T(n) = aT(n/b) + f(n). Three cases based on comparison of f(n) with n^(log_b a). Used to analyze Merge Sort T(n)=2T(n/2)+O(n) → O(n log n)." },
    { question: "What is the time complexity of the Merge Sort algorithm?", options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"], answer: 2, explanation: "Merge Sort: T(n) = 2T(n/2) + O(n). By Master Theorem: O(n log n) in all cases (best, average, worst). It's stable and guaranteed, making it preferred over QuickSort when stability or worst-case matters." },
    { question: "Which traversal strategy explores all neighbors at current depth before going deeper?", options: ["DFS", "BFS", "Inorder", "Postorder"], answer: 1, explanation: "BFS (Breadth-First Search) uses a queue to explore all neighbors at distance d before exploring nodes at distance d+1. Guarantees shortest path in unweighted graphs. DFS explores deep before backtracking." },
    { question: "What is the purpose of the Sliding Window technique?", options: ["Sorting elements", "Efficiently process subarrays/substrings by moving a window without recomputing from scratch", "Finding paths in graphs", "Tree traversal"], answer: 1, explanation: "Sliding Window maintains a contiguous subarray/substring window, updating incrementally (add new element, remove old) instead of recomputing. Reduces O(n×k) to O(n). Used for max/min subarray, longest valid substring, anagram detection." }
  ]
};

// Merge custom placement topic MCQs dynamically
const mergedMcqTopicsData = {
  ...mcqTopicsData,
  "Arrays": placementTopicsData["Arrays"].mcqs,
  "Strings": placementTopicsData["Strings"].mcqs,
  "Linked Lists": placementTopicsData["Linked Lists"].mcqs,
  "Dynamic Programming": placementTopicsData["Dynamic Programming"].mcqs,
  "DBMS & SQL": placementTopicsData["DBMS & SQL"].mcqs,
  "Object-Oriented Programming": placementTopicsData["Object-Oriented Programming"].mcqs,
};

const MockTests = () => {
  const [activeTab, setActiveTab] = useState("mcq"); // "mcq" | "audio" | "bank" | "sheets"
  
  // MCQ State
  const [mcqStarted, setMcqStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);
  // MCQ Topic Search
  const [mcqTopicSearch, setMcqTopicSearch] = useState("");
  const [selectedMcqTopic, setSelectedMcqTopic] = useState(null);
  const [activeMcqQuestions, setActiveMcqQuestions] = useState(mockMCQQuestions);

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
  const [bankSearchQuery, setBankSearchQuery] = useState("");

  // Company Sheets Search
  const [sheetSearch, setSheetSearch] = useState("");

  // Smart Topic Explorer State
  const [globalTopicSearch, setGlobalTopicSearch] = useState("");
  const [searchedTopicData, setSearchedTopicData] = useState(null);
  const [showTopicExplorer, setShowTopicExplorer] = useState(false);
  const [openHintIndex, setOpenHintIndex] = useState(null);

  const handleGlobalSearch = () => {
    if (!globalTopicSearch.trim()) return;
    const query = globalTopicSearch.trim().toLowerCase();
    
    let matchedKey = null;
    
    if (query.includes("array")) matchedKey = "Arrays";
    else if (query.includes("string")) matchedKey = "Strings";
    else if (query.includes("link") || query.includes("list")) matchedKey = "Linked Lists";
    else if (query.includes("tree") || query.includes("graph")) matchedKey = "Trees & Graphs";
    else if (query.includes("dynamic") || query.includes("dp")) matchedKey = "Dynamic Programming";
    else if (query.includes("system") || query.includes("design")) matchedKey = "System Design";
    else if (query.includes("sql") || query.includes("db") || query.includes("database") || query.includes("dbms")) matchedKey = "DBMS & SQL";
    else if (query.includes("oop") || query.includes("object") || query.includes("class")) matchedKey = "Object-Oriented Programming";
    
    if (!matchedKey) {
      for (const key of Object.keys(placementTopicsData)) {
        if (key.toLowerCase().includes(query)) {
          matchedKey = key;
          break;
        }
      }
    }

    if (matchedKey) {
      setSearchedTopicData({ topic: matchedKey, ...placementTopicsData[matchedKey] });
      setShowTopicExplorer(true);
      setOpenHintIndex(null);
    } else {
      alert(`Topic "${globalTopicSearch}" not found in local database. Try searching for Arrays, Strings, Linked Lists, Dynamic Programming, System Design, or SQL.`);
    }
  };

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

  const handleStartMcq = (questions) => {
    setActiveMcqQuestions(questions || mockMCQQuestions);
    setMcqStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setShowReview(false);
    setScore(0);
  };

  const handleStartTopicMcq = (topic) => {
    setSelectedMcqTopic(topic);
    handleStartMcq(mergedMcqTopicsData[topic]);
  };

  const filteredTopics = Object.keys(mergedMcqTopicsData).filter(t =>
    t.toLowerCase().includes(mcqTopicSearch.toLowerCase())
  );

  const handleOptionSelect = (index) => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: index });

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeMcqQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      let newScore = 0;
      activeMcqQuestions.forEach((q, i) => { if (selectedAnswers[i] === q.answer) newScore++; });
      setScore(newScore);
      setShowResults(true);

      if (newScore === activeMcqQuestions.length) {
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
    const text = `🎯 I just scored ${score}/${activeMcqQuestions.length} on the Smart Placement Tracker${selectedMcqTopic ? ` ${selectedMcqTopic}` : ' Software Engineering'} Assessment! Think you can beat me?`;
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

      {/* Global Placement Topic Explorer Search */}
      <div className="glass-card-premium p-6 mb-8 bg-gradient-to-r from-primary-900/10 to-purple-900/10 border border-white/5 shadow-2xl rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🔍 Smart Topic Explorer
            </h2>
            <p className="text-xs text-dark-400 mt-1">
              Search any topic (e.g. Arrays, Strings, Linked Lists, DP, System Design, SQL, OOP) to access full study materials, coding questions, resources, and custom quizzes.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2 shrink-0">
            <div className="relative flex-1 md:w-80">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/></svg>
              </span>
              <input 
                type="text" 
                value={globalTopicSearch}
                onChange={(e) => setGlobalTopicSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                placeholder="Search topic (e.g. Arrays)..."
                className="input-field !pl-12 !py-3 w-full"
              />
            </div>
            <button 
              onClick={handleGlobalSearch}
              className="btn-primary !px-6 flex items-center gap-2 whitespace-nowrap"
            >
              Explore
            </button>
          </div>
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
        {showTopicExplorer && searchedTopicData ? (
          <div className="glass-card p-6 md:p-8 animate-slide-up">
            {/* Explorer Header */}
            <div className="flex justify-between items-start border-b border-dark-700/50 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{searchedTopicData.icon}</span>
                <div>
                  <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
                    {searchedTopicData.topic} Explorer
                  </h2>
                  <p className="text-dark-400 text-sm mt-1">Full Placement Hub for {searchedTopicData.topic}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowTopicExplorer(false); setSearchedTopicData(null); }}
                className="btn-secondary !py-2 !px-4 flex items-center gap-2"
              >
                ❌ Close Explorer
              </button>
            </div>
            
            <TopicExplorerContent 
              data={searchedTopicData} 
              openHintIndex={openHintIndex}
              setOpenHintIndex={setOpenHintIndex}
              onStartQuiz={(mcqs) => {
                setShowTopicExplorer(false);
                setSearchedTopicData(null);
                setActiveTab("mcq");
                handleStartMcq(mcqs);
                setSelectedMcqTopic(searchedTopicData.topic);
              }}
            />
          </div>
        ) : (
          <>
            {/* 1. MCQ Section */}
            {activeTab === "mcq" && (
              <div className="glass-card p-6 md:p-8">
            {!mcqStarted ? (
              <div>
                {/* Topic Search */}
                <div className="mb-8">
                  <div className="relative max-w-lg mx-auto">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/></svg>
                    </span>
                    <input
                      type="text"
                      value={mcqTopicSearch}
                      onChange={e => setMcqTopicSearch(e.target.value)}
                      placeholder="Search topic to practice (e.g. Arrays, React, System Design)..."
                      className="input-field !pl-12 !pr-4 w-full"
                    />
                  </div>
                </div>

                {/* Topic Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                  {filteredTopics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => handleStartTopicMcq(topic)}
                      className="glass-card p-5 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-300 border-primary-500/10 hover:border-primary-500/40 group"
                    >
                      <span className="text-3xl">
                        {topic === "Data Structures" ? "🌳" : 
                         topic === "JavaScript" ? "📜" : 
                         topic === "React.js" ? "⚛️" : 
                         topic === "System Design" ? "🏗️" : 
                         topic === "Arrays" ? "📊" : 
                         topic === "Strings" ? "🔤" : 
                         topic === "Linked Lists" ? "🔗" : 
                         topic === "Dynamic Programming" ? "📈" : 
                         topic === "DBMS & SQL" ? "🗄️" : 
                         topic === "Object-Oriented Programming" ? "📦" : "🧮"}
                      </span>
                      <span className="text-sm font-bold text-dark-200 group-hover:text-white text-center leading-tight">{topic}</span>
                      <span className="text-xs text-dark-500 group-hover:text-primary-400">{mergedMcqTopicsData[topic].length} Questions</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-dark-700/50 pt-8 text-center">
                  <h2 className="text-xl font-bold text-white mb-2">Or take the General Assessment</h2>
                  <p className="text-dark-300 mb-6">Test your core knowledge in React, JavaScript, and CSS.</p>
                  <div className="w-full max-w-[240px] aspect-video mx-auto mb-6">
                    <img 
                      src={`${import.meta.env.BASE_URL}assessment-illustration.png`} 
                      alt="Assessment Illustration" 
                      className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(99,102,241,0.2)] animate-float" 
                    />
                  </div>
                  <button onClick={() => handleStartMcq()} className="btn-primary px-8 py-3 text-lg rounded-xl">Start General Assessment</button>
                </div>
              </div>
            ) : showResults ? (
              <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h2>
                {selectedMcqTopic && <p className="text-primary-400 font-bold mb-4">Topic: {selectedMcqTopic}</p>}
                <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 mb-4 drop-shadow-lg">
                  {score} <span className="text-4xl text-dark-400">/ {activeMcqQuestions.length}</span>
                </div>
                {score === activeMcqQuestions.length ? (
                  <p className="text-emerald-400 font-bold mb-6 text-xl animate-pulse">🎉 Perfect Score! You are interview-ready! 🎉</p>
                ) : (
                  <p className="text-amber-400 font-bold mb-6 text-xl">Great effort! Keep practicing.</p>
                )}
                
                {!showReview ? (
                  <div className="flex flex-wrap gap-4 justify-center mt-6">
                    <button onClick={() => setShowReview(true)} className="btn-secondary px-6">Review Answers</button>
                    <button onClick={() => handleStartMcq(activeMcqQuestions)} className="btn-secondary px-6">Retake Test</button>
                    <button onClick={() => { setMcqStarted(false); setSelectedMcqTopic(null); }} className="btn-secondary px-6">Choose Topic</button>
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
                    {activeMcqQuestions.map((q, qIdx) => {
                      const userAns = selectedAnswers[qIdx];
                      const isCorrect = userAns === q.answer;
                      return (
                        <div key={qIdx} className={`p-5 rounded-2xl border ${isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                          <h4 className="text-lg font-bold text-white mb-3">
                            <span className="text-dark-400 mr-2">{qIdx + 1}.</span>{q.question}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
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
                          {q.explanation && (
                            <div className="mt-3 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-sm text-dark-200">
                              <span className="text-primary-400 font-bold">💡 Explanation: </span>{q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6 text-sm text-dark-300 font-bold tracking-wide">
                  <div>
                    <span>QUESTION {currentQuestionIndex + 1} OF {activeMcqQuestions.length}</span>
                    {selectedMcqTopic && <span className="ml-3 px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 text-xs">{selectedMcqTopic}</span>}
                  </div>
                  <span className="text-red-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> In Progress</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-8">{activeMcqQuestions[currentQuestionIndex].question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {activeMcqQuestions[currentQuestionIndex].options.map((option, index) => (
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
                    {currentQuestionIndex === activeMcqQuestions.length - 1 ? "Submit" : "Next Question"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Audio Interview Section */}
        {activeTab === "audio" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden text-center group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 to-purple-900/10"></div>
              <div className="w-full max-w-[350px] aspect-square mb-6 relative z-10 transition-transform duration-700 group-hover:scale-105">
                <img 
                  src={`${import.meta.env.BASE_URL}interview-illustration.png`} 
                  alt="AI Interview Illustration" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" 
                />
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

            {/* Local Search Bar */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/></svg>
              </span>
              <input
                type="text"
                value={bankSearchQuery}
                onChange={e => setBankSearchQuery(e.target.value)}
                placeholder="Search questions or answers in the active topic..."
                className="input-field !pl-12 !pr-4 w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card p-4 h-fit">
                <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-4 px-2">Topics</h3>
                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                  {Object.keys(customBankData).map(topic => (
                    <button
                      key={topic}
                      onClick={() => { setActiveTopic(topic); setBankSearchQuery(""); }}
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
                {customBankData[activeTopic]
                  ?.filter(item => 
                    item.q.toLowerCase().includes(bankSearchQuery.toLowerCase()) || 
                    item.a.toLowerCase().includes(bankSearchQuery.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-12 glass-card">
                      <p className="text-dark-400">No questions found matching your search query.</p>
                    </div>
                  ) : (
                    customBankData[activeTopic]
                      ?.filter(item => 
                        item.q.toLowerCase().includes(bankSearchQuery.toLowerCase()) || 
                        item.a.toLowerCase().includes(bankSearchQuery.toLowerCase())
                      )
                      .map((item, idx) => (
                        <div key={idx} className="glass-card p-6 border-l-4 border-l-primary-500 hover:bg-dark-800/80 transition-colors animate-fade-in">
                          <h4 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                            <span className="text-primary-400 shrink-0">Q.</span> {item.q}
                          </h4>
                          <p className="text-dark-300 leading-relaxed flex items-start gap-3">
                            <span className="text-emerald-400 font-bold shrink-0">A.</span> {item.a}
                          </p>
                        </div>
                      ))
                  )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Company Sheets */}
        {activeTab === "sheets" && (
          <div>
            {!activeSheet ? (
              <div className="space-y-6">
                {/* Company Sheets Search Bar */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/></svg>
                  </span>
                  <input
                    type="text"
                    value={sheetSearch}
                    onChange={e => setSheetSearch(e.target.value)}
                    placeholder="Search companies, tags (e.g. Arrays, Trees), or question titles..."
                    className="input-field !pl-12 !pr-4 w-full"
                  />
                </div>

                {companySheetsData.filter(sheet => {
                  const query = sheetSearch.toLowerCase();
                  const matchCompany = sheet.company.toLowerCase().includes(query);
                  const matchTags = sheet.tags.some(tag => tag.toLowerCase().includes(query));
                  const matchQuestions = sheet.questions.some(q => 
                    q.title.toLowerCase().includes(query) || 
                    (q.type && q.type.toLowerCase().includes(query))
                  );
                  return matchCompany || matchTags || matchQuestions;
                }).length === 0 ? (
                  <div className="text-center py-12 glass-card">
                    <p className="text-dark-400">No company sheets found matching your search query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {companySheetsData
                      .filter(sheet => {
                        const query = sheetSearch.toLowerCase();
                        const matchCompany = sheet.company.toLowerCase().includes(query);
                        const matchTags = sheet.tags.some(tag => tag.toLowerCase().includes(query));
                        const matchQuestions = sheet.questions.some(q => 
                          q.title.toLowerCase().includes(query) || 
                          (q.type && q.type.toLowerCase().includes(query))
                        );
                        return matchCompany || matchTags || matchQuestions;
                      })
                      .map((sheet, idx) => (
                        <div key={idx} className="glass-card p-0 overflow-hidden hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
                          <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800 to-dark-900 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                              <span className="text-2xl">{sheet.logo}</span> {sheet.company}
                            </h3>
                            <span className="px-3 py-1 bg-dark-700 text-xs font-bold rounded-lg text-dark-300">{sheet.questions.length} Questions</span>
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <ul className="space-y-4 mb-6 flex-1 text-left">
                              {sheet.questions.slice(0, 3).map((q, qIdx) => {
                                const diffClass = q.difficulty === "Easy" ? "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" : q.difficulty === "Medium" ? "text-amber-400 bg-amber-400/10 border-amber-500/20" : q.difficulty === "Hard" ? "text-red-400 bg-red-400/10 border-red-500/20" : "text-blue-400 bg-blue-400/10 border-blue-500/20";
                                return (
                                  <li key={qIdx} className="flex items-start gap-3 text-sm font-medium text-dark-200">
                                    <svg className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                    <span className="leading-relaxed">
                                      {q.title} 
                                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-current opacity-80 ${diffClass}`}>
                                        {q.difficulty}
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
                              onClick={() => { setActiveSheet(sheet); setSheetSearch(""); }}
                              className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-primary-400 font-bold rounded-xl text-sm transition-colors border border-dark-600 mt-auto"
                            >
                              Solve Full Sheet →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-slide-up text-left">
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
                      const diffClass = q.difficulty === "Easy" ? "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" : q.difficulty === "Medium" ? "text-amber-400 bg-amber-400/10 border-amber-500/20" : q.difficulty === "Hard" ? "text-red-400 bg-red-400/10 border-red-500/20" : "text-blue-400 bg-blue-400/10 border-blue-500/20";
                      const isChecked = checkedQuestions[`${activeSheet.company}-${qIdx}`];
                      
                      return (
                        <div 
                          key={qIdx} 
                          className={`p-4 my-2 mx-4 rounded-xl transition-all border ${
                            isChecked ? "bg-primary-500/10 border border-primary-500/30" : "bg-dark-800/40 hover:bg-dark-800 border border-dark-700/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              onClick={() => toggleQuestionCheck(activeSheet.company, qIdx)}
                              className="flex items-center gap-4 cursor-pointer flex-1"
                            >
                              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                isChecked ? "bg-primary-500 border-primary-500 text-white" : "border-dark-500"
                              }`}>
                                {isChecked && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                              </div>
                              <span className={`font-medium ${isChecked ? "text-primary-300 line-through opacity-70" : "text-white"}`}>
                                {q.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {q.type && (
                                <span className="px-2 py-0.5 rounded bg-dark-700 text-xs text-dark-300">{q.type}</span>
                              )}
                              <span className={`px-2.5 py-1 rounded text-xs uppercase font-bold border border-current opacity-80 ${diffClass}`}>
                                {q.difficulty}
                              </span>
                            </div>
                          </div>
                          {q.hint && (
                            <div className="mt-2.5 ml-10 p-3 bg-dark-900/50 rounded-lg text-xs text-dark-400 flex items-start gap-2 border border-dark-700/50">
                              <span className="text-amber-500 font-bold">💡 Hint:</span>
                              <span>{q.hint}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

const TopicExplorerContent = ({ data, openHintIndex, setOpenHintIndex, onStartQuiz }) => {
  const [explorerSubTab, setExplorerSubTab] = useState("theory"); // theory, coding, questions, resources

  return (
    <div>
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap border-b border-dark-700/50 mb-6 gap-6">
        {[
          { id: "theory", label: "📖 Concept & Theory" },
          { id: "coding", label: "💻 Coding Practice" },
          { id: "questions", label: "📚 Interview Q&A" },
          { id: "resources", label: "🔗 Resources" }
        ].map(subTab => (
          <button
            key={subTab.id}
            onClick={() => setExplorerSubTab(subTab.id)}
            className={`pb-3 font-semibold text-sm transition-all relative ${
              explorerSubTab === subTab.id ? "text-primary-400" : "text-dark-300 hover:text-white"
            }`}
          >
            {subTab.label}
            {explorerSubTab === subTab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Explorer Content */}
      <div className="animate-fade-in text-left">
        {/* Theory Tab */}
        {explorerSubTab === "theory" && (
          <div className="space-y-6">
            <div className="p-5 bg-dark-800/40 rounded-2xl border border-dark-700/50">
              <h3 className="text-lg font-bold text-white mb-2">Introduction</h3>
              <p className="text-dark-300 leading-relaxed text-sm">{data.theory.introduction}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white pl-1">Key Concepts</h3>
                <div className="space-y-3">
                  {data.theory.keyConcepts.map((concept, idx) => (
                    <div key={idx} className="p-4 bg-dark-800/20 border border-dark-700/30 rounded-xl">
                      <h4 className="font-bold text-primary-300 text-sm mb-1">{concept.name}</h4>
                      <p className="text-xs text-dark-400 leading-relaxed">{concept.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white pl-1">Big-O Complexities</h3>
                <div className="overflow-x-auto border border-dark-700/50 rounded-2xl">
                  <table className="w-full text-left text-sm text-dark-300">
                    <thead className="bg-dark-800 text-dark-200 font-bold border-b border-dark-700/50">
                      <tr>
                        <th className="p-3">Operation</th>
                        <th className="p-3">Time Complexity</th>
                        <th className="p-3">Space Complexity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700/30">
                      {data.theory.complexities.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-dark-800/30">
                          <td className="p-3 font-semibold text-white">{comp.operation}</td>
                          <td className="p-3 text-emerald-400 font-mono font-bold">{comp.time}</td>
                          <td className="p-3 text-dark-400 font-mono">{comp.space}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {data.mcqs && data.mcqs.length > 0 && (
                  <div className="p-5 bg-gradient-to-br from-primary-500/10 to-purple-600/5 border border-primary-500/30 rounded-2xl text-center mt-6">
                    <h4 className="font-bold text-white mb-2">Ready to test your knowledge?</h4>
                    <p className="text-xs text-dark-400 mb-4">Take a targeted {data.mcqs.length}-question multiple choice quiz on {data.topic}.</p>
                    <button 
                      onClick={() => onStartQuiz(data.mcqs)}
                      className="btn-primary w-full !py-2.5 text-sm"
                    >
                      📝 Start {data.topic} Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Coding Practice Tab */}
        {explorerSubTab === "coding" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white pl-1">Standard Placement Questions</h3>
            <div className="grid grid-cols-1 gap-4">
              {data.codingQuestions.map((q, idx) => {
                const diffColor = q.difficulty === "Easy" ? "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" : q.difficulty === "Medium" ? "text-amber-400 bg-amber-400/10 border-amber-500/20" : "text-red-400 bg-red-400/10 border-red-500/20";
                return (
                  <div key={idx} className="glass-card p-5 hover:bg-dark-800/50 transition-colors border border-dark-700/50">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          {q.title}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${diffColor}`}>
                            {q.difficulty}
                          </span>
                        </h4>
                        <span className="text-xs text-dark-500 font-semibold">{q.platform}</span>
                      </div>
                      <a 
                        href={q.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 bg-primary-500/10 px-3 py-1.5 rounded-lg border border-primary-500/20"
                      >
                        Solve Problem ↗
                      </a>
                    </div>
                    <p className="text-sm text-dark-300 mb-4">{q.description}</p>
                    
                    <div>
                      <button
                        onClick={() => setOpenHintIndex(openHintIndex === idx ? null : idx)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        {openHintIndex === idx ? "🙈 Hide Solution Hint" : "💡 Show Solution Hint"}
                      </button>
                      {openHintIndex === idx && (
                        <div className="mt-2.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-dark-200 leading-relaxed animate-slide-up">
                          <strong>Approach / Idea:</strong> {q.hint}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interview Q&A Tab */}
        {explorerSubTab === "questions" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white pl-1">Theoretical Interview Questions</h3>
            <div className="space-y-4">
              {data.questionBank.map((q, idx) => (
                <div key={idx} className="glass-card p-6 border-l-4 border-l-primary-500 hover:bg-dark-800/80 transition-colors">
                  <h4 className="text-base font-bold text-white mb-2.5 flex items-start gap-3">
                    <span className="text-primary-400 shrink-0">Q{idx + 1}.</span> {q.q}
                  </h4>
                  <p className="text-sm text-dark-300 leading-relaxed flex items-start gap-3">
                    <span className="text-emerald-400 font-bold shrink-0">A.</span> {q.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {explorerSubTab === "resources" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white pl-1">Recommended Learning Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.resources.map((res, idx) => (
                <a 
                  key={idx}
                  href={res.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 bg-dark-800/30 border border-dark-700/50 hover:border-primary-500/30 rounded-2xl flex items-center justify-between group hover:bg-dark-800/50 transition-all duration-300"
                >
                  <div>
                    <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors">{res.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-dark-700 text-dark-300 rounded uppercase mt-1.5 inline-block">{res.type}</span>
                  </div>
                  <span className="text-2xl text-dark-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all">→</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTests;
