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
  updateDoc,
} from "firebase/firestore";

export default function GroupChat({ groupId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [peerTyping, setPeerTyping] = useState({});
  const [users, setUsers] = useState({});
  const [groupInfo, setGroupInfo] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const typingRef = groupId
    ? doc(db, "groups", groupId, "typing", "status")
    : null;

  // Load group info
  useEffect(() => {
    if (!groupId) return;
    const groupRef = doc(db, "groups", groupId);
    const unsub = onSnapshot(groupRef, (snap) => {
      if (snap.exists()) setGroupInfo(snap.data());
    });
    return () => unsub();
  }, [groupId]);

  // Listen for typing updates
  useEffect(() => {
    if (!typingRef) return;
    const unsub = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) setPeerTyping(snap.data());
    });
    return () => unsub();
  }, [typingRef]);

  // Listen for group messages
  useEffect(() => {
    if (!groupId || !groupInfo?.members.includes(auth.currentUser.uid)) return;

    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // Mark messages as seen
      msgs.forEach(async (msg) => {
        if (msg.senderId !== auth.currentUser.uid) {
          const msgRef = doc(db, "groups", groupId, "messages", msg.id);
          await updateDoc(msgRef, {
            seenBy: {
              ...(msg.seenBy || {}),
              [auth.currentUser.uid]: true,
            },
          });
        }
      });
    });

    return () => unsub();
  }, [groupId, groupInfo]);

  // Load all users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const data = {};
      snap.docs.forEach((d) => (data[d.id] = d.data()));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  // Handle typing
  const handleInputChange = async (e) => {
    setNewMsg(e.target.value);
    if (!typingRef || !auth.currentUser) return;
    await setDoc(
      typingRef,
      { [auth.currentUser.uid]: e.target.value.length > 0 },
      { merge: true }
    );
  };

  // Send message
  const sendMessage = async () => {
    if (
      !newMsg.trim() ||
      !groupId ||
      !auth.currentUser ||
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

    if (typingRef) {
      await setDoc(
        typingRef,
        { [auth.currentUser.uid]: false },
        { merge: true }
      );
    }
  };

  const isMember = groupInfo?.members.includes(auth.currentUser.uid);

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Group Header */}
      {groupInfo && (
        <div
          className="p-4 bg-gray-800 text-white border-b cursor-pointer"
          onClick={() => setShowSidebar(true)}
        >
          <h2 className="text-lg font-bold">{groupInfo.name}</h2>
          <span className="text-sm text-gray-400">
            {groupInfo.members?.length || 0} members
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isMember ? (
          messages.map((msg) => {
            const user = users[msg.senderId] || {};
            const isOwn = msg.senderId === auth.currentUser?.uid;
            const seenCount = msg.seenBy ? Object.keys(msg.seenBy).length : 0;

            return (
              <div
                key={msg.id}
                className={`mb-2 flex ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-xs">
                  {!isOwn && (
                    <div className="text-xs text-gray-400 mb-1">
                      {user.name || user.email || msg.senderId}
                    </div>
                  )}
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
                      isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
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
          })
        ) : (
          <div className="text-center text-gray-400 mt-4">
            You are not a member of this group
          </div>
        )}
      </div>

      {/* Typing indicator */}
      {isMember && (
        <div className="text-gray-400 text-sm mb-1 px-4">
          {Object.entries(peerTyping || {})
            .filter(([uid, val]) => val && uid !== auth.currentUser?.uid)
            .map(([uid]) => (
              <div key={uid}>
                {users[uid]?.name || users[uid]?.email || uid} is typing...
              </div>
            ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 p-4 border-t">
        <input
          className="flex-1 p-2 border rounded"
          value={newMsg}
          onChange={handleInputChange}
          placeholder={
            isMember
              ? "Type a message..."
              : "You cannot send messages in this group"
          }
          disabled={!isMember}
        />
        <button
          className="p-2 bg-green-500 rounded text-white"
          onClick={sendMessage}
          disabled={!isMember}
        >
          Send
        </button>
      </div>

      {/* Group Info Sidebar */}
      {showSidebar && (
        <div className="absolute right-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg p-4 overflow-y-auto">
          <button
            className="mb-4 text-red-400"
            onClick={() => setShowSidebar(false)}
          >
            Close ✖
          </button>

          <h3 className="text-lg font-bold mb-2">{groupInfo?.name}</h3>
          <p className="text-sm text-gray-400 mb-4">
            Members: {groupInfo?.members?.length || 0}
          </p>

          {groupInfo?.members?.map((uid) => {
            const user = users[uid];
            return (
              <div
                key={uid}
                className="flex justify-between items-center mb-2 p-2 bg-gray-800 rounded"
              >
                <span>{user?.name || user?.email || uid}</span>
                {user?.online ? (
                  <span className="text-green-400">● Online</span>
                ) : (
                  <span className="text-gray-500 text-xs">
                    {user?.lastSeen
                      ? `Last seen: ${user.lastSeen
                          .toDate()
                          .toLocaleTimeString()}`
                      : "Offline"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
