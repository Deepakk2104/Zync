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

  // 🔹 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Set user online status
  useEffect(() => {
    if (!currentUid) return;
    setUserOnlineStatus(currentUid, true);
    return () => setUserOnlineStatus(currentUid, false);
  }, [currentUid]);

  // 🔹 Listen to peer info (avatar, name, status)
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

  // 🔹 Listen to messages
  useEffect(() => {
    if (!chatId || !currentUid) return;
    const q = query(
      collection(db, "chats", chatDocId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // mark seen for peer messages
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

  // 🔹 Typing indicator
  useEffect(() => {
    if (!typingRef || !chatId) return;
    const unsub = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) setPeerTyping(snap.data()[chatId] || false);
    });
    return () => unsub();
  }, [chatId, typingRef]);

  // 🔹 Input change handler
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

  // 🔹 Enter key to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🔹 Emoji picker
  const handleEmojiClick = (emojiObject) => {
    setNewMsg((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // 🔹 Format last seen
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
    <div
      className="flex-1 flex flex-col relative"
      style={{
        backgroundColor: "#f8f6fc",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)",
          color: "white",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src={
              peerInfo?.photoURL ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="avatar"
            className="w-10 h-10 rounded-full border border-white/30"
          />
          <div>
            <h2 className="font-semibold text-white">
              {peerInfo?.name || peerInfo?.email || chatId}
            </h2>
            <span className="text-xs text-purple-100">
              {isOnline ? "Online" : `Last seen: ${formatLastSeen(lastSeen)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUid;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-xs">
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm ${
                    isOwn
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                      : "bg-white text-gray-800 border border-purple-100"
                  }`}
                  style={{ wordBreak: "break-word" }}
                >
                  {msg.text}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isOwn ? "text-right text-gray-400" : "text-gray-500"
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

      {/* Typing Indicator */}
      {peerTyping && (
        <div className="text-purple-600 text-sm px-4 mb-1 italic">
          Typing...
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-4 border-t bg-white">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition"
        >
          😊
        </button>
        <input
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-gray-700"
          value={newMsg}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{ backgroundColor: "#f9fafb" }}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition"
          style={{
            background:
              "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)",
          }}
        >
          Send
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 shadow-lg">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
