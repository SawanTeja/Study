# Emplo AI: The Complete Codebase & Architecture Guide

Welcome to the definitive guide to the Emplo AI Backend. This document doesn't just explain the architecture—it takes you directly into the actual source code, breaking down exactly how the application is built, from setting up the server to the complex AI algorithms. 

By the end of this guide, you will understand how to read, modify, and extend this codebase.

---

## Phase 1: High-Level Project Overview & Tech Stack

This backend is a **Node.js REST API** using **Express.js**. It powers the **Emplo AI** platform, which handles job postings, applicant tracking, AI-powered resume parsing/scoring, and fully automated live AI interviews.

### Core Dependencies:
- **`express`**: Our main HTTP server.
- **`mongoose`**: Maps our JavaScript objects to our **MongoDB** database.
- **`zod`**: Validates incoming data requests.
- **`@clerk/clerk-sdk-node` & `jsonwebtoken`**: Handles secure user authentication.
- **`@google/genai`**: Connects to the Gemini AI model for intelligence.
- **`@deepgram/sdk`**: Converts audio to text (STT) and text to audio (TTS).

---

## Phase 2: Codebase Structure

```
📁 emplo-backend-main
├── 📁 config/        # Environment variables (.env mapping)
├── 📁 middlewares/   # Bouncers that intercept requests (e.g., auth.js)
├── 📁 models/        # Mongoose Schemas & Zod Validators
├── 📁 routes/        # API endpoints (jobs.js, profile.js, etc.)
├── 📁 scripts/       # Helper CLI scripts (seeding DB)
├── 📁 utils/         # Reusable tools (logger, gemini_utils.js)
├── server.js         # The main entrypoint
├── package.json      # NPM dependencies
```

---

## Phase 3: A Walkthrough of the Actual Code

Let's look at the actual code that powers the application, file by file.

### 3.1 Server Initialization (`server.js`)

`server.js` is the entry point of the entire application. When you run `npm start`, this is the file that executes.

```javascript
// server.js (Snippet)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./utils/database');
const logger = require('./utils/logger');

// 1. Initialize the MongoDB connection
connectDB();

const app = express();

// 2. Global Middlewares
app.use(helmet()); // Adds security headers to prevent attacks
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Allows the frontend to talk to us
app.use(express.json()); // Parses incoming JSON data

// 3. Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${duration}ms`);
  });
  next();
});

// 4. Mount the API Routes
const jobsRouter = require('./routes/jobs');
app.use(jobsRouter);
// ... mounts other routes ...

// 5. Start listening for traffic
app.listen(8000, () => {
  logger.info(`Server listening on port 8000`);
});
```

**How it works:**
1. It connects to the MongoDB database first.
2. It sets up `helmet` and `cors` to secure the server.
3. It sets up a custom logger that times every single request.
4. It imports all our routers (like `jobs.js`) and attaches them to the `app`.
5. It starts listening on port 8000.

---

### 3.2 Authentication & Security (`middlewares/auth.js`)

When a user tries to create a job or apply, we need to know who they are. We use Clerk for this. When the user logs in on the frontend, Clerk gives them a digital ID card (a JWT token). Our backend must verify that token.

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Connect to Clerk's public keys
const client = jwksClient({
  jwksUri: `https://api.clerk.com/v1/jwks`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// The Security Guard Middleware
const verifyClerkToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token string

  // Verify the token cryptographically
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ detail: 'Invalid token' });
    }
    
    // Attach the user's ID to the request so our routes know who called them!
    req.clerkUserId = decoded.sub;
    next(); // Let the request proceed to the route
  });
};

module.exports = { verifyClerkToken };
```

**How it works:**
Whenever we attach `verifyClerkToken` to a route, this code runs *before* the route logic. It extracts the `Authorization: Bearer <token>` header, fetches Clerk's cryptographic keys to ensure the token wasn't forged, and then securely attaches `req.clerkUserId` to the request object. 

---

### 3.3 Database Blueprints (`models/index.js`)

To ensure we never save bad data to MongoDB, we define strict Schemas.

```javascript
// models/index.js (Snippet)
const mongoose = require('mongoose');

