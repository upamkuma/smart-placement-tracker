export const placementTopicsData = {
  "Arrays": {
    icon: "📊",
    theory: {
      introduction: "An array is a linear data structure that stores elements of the same type in contiguous memory locations. It provides constant-time O(1) access by index, but insertion and deletion are linear O(n) because other elements must be shifted. Dynamic arrays automatically resize when full, typically doubling their capacity.",
      keyConcepts: [
        { name: "Contiguous Memory", desc: "Elements are stored next to each other, allowing calculation of the address of any element in O(1) time: Address = Base_Address + Index * Element_Size." },
        { name: "Dynamic Arrays", desc: "Resizes dynamically (e.g. ArrayList in Java, vector in C++, list in Python). When full, it allocates a new array of double capacity, copies elements, and deletes the old one. Append has an amortized time complexity of O(1)." },
        { name: "Two Pointer Approach", desc: "Using two index variables to scan the array (either moving towards each other from ends, or in the same direction at different speeds e.g. slow/fast pointers)." },
        { name: "Sliding Window", desc: "Maintaining a sub-segment window of the array. The window can grow, shrink, or slide to efficiently compute properties over contiguous subarrays." }
      ],
      complexities: [
        { operation: "Access by Index", time: "O(1)", space: "O(1)" },
        { operation: "Search (Unsorted)", time: "O(n)", space: "O(1)" },
        { operation: "Search (Sorted / Binary Search)", time: "O(log n)", space: "O(1)" },
        { operation: "Insert / Delete at End (Dynamic)", time: "O(1) amortized", space: "O(1)" },
        { operation: "Insert / Delete in Middle", time: "O(n)", space: "O(1)" }
      ]
    },
    codingQuestions: [
      {
        title: "Two Sum",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/two-sum/",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        hint: "Use a Hash Map to store elements and their index. For each number, check if its complement (target - num) exists in the map."
      },
      {
        title: "Maximum Subarray (Kadane's Algorithm)",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/maximum-subarray/",
        description: "Find the contiguous subarray with the largest sum and return its sum.",
        hint: "Track running sum. If it drops below 0, reset it. Keep track of the maximum sum seen so far in a single pass."
      },
      {
        title: "3Sum",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/3sum/",
        description: "Find all unique triplets in the array that sum to zero.",
        hint: "Sort the array. Fix the first element, then use Two Pointers (left & right) on the remaining elements. Skip duplicate values."
      },
      {
        title: "Container With Most Water",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/container-with-most-water/",
        description: "Find two lines that together with the x-axis form a container containing the most water.",
        hint: "Initialize two pointers at the ends. Compute the area, update max area, and move the pointer with the shorter height inward."
      },
      {
        title: "Merge Intervals",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/merge-intervals/",
        description: "Given an array of intervals, merge all overlapping intervals.",
        hint: "Sort the intervals by start time. Iterate through and merge overlapping intervals with the last merged interval."
      },
      {
        title: "Trapping Rain Water",
        difficulty: "Hard",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/trapping-rain-water/",
        description: "Compute how much water it can trap after raining.",
        hint: "Use Two Pointers at left and right ends. Maintain leftMax and rightMax. Accumulate water relative to the shorter boundary."
      }
    ],
    resources: [
      { name: "GeeksforGeeks Arrays Tutorial", type: "Tutorial", link: "https://www.geeksforgeeks.org/array-data-structure/" },
      { name: "NeetCode Blind 75 Arrays", type: "Video Playlist", link: "https://neetcode.io/" },
      { name: "Tech Interview Handbook Arrays Cheatsheet", type: "Cheatsheet", link: "https://www.techinterviewhandbook.org/algorithms/array/" }
    ],
    questionBank: [
      { q: "What is a major advantage and disadvantage of Arrays?", a: "Advantage: Constant time O(1) random access of any element by index. Disadvantage: Fixed size (for static arrays) and costly O(n) insertions and deletions as other elements need to be shifted." },
      { q: "How is a dynamic array implemented?", a: "A dynamic array is backed by a static array. When full, it allocates a new array of double the size, copies all elements to the new array, updates the reference, and releases the old array." },
      { q: "What is row-major vs column-major order in multi-dimensional arrays?", a: "Row-major order stores elements of the 2D array row-by-row sequentially in memory (used in C/C++/Java). Column-major order stores them column-by-column (used in Fortran/MATLAB)." }
    ],
    mcqs: [
      { question: "What is the time complexity of accessing an element in an array by index?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 0, explanation: "Arrays use contiguous memory, allowing address calculation in constant time: Address = Base + Index * Size." },
      { question: "Which algorithm is used to find the maximum sum contiguous subarray?", options: ["Kruskal's", "Dijkstra's", "Kadane's", "Floyd-Warshall's"], answer: 2, explanation: "Kadane's Algorithm is a dynamic programming approach that scans the array to find the maximum sum subarray in O(n) time." },
      { question: "What is the worst-case time complexity of inserting an element in the middle of a dynamic array of size N?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 2, explanation: "Worst case requires shifting N/2 elements to the right to make space for the new element, which is O(n)." }
    ]
  },
  "Strings": {
    icon: "🔤",
    theory: {
      introduction: "A string is a sequence of characters, usually represented as an array of characters. Strings are immutable in languages like Java, Python, and JavaScript, meaning modifications create a new string. Common techniques include Two Pointers, Sliding Window, and prefix hashes.",
      keyConcepts: [
        { name: "Immutability", desc: "Strings cannot be modified in place. Modifying a string creates a new string object, which can lead to high memory usage. Use string builders or arrays in loops." },
        { name: "Anagrams", desc: "Words formed by rearranging characters of another word. Checked by sorting strings or using frequency counters (character hashes)." },
        { name: "Substrings vs Subsequences", desc: "Substrings are contiguous parts of a string. Subsequences are characters in order, but not necessarily contiguous." }
      ],
      complexities: [
        { operation: "Access Character", time: "O(1)", space: "O(1)" },
        { operation: "Length check", time: "O(1)", space: "O(1)" },
        { operation: "Concatenation (Immutable)", time: "O(n + m)", space: "O(n + m)" },
        { operation: "Substring search (KMP / Rabin-Karp)", time: "O(n + m)", space: "O(m)" }
      ]
    },
    codingQuestions: [
      {
        title: "Valid Anagram",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/valid-anagram/",
        description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
        hint: "Count character frequencies using a hash map or an array of size 26, then check if both strings have equal frequencies."
      },
      {
        title: "Valid Palindrome",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/valid-palindrome/",
        description: "Check if a string reads the same forward and backward, ignoring non-alphanumeric characters.",
        hint: "Use Two Pointers starting at the beginning and the end. Ignore non-alphanumeric characters, and compare characters case-insensitively."
      },
      {
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        description: "Find the length of the longest substring without repeating characters.",
        hint: "Use Sliding Window with a Hash Set. Expand the right pointer, and contract the left pointer if a duplicate character is found."
      },
      {
        title: "Group Anagrams",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/group-anagrams/",
        description: "Group an array of strings into sub-lists of anagrams.",
        hint: "Sort each string and use it as a key in a Hash Map to store the list of original anagram strings."
      },
      {
        title: "Minimum Window Substring",
        difficulty: "Hard",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/minimum-window-substring/",
        description: "Find the minimum window in s which contains all characters of t.",
        hint: "Use Sliding Window with two frequency maps. Expand right to find a valid window, then contract left to minimize size."
      }
    ],
    resources: [
      { name: "LeetCode String Explore Card", type: "Practice Course", link: "https://leetcode.com/explore/learn/card/array-and-string/" },
      { name: "KMP String Matching Algorithm", type: "Video Tutorial", link: "https://www.youtube.com/watch?v=GTJr8OvyEVQ" }
    ],
    questionBank: [
      { q: "Why are strings immutable in Java and Python?", a: "Security (parameters like URLs/file paths can't be changed), Caching/String Pool (saves memory by sharing identical literals), and Thread Safety (immutable objects are thread-safe)." },
      { q: "What is the difference between String, StringBuilder, and StringBuffer in Java?", a: "String is immutable. StringBuilder is mutable but NOT thread-safe (faster). StringBuffer is mutable and thread-safe (methods are synchronized, slower)." }
    ],
    mcqs: [
      { question: "What is the output of 'hello'.substring(1, 3) in JavaScript?", options: ["'el'", "'ell'", "'he'", "'hel'"], answer: 0, explanation: "substring(start, end) extracts characters from index start up to, but not including, index end." },
      { question: "Which algorithm solves substring matching in O(n + m) worst-case time?", options: ["Naive Search", "KMP Algorithm", "Binary Search", "DFS"], answer: 1, explanation: "The Knuth-Morris-Pratt (KMP) algorithm pre-processes the pattern to avoid backtracking, matching in O(n+m)." }
    ]
  },
  "Linked Lists": {
    icon: "🔗",
    theory: {
      introduction: "A Linked List is a linear data structure where elements (nodes) are stored as separate objects containing data and a reference (pointer) to the next node. Unlike arrays, nodes are not stored contiguously, allowing O(1) insertions and deletions but requiring O(n) sequential access.",
      keyConcepts: [
        { name: "Singly Linked List", desc: "Each node contains data and a pointer to the next node. Traversal is only forward." },
        { name: "Doubly Linked List", desc: "Each node contains data, next pointer, and a prev pointer. Traversal is possible in both directions." },
        { name: "Circular Linked List", desc: "The last node points back to the first node instead of null, forming a loop." },
        { name: "Dummy Node Technique", desc: "Using a placeholder head node to simplify edge cases when modifying head or links." }
      ],
      complexities: [
        { operation: "Access Node", time: "O(n)", space: "O(1)" },
        { operation: "Search Value", time: "O(n)", space: "O(1)" },
        { operation: "Insert / Delete at Head", time: "O(1)", space: "O(1)" },
        { operation: "Insert / Delete at Tail (with tail ref)", time: "O(1)", space: "O(1)" },
        { operation: "Insert / Delete in Middle", time: "O(1) after search", space: "O(1)" }
      ]
    },
    codingQuestions: [
      {
        title: "Reverse a Linked List",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/reverse-linked-list/",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        hint: "Maintain three pointers: prev (null), curr (head), and next (null). In a loop, store curr.next, set curr.next to prev, move prev to curr, and curr to next."
      },
      {
        title: "Linked List Cycle (Floyd's Fast/Slow Pointers)",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/linked-list-cycle/",
        description: "Determine if a linked list contains a cycle.",
        hint: "Initialize slow and fast pointers at head. Move slow by 1 step and fast by 2 steps. If they meet, there is a cycle."
      },
      {
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/merge-two-sorted-lists/",
        description: "Merge two sorted linked lists into one sorted list.",
        hint: "Use a dummy head node. Compare nodes of both lists and link the smaller one to the current merged list. Repeat until empty."
      },
      {
        title: "Remove Nth Node From End of List",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        description: "Remove the nth node from the end of the list and return its head.",
        hint: "Advance a 'fast' pointer by n steps first. Then move both 'slow' and 'fast' together. When fast reaches tail, slow is just before the target."
      },
      {
        title: "LRU Cache",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/lru-cache/",
        description: "Design a Least Recently Used (LRU) cache with O(1) time operations.",
        hint: "Use a Hash Map for O(1) lookups combined with a Doubly Linked List to store elements in order of access recency."
      }
    ],
    resources: [
      { name: "MyCodeSchool Linked Lists", type: "Video Playlist", link: "https://www.youtube.com/playlist?list=PL2_aWCzGMAwI3W_yfRjtYX5750iF-AW7P" },
      { name: "GeeksforGeeks Linked Lists", type: "Tutorial", link: "https://www.geeksforgeeks.org/data-structures/linked-list/" }
    ],
    questionBank: [
      { q: "Why is insertion in a Linked List O(1) compared to O(n) in Arrays?", a: "Linked list nodes are linked by pointers. Inserting a node only requires updating the pointer references of the adjacent nodes. No elements need to be shifted in memory, making it O(1) once the insertion point is found." },
      { q: "How do you detect the start node of a cycle in a linked list?", a: "Use Floyd's Cycle Detection to find if a cycle exists. Once slow and fast pointers meet, reset slow to the head node. Move both slow and fast pointers one step at a time. The node where they meet again is the start of the cycle." }
    ],
    mcqs: [
      { question: "What is the time complexity to search an element in a singly linked list of size N?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2, explanation: "Linked lists do not support random access. Searching requires traversing node by node from head, taking O(n) time." },
      { question: "Which linked list representation allows traversing backward?", options: ["Singly Linked List", "Circular Linked List", "Doubly Linked List", "Header Linked List"], answer: 2, explanation: "Doubly Linked Lists store both next and prev pointers in each node, allowing traversal in both directions." }
    ]
  },
  "Trees & Graphs": {
    icon: "🌳",
    theory: {
      introduction: "Trees and Graphs are non-linear data structures. A Tree is a connected acyclic graph. A Graph consists of vertices (nodes) and edges. Standard algorithms include DFS, BFS, Dijkstra's, and Minimum Spanning Trees.",
      keyConcepts: [
        { name: "Binary Trees & BST", desc: "Trees where nodes have at most 2 children. Binary Search Tree (BST) maintains left < root < right." },
        { name: "DFS & BFS", desc: "Depth-First Search (uses Stack/Recursion) explores deep before backtracking. Breadth-First Search (uses Queue) explores level-by-level." },
        { name: "Graph Representations", desc: "Adjacency Matrix (V x V grid, good for dense graphs) and Adjacency List (array of lists, memory efficient for sparse graphs)." },
        { name: "Shortest Path", desc: "BFS for unweighted graphs, Dijkstra's for weighted graphs with positive edges, Bellman-Ford for negative edge weights." }
      ],
      complexities: [
        { operation: "BST Search / Insert (Balanced)", time: "O(log n)", space: "O(h) stack" },
        { operation: "BST Search / Insert (Skewed)", time: "O(n)", space: "O(n) stack" },
        { operation: "BFS / DFS Traversal", time: "O(V + E)", space: "O(V)" },
        { operation: "Dijkstra's (Min-Heap)", time: "O((V + E) log V)", space: "O(V)" }
      ]
    },
    codingQuestions: [
      {
        title: "Invert a Binary Tree",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/invert-binary-tree/",
        description: "Invert a binary tree (swap left and right subtrees recursively).",
        hint: "Write a recursive function. Swap the left and right pointers of the current node, then recursively call invert on left and right children."
      },
      {
        title: "Maximum Depth of Binary Tree",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        description: "Find the height/maximum depth of a binary tree.",
        hint: "Base case: if node is null, return 0. Otherwise, return 1 + max(maxDepth(left), maxDepth(right))."
      },
      {
        title: "Binary Tree Level Order Traversal",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
        description: "Return the level order (BFS) traversal of its nodes' values.",
        hint: "Use a Queue. Push root. Loop while queue is not empty, process all nodes at current level, and push their children."
      },
      {
        title: "Course Schedule (Cycle Detection / Topological Sort)",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/course-schedule/",
        description: "Determine if courses can be completed given prerequisites (detect cycle in directed graph).",
        hint: "Use Kahn's Algorithm (BFS topological sort using in-degrees) or DFS checking for back edges using a recursion stack state."
      },
      {
        title: "Clone Graph",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/clone-graph/",
        description: "Create a deep copy of a connected undirected graph.",
        hint: "Use a Map to track visited nodes <OriginalNode, ClonedNode>. Perform BFS or DFS, cloning nodes and edges recursively."
      }
    ],
    resources: [
      { name: "Luv Graph Playlist", type: "Video Playlist", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0rGEWeOhImy1tqB3JLgFCyc" },
      { name: "GeeksforGeeks Tree Tutorial", type: "Tutorial", link: "https://www.geeksforgeeks.org/binary-tree-data-structure/" }
    ],
    questionBank: [
      { q: "What is the difference between Binary Tree and Binary Search Tree (BST)?", a: "A Binary Tree is a tree where each node has at most 2 children. A BST is a binary tree with the strict ordering property: left subtree values < node value < right subtree values." },
      { q: "What is a topological sort of a graph?", a: "Topological sort is a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge u -> v, vertex u comes before v in the ordering. Used in build systems, course schedule planning, and task ordering." }
    ],
    mcqs: [
      { question: "Which traversal of a Binary Search Tree output values in ascending sorted order?", options: ["Preorder", "Inorder", "Postorder", "Level-order"], answer: 1, explanation: "Inorder traversal visits Left, Root, Right. In a BST, this guarantees ascending sorted output." },
      { question: "Which data structure is used in Breadth-First Search (BFS)?", options: ["Stack", "Queue", "Min-Heap", "BST"], answer: 1, explanation: "BFS explores level by level, which follows First-In-First-Out (FIFO) ordering. Therefore, a Queue is used." }
    ]
  },
  "Dynamic Programming": {
    icon: "📈",
    theory: {
      introduction: "Dynamic Programming (DP) is an algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems. It is applicable when subproblems overlap and show optimal substructure (optimal solution contains optimal subproblem solutions). DP utilizes Memoization (Top-Down) or Tabulation (Bottom-Up) to avoid duplicate calculations.",
      keyConcepts: [
        { name: "Overlapping Subproblems", desc: "Solving the same subproblems repeatedly. DP saves these solutions in a table (array/hash map) to retrieve in O(1) time." },
        { name: "Optimal Substructure", desc: "The globally optimal solution can be constructed efficiently from the optimal solutions of its subproblems." },
        { name: "Top-Down (Memoization)", desc: "Recursion + caching. Solve recursively, and before computing, check if the solution is already cached." },
        { name: "Bottom-Up (Tabulation)", desc: "Iterative + table filling. Build solutions bottom-up, starting from base cases." }
      ],
      complexities: [
        { operation: "Fibonacci (Naive Recursion)", time: "O(2^n)", space: "O(n) stack" },
        { operation: "Fibonacci (DP)", time: "O(n)", space: "O(1) space optimized" },
        { operation: "0/1 Knapsack", time: "O(N * W)", space: "O(N * W) or O(W)" }
      ]
    },
    codingQuestions: [
      {
        title: "Climbing Stairs",
        difficulty: "Easy",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/climbing-stairs/",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        hint: "This is a Fibonacci variant: dp[i] = dp[i-1] + dp[i-2]. Base cases: dp[1]=1, dp[2]=2. Optimize space to O(1) using two variables."
      },
      {
        title: "Coin Change",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/coin-change/",
        description: "Find the fewest number of coins needed to make up a given amount.",
        hint: "Use bottom-up DP. dp[i] represents min coins for amount i. Recurrence: dp[i] = min(dp[i], 1 + dp[i - coin]) for each coin."
      },
      {
        title: "Longest Common Subsequence (LCS)",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/longest-common-subsequence/",
        description: "Given two strings text1 and text2, return the length of their longest common subsequence.",
        hint: "Create a 2D grid DP table. If characters match, dp[i][j] = 1 + dp[i-1][j-1]. Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1])."
      },
      {
        title: "Longest Increasing Subsequence (LIS)",
        difficulty: "Medium",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/longest-increasing-subsequence/",
        description: "Find the length of the longest strictly increasing subsequence in an array.",
        hint: "O(n^2) DP: dp[i] = 1 + max(dp[j]) for j < i and nums[j] < nums[i]. Or O(n log n) using binary search (patience sorting) on a tails array."
      },
      {
        title: "Edit Distance",
        difficulty: "Hard",
        platform: "LeetCode",
        link: "https://leetcode.com/problems/edit-distance/",
        description: "Find the minimum operations (insert, delete, replace) to convert word1 to word2.",
        hint: "Let dp[i][j] be edit distance for prefix lengths i and j. If matching: dp[i-1][j-1]. Else: 1 + min(insert dp[i][j-1], delete dp[i-1][j], replace dp[i-1][j-1])."
      }
    ],
    resources: [
      { name: "Aditya Verma DP Playlist", type: "Video Playlist", link: "https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqHdDn51ODcxSqL5gRL1" },
      { name: "MIT dynamic programming lecture", type: "Video Lectures", link: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-19-dynamic-programming-i-fibonacci-shortest-paths/" }
    ],
    questionBank: [
      { q: "What is the difference between Memoization and Tabulation?", a: "Memoization is a Top-Down approach that uses recursion. It starts with the main problem and solves subproblems recursively, saving results in a cache. Tabulation is a Bottom-Up approach that uses iteration. It starts solving from base cases and fills the DP table iteratively." },
      { q: "When should we use Greedy vs Dynamic Programming?", a: "Use Greedy when local optimal choices lead to a global optimal solution (shows greedy choice property). Use Dynamic Programming when the problem has overlapping subproblems and optimal substructure, and local choices are not sufficient (we need to evaluate all subproblems)." }
    ],
    mcqs: [
      { question: "What is the time complexity of the naive recursive Fibonacci algorithm?", options: ["O(log n)", "O(n)", "O(n log n)", "O(2^n)"], answer: 3, explanation: "Naive recursion recalculates subproblems repeatedly, creating a recursion tree of height N with 2 branches per node, resulting in exponential O(2^n) time." },
      { question: "Which property is NOT required to apply Dynamic Programming?", options: ["Optimal Substructure", "Overlapping Subproblems", "LIFO execution stack", "State relation (Recurrence)"], answer: 2, explanation: "LIFO execution stack is an implementation detail for recursion, but DP can be implemented iteratively (tabulation) without recursion." }
    ]
  },
  "System Design": {
    icon: "🏗️",
    theory: {
      introduction: "System Design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements. Scalability, availability, latency, throughput, and consistency are core aspects to consider.",
      keyConcepts: [
        { name: "Horizontal vs Vertical Scaling", desc: "Vertical scaling (scale up) adds resources (CPU, RAM) to one server. Horizontal scaling (scale out) adds more servers to the resource pool." },
        { name: "Load Balancing", desc: "Distributes incoming traffic across multiple servers (Round Robin, Least Connections, IP Hash) to ensure high availability and load distribution." },
        { name: "Caching", desc: "Temporary, fast storage (Redis, Memcached) to hold frequently accessed data, reducing DB reads and reducing response latency." },
        { name: "Database Sharding", desc: "Partitioning a database horizontally across multiple database instances to distribute query and storage load." },
        { name: "CAP Theorem", desc: "A distributed system can guarantee at most two of: Consistency, Availability, and Partition Tolerance." }
      ],
      complexities: [
        { operation: "Single Node database read", time: "Millisecond scale", space: "High disk/RAM" },
        { operation: "Cache lookup (Redis)", time: "Sub-millisecond scale", space: "In-memory" },
        { operation: "CDN lookup", time: "Fast (Edge location)", space: "Static assets only" }
      ]
    },
    codingQuestions: [
      {
        title: "Design a Rate Limiter",
        difficulty: "Medium",
        platform: "System Design",
        link: "https://bytebytego.com/",
        description: "Design a system that limits the number of requests a client can make in a given time period.",
        hint: "Discuss algorithms like Token Bucket, Leaky Bucket, Sliding Window Log, or Sliding Window Counter. Mention using Redis for storing request timestamps."
      },
      {
        title: "Design a URL Shortener (TinyURL)",
        difficulty: "Medium",
        platform: "System Design",
        link: "https://www.youtube.com/watch?v=fMZMm_0ZhK4",
        description: "Design a service that generates short URLs redirecting to original links.",
        hint: "Use Base62 encoding on unique IDs generated by a distributed ID generator (like Snowflake) or hashing (MD5) with collision resolution. Talk about caching redirects."
      },
      {
        title: "Design YouTube / Netflix",
        difficulty: "Hard",
        platform: "System Design",
        link: "https://bytebytego.com/",
        description: "Design a high-scale video streaming platform.",
        hint: "Focus on video ingestion pipeline, chunking, transcoding (encoding in multiple resolutions), Content Delivery Network (CDN) distribution, and metadata management."
      }
    ],
    resources: [
      { name: "ByteByteGo System Design Primer", type: "Course", link: "https://bytebytego.com/" },
      { name: "Gaurav Sen System Design", type: "Video Playlist", link: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX" },
      { name: "System Design Primer GitHub Repo", type: "Repository", link: "https://github.com/donnemartin/system-design-primer" }
    ],
    questionBank: [
      { q: "What is the difference between SQL and NoSQL databases?", a: "SQL databases are relational, structured, schema-bound, and support ACID transactions (good for financial systems, complex queries). NoSQL databases are non-relational, schema-less, scale horizontally easily, and support key-value, document, column-family, or graph models (good for high-throughput write, unstructured data)." },
      { q: "Explain the CAP Theorem.", a: "CAP theorem states that a distributed database can guarantee at most two out of three: Consistency (all reads get the latest write), Availability (every non-failing node returns a response), and Partition Tolerance (system continues to operate despite network partition/node drops). Since partitions will occur in real networks, we must choose between AP (Availability) and CP (Consistency)." }
    ],
    mcqs: [
      { question: "What does CDN stand for?", options: ["Content Delivery Network", "Central Database Node", "Cloud Distributed Node", "Computer Data Network"], answer: 0, explanation: "Content Delivery Network refers to a geographically distributed group of servers that work together to provide fast delivery of Internet content." },
      { question: "Which load balancing algorithm routes client requests to the server with the lowest current traffic/active connections?", options: ["Round Robin", "IP Hash", "Least Connections", "Weighted Round Robin"], answer: 2, explanation: "Least Connections algorithm monitors active connections and sends new requests to the server with the fewest active connections." }
    ]
  },
  "DBMS & SQL": {
    icon: "🗄️",
    theory: {
      introduction: "A Database Management System (DBMS) is software used to store, retrieve, and run queries on data. Relational databases (RDBMS) use tables and SQL for operations, and enforce ACID properties. NoSQL databases use various models and prioritize scalability.",
      keyConcepts: [
        { name: "ACID Properties", desc: "Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent concurrent transactions), Durability (persistent changes)." },
        { name: "SQL JOINs", desc: "INNER JOIN (common keys), LEFT JOIN (all left + matching right), RIGHT JOIN (all right + matching left), FULL OUTER JOIN (all records)." },
        { name: "Indexes", desc: "B-Tree or Hash data structures that speed up query retrieval at the cost of additional write latency and storage space." },
        { name: "Normalization", desc: "Decomposing tables to eliminate data redundancy and prevent insertion/deletion anomalies (1NF, 2NF, 3NF, BCNF)." }
      ],
      complexities: [
        { operation: "Primary Key Query (Index scan)", time: "O(log N)", space: "O(1)" },
        { operation: "Full Table Scan (No Index)", time: "O(N)", space: "O(1)" },
        { operation: "Unindexed JOIN of M and N rows", time: "O(M * N)", space: "O(1)" }
      ]
    },
    codingQuestions: [
      {
        title: "Find Second Highest Salary",
        difficulty: "Easy",
        platform: "LeetCode SQL",
        link: "https://leetcode.com/problems/second-highest-salary/",
        description: "Write a SQL query to report the second highest salary from the Employee table.",
        hint: "Use: SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee); Or use LIMIT 1 OFFSET 1 with ORDER BY DESC."
      },
      {
        title: "Department Highest Salary",
        difficulty: "Medium",
        platform: "LeetCode SQL",
        link: "https://leetcode.com/problems/department-highest-salary/",
        description: "Find employees who have the highest salary in each of the departments.",
        hint: "Use a subquery with IN or a JOIN matching the combination of departmentId and max(salary) grouped by departmentId."
      }
    ],
    resources: [
      { name: "SQLZoo Interactive Tutorial", type: "Interactive", link: "https://sqlzoo.net/" },
      { name: "Kudvenkat SQL Server Playlist", type: "Video Playlist", link: "https://www.youtube.com/playlist?list=PL08903FB7ACA1C2FB" }
    ],
    questionBank: [
      { q: "What is the difference between primary key, unique key, and foreign key?", a: "Primary Key uniquely identifies a row, cannot be NULL, and a table can have only one. Unique Key uniquely identifies rows but allows a single NULL value, and a table can have multiple. Foreign Key establishes a relationship between tables, referencing a primary key in another table." },
      { q: "What is database normalization and why is it needed?", a: "Normalization is the process of organizing database tables to reduce data redundancy and dependency. It involves dividing large tables into smaller ones and linking them. It helps prevent data anomalies (insertion, deletion, update anomalies) and ensures data integrity." }
    ],
    mcqs: [
      { question: "Which SQL clause is used to filter records AFTER they have been grouped?", options: ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], answer: 1, explanation: "WHERE filters rows before grouping. HAVING is specifically used to filter groups based on aggregate functions." },
      { question: "What does the 'I' in ACID stand for?", options: ["Integration", "Integrity", "Isolation", "Immutability"], answer: 2, explanation: "Isolation ensures that concurrently executing transactions do not interfere with each other, presenting a serialized view." }
    ]
  },
  "Object-Oriented Programming": {
    icon: "📦",
    theory: {
      introduction: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects', which contain data (fields/attributes) and code (methods). OOP facilitates modularity, reuse, and extensibility.",
      keyConcepts: [
        { name: "Encapsulation", desc: "Bundling data and methods that operate on that data into a single unit (class), restricting direct access (using private variables, public getters/setters)." },
        { name: "Inheritance", desc: "A mechanism where a child class acquires properties and behaviors of a parent class (reusability)." },
        { name: "Polymorphism", desc: "The ability of a message or method to be processed in more than one form. Includes Compile-time (Method Overloading) and Runtime (Method Overriding)." },
        { name: "Abstraction", desc: "Hiding internal complexity and showing only essential details to the user (using abstract classes and interfaces)." }
      ],
      complexities: [
        { operation: "Virtual Method dispatch lookup", time: "O(1) via VMT / vtable", space: "Small vtable pointer per object" }
      ]
    },
    codingQuestions: [
      {
        title: "Design a Parking Lot",
        difficulty: "Medium",
        platform: "Object Oriented Design",
        link: "https://www.youtube.com/watch?v=DSGsa0pu8-k",
        description: "Design a parking lot system, mapping classes like ParkingLot, Floor, Spot, Vehicle, and Ticket.",
        hint: "Apply encapsulation. Define clear inheritance for vehicles (Car, Bike, Truck). Use design patterns like Singleton for the parking lot manager."
      },
      {
        title: "Design Movie Ticket Booking System",
        difficulty: "Medium",
        platform: "Object Oriented Design",
        link: "https://www.youtube.com/watch?v=2Zp96U_Fv-g",
        description: "Design a system like BookMyShow, handling cinema halls, shows, seat layouts, bookings, and payments.",
        hint: "Define clear abstractions. Show relations between Cinema, Screen, Show, Booking, Seat, and Payment. Ensure concurrency handling during seat selection."
      }
    ],
    resources: [
      { name: "Sourcemaking Design Patterns", type: "Reference", link: "https://sourcemaking.com/design_patterns" },
      { name: "OOP Java concepts tutorial", type: "Tutorial", link: "https://docs.oracle.com/javase/tutorial/java/concepts/" }
    ],
    questionBank: [
      { q: "What is the difference between an Interface and an Abstract Class?", a: "Abstract class can have instance variables and concrete method implementations. A class can inherit from only one abstract class (single inheritance). Interface contains only abstract methods (pre-Java 8) and static final constants. A class can implement multiple interfaces (multiple inheritance)." },
      { q: "Explain runtime polymorphism with an example.", a: "Runtime polymorphism occurs when a call to an overridden method is resolved at runtime rather than compile time. For example: A parent class Animal has a method makeSound(). Child classes Dog and Cat override makeSound(). If we write Animal myAnimal = new Dog(); myAnimal.makeSound(), the Dog's makeSound() is executed." }
    ],
    mcqs: [
      { question: "Which OOP concept is defined as hiding background details and representing only essential features?", options: ["Inheritance", "Abstraction", "Encapsulation", "Polymorphism"], answer: 1, explanation: "Abstraction simplifies complex systems by hiding unnecessary implementation details and exposing only the essential interfaces." },
      { question: "What is method overloading?", options: ["Defining parent methods in child class", "Defining multiple methods with same name but different signatures in same class", "Writing methods that throw exceptions", "Defining methods with different names"], answer: 1, explanation: "Method overloading is a compile-time polymorphism feature where a class has multiple methods with the same name but different parameter count, types, or order." }
    ]
  }
};
