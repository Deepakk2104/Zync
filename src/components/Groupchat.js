import React, { useEffect, useState } from "react";
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
import Picker from "emoji-picker-react";

export default function GroupChat({ groupId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [peerTyping] = useState({});
  const [users, setUsers] = useState({});
  const [groupInfo, setGroupInfo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const typingRef = groupId
    ? doc(db, "groups", groupId, "typing", "status")
    : null;

  // Group info
  useEffect(() => {
    if (!groupId) return;
    const unsub = onSnapshot(doc(db, "groups", groupId), (snap) => {
      if (snap.exists()) setGroupInfo(snap.data());
    });
    return () => unsub();
  }, [groupId]);

  // Users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const data = {};
      snap.docs.forEach((d) => (data[d.id] = d.data()));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  // Messages
  useEffect(() => {
    if (!groupId || !groupInfo?.members.includes(auth.currentUser.uid)) return;

    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // Mark as seen
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

  const handleInputChange = async (e) => {
    setNewMsg(e.target.value);
    if (!typingRef || !auth.currentUser) return;
    await setDoc(
      typingRef,
      { [auth.currentUser.uid]: e.target.value.length > 0 },
      { merge: true }
    );
  };

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

  const onEmojiClick = (event, emojiObject) => {
    setNewMsg((prev) => prev + emojiObject.emoji);
  };

  const isMember = groupInfo?.members.includes(auth.currentUser.uid);

  return (
    <div className="flex-1 flex flex-col bg-purple-50 relative">
      {/* Header */}
      {groupInfo && (
        <div className="px-4 py-3 bg-purple-600 text-white flex justify-between items-center shadow">
          <h2 className="font-bold text-lg">{groupInfo.name}</h2>
          <span className="text-sm">{groupInfo.members.length} members</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const user = users[msg.senderId] || {};
          const isOwn = msg.senderId === auth.currentUser.uid;
          const seenCount = msg.seenBy ? Object.keys(msg.seenBy).length : 0;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-xs">
                {!isOwn && (
                  <div className="text-xs text-purple-800 mb-1">
                    {user.name || user.email}
                  </div>
                )}
                <div
                  className={`inline-block px-3 py-2 rounded-lg ${
                    isOwn
                      ? "bg-purple-700 text-white"
                      : "bg-white text-purple-900 shadow"
                  }`}
                >
                  {msg.text}
                </div>
                {isOwn && (
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {seenCount > 1 ? `Seen by ${seenCount - 1}` : "Sent"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {!isMember && (
          <div className="text-center text-gray-400 mt-4">
            You are not a member of this group
          </div>
        )}
      </div>

      {/* Typing */}
      {isMember && (
        <div className="text-purple-700 text-sm mb-1 px-4">
          {Object.entries(peerTyping || {})
            .filter(([uid, val]) => val && uid !== auth.currentUser.uid)
            .map(([uid]) => (
              <div key={uid}>{users[uid]?.name || uid} is typing...</div>
            ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-4 border-t bg-white">
        <button
          className="p-2 bg-purple-300 rounded"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😊
        </button>
        <input
          className="flex-1 p-2 border rounded"
          value={newMsg}
          onChange={handleInputChange}
          placeholder={
            isMember ? "Type a message..." : "You cannot send messages"
          }
          disabled={!isMember}
        />
        <button
          className="p-2 bg-purple-600 text-white rounded"
          onClick={sendMessage}
          disabled={!isMember}
        >
          Send
        </button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}
