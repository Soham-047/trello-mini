# Trello Clone

A full-stack **Trello-like** project management app built with a modern stack: **Django + DRF + Channels (backend)** and **React (frontend)**.  
It supports personal & project boards, lists, cards, file attachments, notifications and realtime-ish features via Redis.  

---

## 🚀 Features

### 🔑 Authentication
- Register & login using JWT (Simple JWT)
- Login with **username or email**

### 👥 Projects (Teams)
- Create projects (teams)
- Invite members with one-time invite links
- Manage roles: **Admin** (can edit project, invite, manage access) or **Member**

### 📋 Boards
- Personal & project boards
- Recently viewed and starred boards
- Create, rename, reorder lists
- Create, move, reorder cards  
  - Labels, assignees, attachments, comments
- 🔍 Search with autocomplete (debounced)
- 🌆 Board backgrounds (colors + Unsplash images)  
  - Requires `REACT_APP_UNSPLASH_API_ACCESS_KEY`
- Adaptive board header/title styling based on background brightness

### 🔔 Notifications
- Card assignments
- Comments on your cards
- Project invites
- Role changes (member → admin)

---

## 🧰 Tech stack

**Backend**
- Python, **Django 5.x**
- Django REST Framework (DRF)
- JWT Auth via `djangorestframework-simplejwt`
- Django Channels + Redis (for realtime + caching)
- SQLite (default) → switch to Postgres in production
- `django-cors-headers` for CORS

**Frontend**
- React (CRA / modern tooling)
- Axios for API requests
- React Hook Form for forms
- Drag & Drop (react-beautiful-dnd or similar)
- SASS for styling
- Env vars via `.env`

**Dev Tools**
- Yarn (frontend), pipenv (backend env manager), Redis

---

## 🛠️ Getting Started

### 1. Clone repo
    git clone https://github.com/Soham-047/trello-mini.git
    cd trello-mini
### 2. Backend setup
    cd backend
    # create virtualenv via pipenv (or use venv)
    python -m venv venv
    source venv/bin/activate
    
    # Run DB migrations
    python manage.py migrate
    
    # (optional) Create superuser
    python manage.py createsuperuser

### 3. Frontend Setup
    cd ../frontend
    yarn install
### 4. Environment Variables
    DJANGO_SECRET_KEY=your_secret_key_here
    DEBUG=True
    ALLOWED_HOSTS=127.0.0.1,localhost
    REDIS_HOST=127.0.0.1
    REDIS_PORT=6380
    REDIS_DB=0
    # other settings as needed
    
    ##Frontend Env
    REACT_APP_BACKEND_URL=http://127.0.0.1:8000      # base API URL
    REACT_APP_UNSPLASH_API_ACCESS_KEY=your_unsplash_access_key  # optional (for backgrounds)

### 5. Start Redis
    redis-server --port 6380
### 6. Run Servers
    # Backend
    cd backend
    python manage.py runserver
    # Frontend
    cd frontend
    yarn start

  # Open the frontend (usually http://localhost:3000) and the backend API at http://127.0.0.1:8000.

### 🗄️ Database Schema (ERD Overview)

Entities

User (id, username, email, avatar)

Workspace (id, name, owner_id)

Board (id, title, visibility, workspace_id, members)

List (id, board_id, title, position)

Card (id, list_id, title, desc, labels, due_date, position)

Comment (id, card_id, text, author_id, created_at)

ActivityLog (id, board_id, actor_id, action, created_at)

(📷 Include ERD diagram screenshot in /docs/schema.png or ASCII version here.)


### 📑 API Reference
Auth

    POST /auth/register/ → Register new user
    
    POST /auth/token/ → Login (JWT token)
    
    POST /auth/token/refresh/ → Refresh JWT

Workspaces

    GET /workspaces/ → List workspaces
    
    POST /workspaces/ → Create workspace
    
    GET /workspaces/{id}/ → Workspace details

Boards

    GET /boards/ → List boards
    
    POST /boards/ → Create board
    
    GET /boards/{id}/ → Get board details
    
    PATCH /boards/{id}/ → Update board
    
    DELETE /boards/{id}/ → Delete board

Lists

    GET /lists/ → List lists
    
    POST /lists/ → Create list
    
    PATCH /lists/{id}/ → Update list (rename/reorder)
    
    DELETE /lists/{id}/ → Delete list

Cards

    GET /cards/ → List cards
    
    POST /cards/ → Create card
    
    GET /cards/{id}/ → Card detail
    
    PATCH /cards/{id}/ → Update card
    
    DELETE /cards/{id}/ → Delete card
    
    POST /cards/{id}/comments/ → Add comment

Comments

    GET /cards/{id}/comments/ → List comments
    
    DELETE /comments/{id}/ → Delete comment

Activity

    GET /boards/{id}/activity/ → Board activity log

Search

    GET /boards/{id}/search?q=term → Search cards by title/labels/assignees

### 📂 Docs

    /docs/HLD.md → architecture diagram, realtime (WS + Redis), deployment sketch
    
    /docs/LLD.md → API contracts, DB schema, ordering (fractional position), error model
    
    /docs/api.yaml → OpenAPI spec (or Postman collection)
    
    /docs/schema.png → ERD diagram

### 🖼️ Screenshots
    ## Screenshots
![Board Page Video](https://i.imgur.com/gDTkwAS.gif)
![Landing Page](https://imgur.com/CTgpNlD.jpg)
![Login Page](https://imgur.com/as4jhYS.jpg)
![Home Page](https://imgur.com/FV0UirA.jpg)
![Add Board Modal](https://imgur.com/tO5fRW8.png)
![Create Project Modal](https://imgur.com/CXeD3C2.jpg)
![Project Page](https://imgur.com/QOsbu3y.jpg)
![Project Page 2](https://i.imgur.com/PGbDYvS.png)
![Card Modal](https://i.imgur.com/xpFOTsO.png)
