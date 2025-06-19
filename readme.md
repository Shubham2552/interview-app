# Interview App Project Structure

This document explains the folder and file structure of the project, the purpose of each major directory, and how to extend or maintain the codebase. The architecture is designed for a **future-ready, modular, and fully configurable interview platform** supporting dynamic interviews, prompts, feedback, user groups, and more.

---

## 📁 Root Structure

```
interview-app/
│
├── verbalPilotCore/
│   ├── src/
│   │   ├── api/
│   │   │   ├── interview/
│   │   │   ├── user/
│   │   │   ├── usergroup/
│   │   │   └── dashboard/
│   │   ├── models/
│   │   │   ├── mongoSchemas/
│   │   │   ├── sequelizeSchemas/
│   │   │   └── index.js
│   │   ├── services/
│   │   │   ├── interview/
│   │   │   ├── prompt/
│   │   │   ├── usergroup/
│   │   │   └── dashboard/
│   │   ├── utils/
│   │   ├── constant/
│   │   └── config/
│   └── ...
├── prompts/
├── dashboard/
├── .env
├── package.json
└── README.md
```

---

## 📂 Key Folders & Their Purpose

### `interviewAppSource/src/api/`
- **Purpose:** Express route handlers (REST APIs) for interviews, users, user groups, and dashboard/admin features.
- **Structure:** Each feature (e.g., interview, user) has its own subfolder with controllers, routes, and validation.

### `interviewAppSource/src/models/`
- **Purpose:** Data models for both SQL (Sequelize) and NoSQL (MongoDB).
- **Subfolders:**
  - `mongoSchemas/` — MongoDB models (e.g., InterviewClass, InterviewInstance, Prompt, FeedbackConfig, UserGroup).
  - `sequelizeSchemas/` — SQL models (e.g., User, Auth).
  - `index.js` — Initializes and connects both databases.

### `interviewAppSource/src/services/`
- **Purpose:** Business logic and core engines.
- **Subfolders:**
  - `interview/` — Interview builder, runner, and session logic.
  - `prompt/` — Prompt rendering and management.
  - `usergroup/` — User group and access control logic.
  - `dashboard/` — Admin/dashboard logic.

### `interviewAppSource/src/utils/`
- **Purpose:** Utility functions, helpers, and shared logic.

### `interviewAppSource/src/constant/`
- **Purpose:** Constants, enums, and global configuration.

### `interviewAppSource/src/config/`
- **Purpose:** Configuration files (e.g., database, email, environment).

### `prompts/`
- **Purpose:** (Optional) Store prompt templates if not in DB. Organized by interview type and prompt type.

### `dashboard/`
- **Purpose:** (Optional) Frontend admin UI (React, Next.js, etc.) for managing interview structures, prompts, feedback, and user groups.

---

## 🗂️ Example MongoDB Collections

- **InterviewClass:** Defines interview structure, property keys, prompt templates, feedback config.
- **InterviewInstance:** Stores user interview sessions, property values, history, and feedback.
- **Prompt:** Stores prompt templates, types, and rendering logic.
- **FeedbackConfig:** Defines feedback types and prompts for each interview.
- **UserGroup:** Manages user group membership and interview access control.
- **User:** User info and group membership (can be in SQL or MongoDB).

---

## 🚀 How to Extend

- **Add a new interview type:**  
  Create a new `InterviewClass` document in MongoDB and add corresponding prompts/feedback configs.
- **Add a new prompt or feedback type:**  
  Add a new `Prompt` or `FeedbackConfig` document.
- **Restrict interviews to user groups:**  
  Assign `userGroupIds` to `InterviewInstance` documents.
- **No code changes needed for new types—just update the DB or use the dashboard!**

---

## 📝 Documentation in Folders

- Each folder can have its own `README.md` for local documentation.
- Use additional markdown files like `API.md`, `USAGE.md`, or `DESIGN.md` for deeper docs.

---

## 💡 Naming Conventions

- Use future-tech inspired names for folders and files (e.g., `engine/`, `kit/`, `nexus/`, `vault/`, `lab/`, etc.) for a modern, modular feel.

---

## 🛠️ Example File Names

- `engine/interviewEngine.js` — Core interview logic
- `kit/stringKit.js` — String utilities
- `vault/configVault.js` — Secure configs
- `lab/aiLab.js` — Experimental AI features

---

## 📚 Summary

This structure is designed for:
- **Maximum configurability:** All interview logic, prompts, feedback, and access are data-driven.
- **Scalability:** Easily add new features, types, and logic without code changes.
- **Maintainability:** Modular folders, clear separation of concerns, and local docs.

---

**For more details, see the `README.md` in each folder or the