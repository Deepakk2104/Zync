import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./Chatwindow";
import GroupChat from "./Groupchat";
import { auth, setUserOnlineStatus } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isGroup, setIsGroup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    // Mark user online
    setUserOnlineStatus(uid, true);

    // Mark user offline on unmount
    return () => {
      if (auth.currentUser) {
        setUserOnlineStatus(auth.currentUser.uid, false);
      }
    };
  }, []);

  const handleLogout = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await setUserOnlineStatus(currentUser.uid, false);
    }
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar setSelectedChat={setSelectedChat} setIsGroup={setIsGroup} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 text-white shadow">
          <h1 className="text-lg font-semibold">Zync Chat</h1>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1">
          {selectedChat ? (
            isGroup ? (
              <GroupChat groupId={selectedChat} />
            ) : (
              <ChatWindow chatId={selectedChat} />
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              Select a user or group to start chatting 💬
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
