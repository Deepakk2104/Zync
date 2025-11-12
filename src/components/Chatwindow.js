import React, { useEffect, useState, useRef } from "react";
import { db, auth, setUserOnlineStatus } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [peerInfo, setPeerInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const currentUid = auth.currentUser?.uid;
  const chatDocId = [currentUid, chatId].sort().join("_");
  const typingRef = currentUid
    ? doc(db, "chats", chatDocId, "typing", "status")
    : null;

  // 🔹 Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Online status
  useEffect(() => {
    if (!currentUid) return;
    setUserOnlineStatus(currentUid, true);
    return () => setUserOnlineStatus(currentUid, false);
  }, [currentUid]);

  // 🔹 Fetch peer info (name + avatar)
  useEffect(() => {
    if (!chatId) return;
    const unsub = onSnapshot(doc(db, "users", chatId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPeerInfo(data);
        setIsOnline(data.online || false);
        setLastSeen(data.lastSeen?.toDate() || null);
      }
    });
    return () => unsub();
  }, [chatId]);

  // 🔹 Listen messages
  useEffect(() => {
    if (!chatId || !currentUid) return;
    const q = query(
      collection(db, "chats", chatDocId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // mark peer's messages as seen
      msgs.forEach(async (msg) => {
        if (msg.senderId === chatId && !msg.seen) {
          await updateDoc(doc(db, "chats", chatDocId, "messages", msg.id), {
            seen: true,
          });
        }
      });
    });
    return () => unsub();
  }, [chatId, chatDocId, currentUid]);

  // 🔹 Listen typing
  useEffect(() => {
    if (!typingRef || !chatId) return;
    const unsub = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) setPeerTyping(snap.data()[chatId] || false);
    });
    return () => unsub();
  }, [chatId, typingRef]);

  // 🔹 Handle input
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setNewMsg(value);
    if (!typingRef || !currentUid) return;
    await setDoc(
      typingRef,
      { [currentUid]: value.length > 0 },
      { merge: true }
    );
  };

  // 🔹 Send message
  const sendMessage = async () => {
    if (!newMsg.trim() || !currentUid || !chatId) return;
    await addDoc(collection(db, "chats", chatDocId, "messages"), {
      text: newMsg,
      senderId: currentUid,
      timestamp: serverTimestamp(),
      seen: false,
    });
    setNewMsg("");
    if (typingRef) {
      await setDoc(typingRef, { [currentUid]: false }, { merge: true });
    }
  };

  // 🔹 Send with Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMsg((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false); // auto-close picker
  };

  const formatLastSeen = (date) => {
    if (!date) return "recently";
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday)
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    if (isYesterday)
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    return `${date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    })} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-purple-50 relative">
      {/* Header */}
      <div className="px-4 py-3 bg-purple-600 text-white flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <img
            src={
              peerInfo?.photoURL ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="avatar"
            className="w-10 h-10 rounded-full border border-purple-300"
          />
          <div>
            <h2 className="font-semibold">
              {peerInfo?.name || peerInfo?.email || chatId}
            </h2>
            <span className="text-xs text-gray-200">
              {isOnline ? "Online" : `Last seen: ${formatLastSeen(lastSeen)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 transition-all">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUid;
          return (
            <div
              key={msg.id}
              className={`flex transition-all duration-300 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-xs animate-fade-in">
                <div
                  className={`inline-block px-3 py-2 rounded-2xl ${
                    isOwn
                      ? "bg-purple-700 text-white"
                      : "bg-white text-purple-900 shadow"
                  }`}
                >
                  {msg.text}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isOwn ? "text-right text-gray-300" : "text-gray-400"
                  }`}
                >
                  {msg.timestamp?.toDate
                    ? msg.timestamp.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing */}
      {peerTyping && (
        <div className="text-purple-700 text-sm px-4 mb-1 italic">
          Typing...
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-4 border-t bg-white">
        <button
          className="p-2 bg-purple-200 rounded hover:bg-purple-300 transition"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😊
        </button>
        <input
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-purple-400 outline-none"
          value={newMsg}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button
          className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 shadow-lg">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
