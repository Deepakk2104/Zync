import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";

export default function GroupChat({ groupId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [peerTyping, setPeerTyping] = useState({});

  // Only create typingRef if groupId is available
  const typingRef = groupId
    ? doc(db, "groups", groupId, "typing", "status")
    : null;

  // 🔹 Listen for typing updates
  useEffect(() => {
    if (!typingRef) return;
    const unsub = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) setPeerTyping(snap.data());
    });
    return () => unsub();
  }, [typingRef]);

  // 🔹 Listen for group messages
  useEffect(() => {
    if (!groupId) return;
    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [groupId]);

  // 🔹 Handle typing
  const handleInputChange = async (e) => {
    setNewMsg(e.target.value);
    if (!typingRef || !auth.currentUser) return;
    await setDoc(
      typingRef,
      { [auth.currentUser.uid]: e.target.value.length > 0 },
      { merge: true }
    );
  };

  // 🔹 Send message
  const sendMessage = async () => {
    if (!newMsg.trim() || !groupId || !auth.currentUser) return;
    await addDoc(collection(db, "groups", groupId, "messages"), {
      text: newMsg,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });
    setNewMsg("");
    // Reset typing
    if (typingRef) {
      await setDoc(
        typingRef,
        { [auth.currentUser.uid]: false },
        { merge: true }
      );
    }
  };

  // 🔹 Show UI
  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-1 ${
              msg.senderId === auth.currentUser?.uid
                ? "text-right"
                : "text-left"
            }`}
          >
            <span className="inline-block px-2 py-1 rounded bg-gray-700 text-white">
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Typing indicator */}
      <div className="text-gray-400 text-sm mb-1">
        {Object.entries(peerTyping || {})
          .filter(([uid, val]) => val && uid !== auth.currentUser?.uid)
          .map(([uid]) => (
            <div key={uid}>{uid} is typing...</div>
          ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={newMsg}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={!groupId}
        />
        <button
          className="p-2 bg-green-500 rounded text-white"
          onClick={sendMessage}
          disabled={!groupId}
        >
          Send
        </button>
      </div>
    </div>
  );
}
