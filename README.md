# AI Lead Scorer — Node.js + Express

Backend application to score B2B leads using **rule-based scoring** combined with **AI intent classification**. Upload offers and leads, run the scoring pipeline, and export results.

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Setup & Installation](#setup--installation)
5. [Environment Variables](#environment-variables)
6. [Running the App](#running-the-app)
7. [API Endpoints](#api-endpoints)
8. [CSV Format](#csv-format)
9. [Scoring Logic](#scoring-logic)
10. [Notes & Edge Cases](#notes--edge-cases)
11. [Troubleshooting](#troubleshooting)

---

## Features
- Upload an **offer** (product/service) with value propositions and ideal use cases.
- Upload **leads CSV** and normalize the data.
- Rule-based scoring (role relevance, industry match, data completeness).
- AI-based scoring using  Google Gemini APIs.
- Combine rule + AI scores (0–100) per lead.
- Export scored leads as **JSON** or **CSV**.
- Handles errors gracefully and continues scoring if AI fails.

---

## Tech Stack
- Node.js + Express.js
- ES6 Modules
- Multer for file uploads
- csv-parser / json2csv for CSV processing
- dotenv for environment variables
- Morgan for logging
- CORS middleware
- Google Gemini API for AI scoring

---

## Prerequisites
- Node.js v20+ installed
- npm or yarn
-  Google Gemini API key (for AI scoring)

---

## Setup & Installation
# 1. Clone the repo:
```bash
git clone https://github.com/Sachin-kumar-jha/ai-lead-scorer.git
cd ai-lead-scorer
```
# Install dependencies:
```bash
npm install
```
# Create .env file:
```bash
cp .env.example .env
Add your API key in .env:
env
PORT=8787
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_KEY
NODE_ENV=development
```
# Running the App
# Development Mode (auto-restart on changes):

```bash
npm run dev
```
# Production Mode:
```bash
npm run start
Default port: 8787
```

# API Endpoints
# 1️. POST /offer
Purpose: Create or update the current offer.
Body (JSON):

```json

{
  "name": "AI Outreach Automation",
  "value_props": ["24/7 outreach", "6x more meetings"],
  "ideal_use_cases": ["B2B SaaS mid-market"]
}
```
Response Example:

```json
{
  "ok": true,
  "offer": {
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach","6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"],
    "created_at": "2025-10-07T12:00:00.000Z"
  }
}
```
2️⃣ POST /leads/upload
- Purpose: Upload CSV file of leads.
 Body: form-data

- Key: file

- Value: CSV file path

# Expected CSV Columns:

```psql
name,role,company,industry,location,linkedin_bio
```
Response Example:

```json
{
  "ok": true,
  "count": 3,
  "leads_file": "data/leads.json"
}
```
# 3️. POST /score
-  Purpose: Run scoring pipeline on uploaded leads using rule + AI logic.
- Body: Empty

# Response Example:

```json
{
  "ok": true,
  "count": 3,
  "results_file": "data/results.json"
}
```
# 4️. GET /results
- Purpose: Fetch JSON results of scored leads.

# Response Example:

```json
[
  {
    "name": "Ava Patel",
    "role": "Head of Growth",
    "company": "FlowMetrics",
    "industry": "SaaS",
    "location": "San Francisco",
    "intent": "High",
    "score": 90,
    "rule_score": 40,
    "ai_points": 50,
    "reasoning": "Lead is a decision maker in SaaS mid-market, fits ICP closely."
  }
]
```
# 5️ GET /export
 - Purpose: Download scored leads as CSV (results.csv).

 - Returns CSV file with all leads and scores.

 - Headers set for automatic download.

 # CSV Format Example
```pgsql
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,SaaS,San Francisco,"Scale growth by building outbound channels. Ex-Stripe."
John Doe,Engineering Manager,Acme Corp,Manufacturing,Boston,"Leads ops for production line automation"
```

# Scoring Logic
- Rule-Based (Max 50 points)

- Role relevance: decision makers +20, influencer +10

- Industry match: exact ICP +20, adjacent +10

- Data completeness: all fields present +10

- AI-Based (Max 50 points)

- AI predicts lead intent: High → 50, Medium → 30, Low → 10

- Final Score: rule_score + ai_points (clamped between 0–100)



# License
 MIT © Sachin Kumar Jha



