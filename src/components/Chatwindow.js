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
  updateDoc,
} from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  if (!auth.currentUser) return null; // 🔹 Prevent crash when user logs out

  const chatDocId = [auth.currentUser.uid, chatId].sort().join("_");
  const typingRef = doc(db, "chats", chatDocId, "typing", "status");

  // Manage own online/offline status
  useEffect(() => {
    if (!auth.currentUser) return;
    setUserOnlineStatus(auth.currentUser.uid, true);
    return () => {
      if (auth.currentUser) setUserOnlineStatus(auth.currentUser.uid, false);
    };
  }, []);

  // Listen for messages
  useEffect(() => {
    if (!chatId || !auth.currentUser) return;
    const q = query(
      collection(db, "chats", chatDocId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // Mark peer's messages as seen
      msgs.forEach(async (msg) => {
        if (msg.senderId === chatId && !msg.seen) {
          const msgRef = doc(db, "chats", chatDocId, "messages", msg.id);
          await updateDoc(msgRef, { seen: true });
        }
      });
    });
    return () => unsub();
  }, [chatDocId, chatId]);

  // Listen for typing status
  useEffect(() => {
    if (!chatId) return;
    const unsub = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) {
        const typingData = snap.data();
        setPeerTyping(typingData[chatId] || false);
      }
    });
    return () => unsub();
  }, [chatId, typingRef]);

  // Listen for peer status
  useEffect(() => {
    if (!chatId) return;
    const peerRef = doc(db, "users", chatId);
    const unsub = onSnapshot(peerRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setIsOnline(data.online || false);
        setLastSeen(data.lastSeen?.toDate() || null);
      }
    });
    return () => unsub();
  }, [chatId]);

  // Handle input typing
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setNewMsg(value);

    if (!auth.currentUser) return;
    await setDoc(
      typingRef,
      { [auth.currentUser.uid]: value.length > 0 },
      { merge: true }
    );
  };

  // Handle emoji select
  const handleEmojiClick = (emojiObject) => {
    setNewMsg((prev) => prev + emojiObject.emoji);
  };

  // Send message
  const sendMessage = async () => {
    if (!newMsg.trim() || !auth.currentUser) return;

    await addDoc(collection(db, "chats", chatDocId, "messages"), {
      text: newMsg,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
      seen: false,
    });

    setNewMsg("");
    await setDoc(typingRef, { [auth.currentUser.uid]: false }, { merge: true });
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Header */}
      <div className="mb-2 text-sm text-gray-400">
        {isOnline
          ? "Online"
          : `Last seen: ${
              lastSeen
                ? lastSeen.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "recently"
            }`}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg) => {
          const msgTime = msg.timestamp?.toDate
            ? msg.timestamp.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={msg.id}
              className={`mb-2 ${
                msg.senderId === auth.currentUser.uid
                  ? "text-right"
                  : "text-left"
              }`}
            >
              <div className="inline-block px-2 py-1 rounded bg-gray-700 text-white relative">
                {msg.text}
                <div className="text-xs text-gray-300 mt-1 flex items-center justify-end gap-1">
                  {msgTime}
                  {msg.senderId === auth.currentUser.uid && (
                    <span
                      className={
                        msg.seen ? "text-blue-400 font-bold" : "text-gray-400"
                      }
                    >
                      {msg.seen ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicator */}
      {peerTyping && (
        <div className="text-gray-400 text-sm mb-1">Typing...</div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 relative">
        <button
          className="p-2 bg-gray-200 rounded"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😊
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
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
