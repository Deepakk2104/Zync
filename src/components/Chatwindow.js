import React, { useEffect, useState } from "react";
import { db, auth, setUserOnlineStatus } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);

  const chatDocId = [auth.currentUser.uid, chatId].sort().join("_");
  const typingRef = doc(db, "chats", chatDocId, "typing", "status");

  // Manage online/offline status
  useEffect(() => {
    setUserOnlineStatus(auth.currentUser.uid, true);
    return () => setUserOnlineStatus(auth.currentUser.uid, false);
  }, []);

  // Listen for messages
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatDocId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [chatDocId]);

  // Listen for typing status
  useEffect(() => {
    const unsub = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) {
        const typingData = snap.data();
        setPeerTyping(typingData[chatId] || false); // true if peer is typing
      }
    });
    return () => unsub();
  }, [chatId, typingRef]);

  // Handle input typing
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setNewMsg(value);

    await setDoc(
      typingRef,
      { [auth.currentUser.uid]: value.length > 0 },
      { merge: true }
    );
  };

  // Send message
  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    await addDoc(collection(db, "chats", chatDocId, "messages"), {
      text: newMsg,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setNewMsg("");
    await setDoc(typingRef, { [auth.currentUser.uid]: false }, { merge: true });
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-1 ${
              msg.senderId === auth.currentUser.uid ? "text-right" : "text-left"
            }`}
          >
            <span className="inline-block px-2 py-1 rounded bg-gray-700 text-white">
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Typing indicator */}
      {peerTyping && (
        <div className="text-gray-400 text-sm mb-1">Typing...</div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={newMsg}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
