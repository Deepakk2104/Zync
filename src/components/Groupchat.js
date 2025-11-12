import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase";
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

export default function GroupChat({ groupId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [peerTyping, setPeerTyping] = useState({});
  const [users, setUsers] = useState({});
  const [groupInfo, setGroupInfo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const typingRef = groupId
    ? doc(db, "groups", groupId, "typing", "status")
    : null;

  // 🔹 Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Fetch group info
  useEffect(() => {
    if (!groupId) return;
    const unsub = onSnapshot(doc(db, "groups", groupId), (snap) => {
      if (snap.exists()) setGroupInfo(snap.data());
    });
    return () => unsub();
  }, [groupId]);

  // 🔹 Fetch users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const data = {};
      snap.docs.forEach((d) => (data[d.id] = d.data()));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  // 🔹 Listen for messages
  useEffect(() => {
    if (!groupId || !groupInfo?.members.includes(auth.currentUser.uid)) return;
    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // Mark messages as seen
      msgs.forEach(async (msg) => {
        if (msg.senderId !== auth.currentUser.uid) {
          await updateDoc(doc(db, "groups", groupId, "messages", msg.id), {
            seenBy: { ...(msg.seenBy || {}), [auth.currentUser.uid]: true },
          });
        }
      });
    });
    return () => unsub();
  }, [groupId, groupInfo]);

  // 🔹 Typing status
  useEffect(() => {
    if (!typingRef) return;
    const unsub = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) setPeerTyping(snap.data());
    });
    return () => unsub();
  }, [typingRef]);

  // 🔹 Input & typing
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
    if (
      !newMsg.trim() ||
      !groupId ||
      !groupInfo?.members.includes(auth.currentUser.uid)
    )
      return;

    await addDoc(collection(db, "groups", groupId, "messages"), {
      text: newMsg,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
      seenBy: { [auth.currentUser.uid]: true },
    });

    setNewMsg("");
    setShowEmojiPicker(false);

    if (typingRef)
      await setDoc(
        typingRef,
        { [auth.currentUser.uid]: false },
        { merge: true }
      );
  };

  // 🔹 Handle Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMsg((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const isMember = groupInfo?.members.includes(auth.currentUser.uid);

  return (
    <div
      className="flex-1 flex flex-col relative"
      style={{
        backgroundColor: "#f8f6fc",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      {groupInfo && (
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
          <div>
            <h2 className="font-semibold text-lg text-white">
              {groupInfo.name}
            </h2>
            <p className="text-xs text-purple-100">
              {groupInfo.members.length} members
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map((msg) => {
          const user = users[msg.senderId] || {};
          const isOwn = msg.senderId === auth.currentUser.uid;
          const seenCount = msg.seenBy ? Object.keys(msg.seenBy).length : 0;
          const timestamp =
            msg.timestamp?.toDate &&
            msg.timestamp
              .toDate()
              .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-xs">
                {!isOwn && (
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={
                        user.photoURL ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="avatar"
                      className="w-6 h-6 rounded-full border border-purple-200"
                    />
                    <span className="text-xs text-purple-800 font-medium">
                      {user.name || user.email}
                    </span>
                  </div>
                )}

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
                  {timestamp}{" "}
                  {isOwn &&
                    (seenCount > 1 ? `• Seen by ${seenCount - 1}` : "• Sent")}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing */}
      {isMember && (
        <div className="text-purple-600 text-sm px-4 mb-1 italic">
          {Object.entries(peerTyping || {})
            .filter(([uid, val]) => val && uid !== auth.currentUser.uid)
            .map(([uid]) => (
              <div key={uid}>
                {users[uid]?.name || users[uid]?.email || uid} is typing...
              </div>
            ))}
        </div>
      )}

      {/* Input */}
      {isMember ? (
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
      ) : (
        <div className="text-center text-gray-400 py-4 border-t bg-white">
          You are not a member of this group.
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 shadow-lg">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
