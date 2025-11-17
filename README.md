# **Zyncc — Real-Time Chat Application**

A modern, interactive, and real-time **chat application** built with **React**, **Firebase**, and **TailwindCSS**, supporting both **1-on-1** and **group chat**.  
Designed to provide a fast and smooth messaging experience — with live indicators, emojis, seen receipts, and user status tracking.

---

## **Tech Stack**

| Category               | Technologies                     |
| ---------------------- | -------------------------------- |
| **Frontend**           | React, Vite                      |
| **Backend / Database** | Firebase (Auth, Firestore)       |
| **UI / Styling**       | Tailwind CSS                     |
| **Real-Time Updates**  | Firestore Subscriptions          |
| **Deployment**         | Vercel                           |
| **Emoji Support**      | Emoji Picker React               |

---

## **How to Use**

### **As a Test User**

You can directly log in using the following test credentials:

- **Email:** `testuser@gmail.com`  
- **Password:** `12345678`

- Or sign up with your own email or Google account.

---

### **1-on-1 Chat**

- Select a user from the sidebar
- Send and receive live messages
- See if the other person is typing or online
- Messages show seen status

---

### **Group Chat**

- Create a new group
- Select members to add
- Group name and member count visible
- Same live features as 1-on-1 messages

---

## **Live Demo**

## **Website:** https://zync-chi.vercel.app/login

---

## **Features**

### **User Side**

- 🔐 Authentication with Email/Password & Google Sign-In
- 💬 Real-time messaging (1-on-1 & Group)
- 😄 Emoji Picker
- 🟢 Online/offline status tracking
- ✍️ Typing indicators
- ✓ Seen receipts
- 👀 Last seen timestamp
- 🎨 Beautiful UI with TailwindCSS
- 🚫 Protected routes and Firebase Security Rules

---

## **Tech Stack**

- **React + Vite**
- **Firebase Authentication**
- **Cloud Firestore** (Real-time DB)
- **TailwindCSS**
- **React Router**

---

## **Getting Started**

### **1. Clone the repo**

```bash
git clone https://github.com/Deepakk2104/Zync.git
cd zyncc-chat-app
```

### **2. Install dependencies**

```bash
npm install
```

### **3. Start development server**

```bash
npm start
```

---

## **Project Structure**

```
zyncc-chat-app/
│
├── src/
│   ├── components/
│   ├── firebase/
│   ├── pages/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── package.json
├── vite.config.js
└── README.md
```
## **Build for Production**

```bash
npm run build
```
Deploy the `dist/` folder using:

- Vercel
- Firebase Hosting
- Netlify

---

## **Contributing**

Contributions are welcome.

1. Fork the project
2. Create your feature branch
3. Commit changes
4. Open a Pull Request

---


## **Upcoming Features**
🖼️ Media sharing (Images / Files)

🎤 Voice messages

🗑️ Delete and edit messages

🌓 Dark mode / Theme support

🔔 Push notifications

👤 Profile customization (bio, avatar, etc.)

🔒 End-to-end encryption (future scope)

## **License**

Licensed under the **MIT License**.

---

## **Author**

**Developed by [Deepakk2104](https://github.com/Deepakk2104)**
