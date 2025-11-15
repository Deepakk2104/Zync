\# 💬 Zyncc — Real-Time Chat App (React + Firebase)

Zyncc is a fast, modern \*\*real-time chat application\*\* supporting

\*\*1-on-1 chats\*\*, \*\*group chats\*\*, \*\*typing indicators\*\*, \*\*read receipts\*\*,

\*\*online/offline status\*\*, and a clean UI powered by \*\*Tailwind CSS\*\*.

\---

\## 🚀 Features

\- 🔐 Email & Google Authentication

\- 💬 Real-time 1-on-1 Messaging

\- 👥 Group Chats with live member updates

\- ✍️ Typing Indicators

\- ✓✓ Read Receipts

\- 🟢 Online / Last Seen Status

\- 😊 Emoji Picker

\- 📱 Clean, responsive UI

\---

\## 🛠️ Tech Stack

\- \*\*Frontend:\*\* React, Tailwind CSS

\- \*\*Backend:\*\* Firebase Firestore

\- \*\*Authentication:\*\* Firebase Auth (Google + Email/Password)

\- \*\*Hosting:\*\* Vercel / Firebase Hosting

\---

\## 🧪 Test User (for demo)

Use this account to test Zyncc instantly:

\*\*Email:\*\* \`testuser@gmail.com\`

\*\*Password:\*\* \`12345678\`

\---

\## 📦 Installation

\`\`\`bash

git clone https://github.com/yourusername/zyncc.git

cd zyncc

npm install

npm start

🔧 Firebase Setup

Create a Firebase Project

Enable Email/Password + Google Auth

Enable Cloud Firestore

Copy your Firebase config into /src/firebase.js

🔒 Firestore Rules (Recommended)

js

Copy code

rules\_version = '2';

service cloud.firestore {

match /databases/{database}/documents {

// User profiles

match /users/{userId} {

allow read: if request.auth != null;

allow write: if request.auth.uid == userId;

}

// 1-on-1 chats

match /chats/{chatId=\*\*} {

allow read, write: if request.auth != null;

}

// Groups

match /groups/{groupId=\*\*} {

allow read, write: if request.auth != null;

}

}

}

📁 Folder Structure

css

Copy code

src/

├── components/

│ ├── Login.jsx

│ ├── Signup.jsx

│ ├── Dashboard.jsx

│ ├── Sidebar.jsx

│ ├── ChatWindow.jsx

│ └── GroupChat.jsx

├── firebase.js

└── App.jsx

🔮 Future Updates

🖼️ Profile editing (avatar, username, status)

🕶️ Dark Mode

📁 File & Image Sharing

🔔 Push Notifications

📱 Mobile chat layout improvements

☁️ Cloud chat backups

📦 Deployment

Vercel

bash

Copy code

npm run build

vercel deploy

Firebase Hosting

bash

Copy code

firebase login

firebase init

firebase deploy

👨‍💻 Author – Deepak Kumar

Frontend Developer | React Enthusiast

💻 GitHub: https://github.com/yourusername

🔗 LinkedIn: https://linkedin.com/in/yourprofile
