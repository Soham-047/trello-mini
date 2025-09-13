# Trello Clone

A full-stack **Trello-like project management tool** built with **Django Rest Framework**, **React**, **Redis**, and **SASS**.  
The app lets teams (or solo users) manage projects visually with boards, lists, and cards — just like Trello.

---

## 🚀 Features

### 🔑 Authentication
- Register & Login with **JWT authentication** (DRF + React integration)  
- Login with either **username or email**  

### 👥 Projects (Teams)
- Create projects (like Trello workspaces)  
- Invite members via **one-time invite link**  
- Manage member roles:  
  - **Admin** → can edit project details, invite members, and manage access  
  - **Normal** → standard access  

### 📋 Boards
- Create **personal** or **project-based** boards  
- **Recently Viewed** boards  
- **Starred Boards** for quick access  
- Create, reorder, and rename **lists**  
- Create, reorder, and move **cards**  
  - Add **labels**, assign **members**, attach files, and leave **comments**  
- 🔍 **Search with autocomplete** (debounced for performance)  
- 🌆 **Unsplash integration** → set board backgrounds with random images  
  - Requires `REACT_APP_UNSPLASH_API_ACCESS_KEY` in `.env`  
- Dynamic **board header & title styling** based on background brightness  

### 🔔 Notifications
- When you’re assigned to a card  
- When someone comments on a card you’re on  
- When invited to a project  
- When promoted to **Admin**  

---

## 🛠️ Getting Started

### 1. Install dependencies
Make sure you have these installed:
- [Python](https://www.python.org/downloads/)  
- [Yarn](https://classic.yarnpkg.com/en/docs/install/)  
- [Redis](https://redis.io/download)  

### 2. Clone repo
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd trello-clone

```
$ git clone https://github.com/vdevired/trello-clone.git
$ cd trello-clone
```
3. Install [pipenv](https://pypi.org/project/pipenv/), a python virtual environment manager. Install backend dependencies and run migrations to create database. Default database is SQLite.
```
$ cd backend
$ pipenv install
$ pipenv run python manage.py migrate
```
4. Install frontend dependencies.
```
$ cd frontend
$ yarn install
```
5. Run redis on port 6380
``` 
$ redis-server --port 6380
```
6. Run both frontend and backend servers with following commands in appropriate directories.
```
$ pipenv run python manage.py runserver
$ yarn start
```

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

Design Inspiration: https://www.behance.net/gallery/47031411/Trello-Atlassian-Redesign