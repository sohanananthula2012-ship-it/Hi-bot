# 👋 Hi Bot

> The smallest possible production workflow built with `lanes-engine`.

Hi Bot is a tiny example application that demonstrates how to build real-world automations using `lanes-engine`.

A user action enters the Wizard runtime, is routed through a lane, and performs a real action: sending an email.

This project exists to answer one question:

> **"What can I actually build with lanes-engine?"**

The answer is:

> **Production workflows with surprisingly little code.**

---

## ✨ Features

- ⚡ Built on `lanes-engine`
- 📨 Sends real emails
- 🛣️ Demonstrates lane routing
- 🧙 Uses the Wizard runtime
- 🧩 Extremely small and easy to understand
- 🚀 Perfect starting point for your own bots and automations

---

# Workflow

```text
User Action
      │
      ▼
 Wizard Runtime
      │
      ▼
 Lane Execution
      │
      ▼
 Send Email
      │
      ▼
 User receives message
```

---

# Example

A user triggers the workflow.

The bot sends:

```text
Subject: Hi from Hi Bot 👋

Hello!

This email was sent by Hi Bot running on lanes-engine.
```

---

# Screenshot

![Hi Bot Email](example.png)

A real email delivered by the example workflow.

---

# Project Structure

```text
hi-bot/
├── src/
│   ├── app.js
│   ├── lanes.js
│   └── mailer.js
├── assets/
│   └── email-example.png
├── .env.example
├── package.json
└── README.md
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/sohanananthula2012-ship-it/hi-bot.git
cd hi-bot
npm install
```

---

# Requirements

Hi Bot uses **ORCHIDS Email** to send messages.

Before running the application, you'll need an **ORCHIDS Email Key**.

If you don't have one:

1. Go to:

https://bud.app

2. Create a project.

3. Ask it:

```text
Generate an ORCHIDS Email Key
```

4. Copy the generated key.

---

# Configuration

Create a `.env` file:

```env
ORCHIDS_KEY=your_key_here
FROM_EMAIL=hello@example.com
TO_EMAIL=you@example.com
```

---

# First Run

If you start the application without an ORCHIDS key, you'll see:

```text
No ORCHIDS_KEY found.

Add your ORCHIDS Key to continue.

Don't have one?

Go to https://bud.app
Create a project and ask:

"Generate an ORCHIDS Email Key"
```

---

# Running

```bash
npm start
```

or

```bash
node src/app.js
```

---

# Example Output

```text
✔ Wizard started
✔ Route matched: send-email
✔ Email queued
✔ Email delivered

Workflow completed in 186ms.
```

---

# Understanding the Flow

The code intentionally stays small:

```text
Button Click
      ↓
Wizard receives event
      ↓
Lane selected
      ↓
Email sent
      ↓
Workflow completed
```

This same pattern can power much larger systems.

---

# Build From Here

Hi Bot is intentionally tiny, but the same architecture can power:

- Contact form bots
- Customer onboarding flows
- Notification systems
- Telegram bots
- Discord automations
- AI agents
- Scheduled jobs
- Approval pipelines
- Multi-step workflows
- Production email systems

---

# Why This Example Exists

Most examples are either:

- too small to be useful, or
- too large to understand.

Hi Bot aims to be neither.

It is:

- small enough to read in a few minutes,
- realistic enough to demonstrate an actual workflow,
- simple enough to extend into your own projects.

---

# About lanes-engine

`lanes-engine` is a framework for building:

- workflows
- automations
- bots
- agents
- parallel execution pipelines

Features include:

- 🧙 Wizard runtime
- 🛣️ Lanes architecture
- ⚡ Parallel execution
- 📊 Reports
- 🩺 Diagnostics
- 🔍 Debugging tools
- 🧩 Modular design
- 🖥️ Production-ready CLI

---

# Installation

## npm

```bash
npm install lanes-engine
```

## PyPI

```bash
pip install lanes-engine
```

---

# Learn More

- GitHub: https://github.com/sohanananthula2012-ship-it/lanes-engine
- npm: https://www.npmjs.com/package/lanes-engine
- PyPI: https://pypi.org/project/lanes-engine/

---

# Contributing

Issues and pull requests are welcome.

If you build something cool with `lanes-engine`, we'd love to see it.

---

# License

MIT © Sohan Ananthula

---

> Built as an educational example for the `lanes-engine` ecosystem.
>
> **Small project. Real workflow. Zero fluff.**
