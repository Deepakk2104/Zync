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
| **Deployment**         | Vercel / Firebase Hosting        |
| **Emoji Support**      | Emoji Picker React               |

---

## **How to Use**

### **As a Test User**

You can directly log in using the following test credentials:

- **Email:** `testuser@gmail.com`  
- **Password:** `12345678`

> Or sign up with your own email or Google account.

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

🚀 _Coming Soon..._  
(_Will update once deployed_)

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
git clone https://github.com/<your-username>/zyncc-chat-app.git
cd zyncc-chat-app
2. Install dependencies
bash
Copy code
npm install
3. Add Firebase Config
Create a .env file and add the following:

makefile
Copy code
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
...
4. Start development server
bash
Copy code
npm run dev
Project Structure
arduino
Copy code
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
Build for Production
bash
Copy code
npm run build
Deploy the dist/ folder to platforms like:

Vercel (recommended)

Firebase Hosting

Netlify

Contributing
Contributions are welcome.

Fork the repo

Create a new branch (git checkout -b feature-xyz)

Commit your changes

Push to the branch and open a Pull Request

Upcoming Features
🖼️ Media sharing (Images / Files)

🎤 Voice messages

🗑️ Delete and edit messages

🌓 Dark mode / Theme support

🔔 Push notifications

👤 Profile customization (bio, avatar, etc.)

🔒 End-to-end encryption (future scope)

License
Licensed under the MIT License.

Author
Developed by YourName
Feel free to reach out and connect!