// The Job Blueprint
const JobSchema = new mongoose.Schema({
  clerk_user_id: { type: String, required: true }, // Who created the job
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary_min: Number,
  salary_max: Number,
  skills_required: [{ type: String }], // Array of strings (e.g. ['React', 'Node'])
  status: { type: String, default: "active" },
  question_weights: mongoose.Schema.Types.Mixed // How the AI should grade candidates
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Job = mongoose.model('Job', JobSchema, 'jobs');

// The Interview Transcript Blueprint
const MessageSchema = new mongoose.Schema({
  role: { type: String, required: true }, // 'user' or 'assistant'
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  topic: String,
  is_follow_up: Boolean,
  timestamp: Date
}, { _id: false });

const TranscriptSchema = new mongoose.Schema({
  job_id: { type: String, required: true },
  clerk_user_id: { type: String, required: true }, // The candidate
  messages: [MessageSchema], // The full conversation history
  question_count: { type: Number, default: 0 },
  turn_count: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Transcript = mongoose.model('Transcript', TranscriptSchema, 'transcripts');

module.exports = { Job, Transcript };
```

**How it works:**
Mongoose prevents us from saving a `Job` without a `title` because it is marked `required: true`. The `Transcript` stores an array of `messages`. Because we store the entire chat history in this array, we can feed it to the AI on every turn so it remembers context!

---

### 3.4 API Endpoints (`routes/jobs.js`)

Here is how an Employer creates a job.

```javascript
// routes/jobs.js (Snippet)
const express = require('express');
const router = express.Router();
const { verifyClerkToken } = require('../middlewares/auth');
const { Job } = require('../models');
const { JobCreateSchema } = require('../models/validators'); // Zod schema

// POST /jobs - Create job
router.post('/jobs', verifyClerkToken, async (req, res, next) => {
  try {
    // 1. Zod validation checks the incoming data payload
    const parsed = JobCreateSchema.parse(req.body);
    
    // 2. Create the Database Document, injecting the verified clerkUserId
    const job = new Job({ 
        ...parsed, 
        clerk_user_id: req.clerkUserId 
    });
    
    // 3. Save to MongoDB
    await job.save();
    
    // 4. Return success
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ detail: error.errors || error.message });
  }
});
```

**How it works:**
Notice the `verifyClerkToken` inserted in the middle of the route definition. This guarantees `req.clerkUserId` exists securely. Next, `JobCreateSchema.parse` acts as a second wall of defense, throwing an error if the user passed invalid types (like a String for `salary_min`). Finally, it saves the object via Mongoose.

---

### 3.5 The AI Interview Engine (`routes/interview_routes.js`)

This is the most complex logic. When a candidate speaks, their voice is converted to text (by Deepgram) and sent to the `/ask` endpoint. Let's look at the core of `/ask`.

```javascript
// routes/interview_routes.js (Simplified POST /ask endpoint)

router.post('/ask', verifyClerkToken, async (req, res, next) => {
    // 1. Fetch the active interview transcript
    const transcript = await Transcript.findById(req.body.interview_id);
    
    // 2. Save the candidate's answer into the database
    const now = new Date();
    await Transcript.updateOne(
      { _id: transcript._id },
      { $push: { messages: { role: 'user', content: req.body.user_response, timestamp: now } } }
    );

    // 3. Check for Time/Turn Limits
    const messages = transcript.messages;
    const turnCount = Math.floor(messages.length / 2);
    if (turnCount >= 16) {
        return completeInterview(transcript, 'turn_limit'); 
    }

    // 4. Prepare context for the AI
    // We only send the last 4 messages to the AI to save tokens and prevent overload
    const conversationHistory = messages.slice(-4); 
    
    // 5. Ask Gemini to generate the next question
    const followup = await generateFollowup({
      resume: candidateResume,
      jobDescription: job.description,
      userResponse: req.body.user_response,
      coreQuestionCount: transcript.question_count,
      conversationHistory: conversationHistory
    });

    // 6. Save the AI's response to the database
    await Transcript.updateOne(
      { _id: transcript._id },
      {
        $push: { messages: { role: 'assistant', content: followup.question, topic: followup.topic, is_follow_up: followup.is_follow_up, timestamp: new Date() } }
      }
    );

    // 7. Send the AI's question back to the frontend to be spoken aloud
    res.json({
      question: followup.question,
      is_follow_up: followup.is_follow_up
    });
});
```

**How it works:**
This creates an "AI State Machine". 
1. We log the user's answer.
2. We verify they haven't talked for too long (16 turns max).
3. We grab their resume, the job description, and the recent chat history, and bundle it into a massive prompt for Gemini (`generateFollowup`).
4. Gemini decides whether to ask a follow-up question or move to a new topic.
5. The AI's decision is saved back to the database, and returned to the frontend.

---

## Phase 4: Post-Interview Evaluation

During the live interview, the AI is optimized to reply as fast as possible. It does **not** grade the user while talking to them. 

Instead, once the `turn_limit` or `time_limit` is reached, `completeInterview()` is called. This triggers a completely separate file: `routes/interview_evaluator.js`.

The evaluator reads the ENTIRE `Transcript.messages` array and sends it to the AI in the background. It asks the AI to act as a strict Judge and generate a scorecard. Because the user is no longer waiting for a response, the AI can take 30-40 seconds to write a highly detailed JSON scorecard, which is then saved to the `InterviewScore` model.

---

## Phase 5: Helper Scripts (`scripts/`)

To develop faster, we write manual JS files that bypass the API.

For example, `scripts/seed_vedaai.js` connects directly to MongoDB via Mongoose and inserts a fake `Employer` and a fake `Job` so a developer doesn't have to manually click through the frontend UI to test the application. To use it, a developer simply runs:
`node scripts/seed_vedaai.js` in the terminal.

---

**You now understand the actual code structure of Emplo AI.** 🚀
By reading the Middlewares, Models, and Routers above, you can confidently navigate the codebase and understand exactly how data flows from an HTTP request to the MongoDB database!
