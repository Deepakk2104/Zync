import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, setUserOnlineStatus } from "../firebase";
import { signOut } from "firebase/auth";
import Sidebar from "./Sidebar";
import ChatWindow from "./Chatwindow";
import GroupChat from "./Groupchat";

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isGroup, setIsGroup] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Online status
  useEffect(() => {
    if (!currentUser) return;
    setUserOnlineStatus(currentUser.uid, true);
    return () => {
      if (auth.currentUser) setUserOnlineStatus(auth.currentUser.uid, false);
    };
  }, [currentUser]);

  const handleLogout = async () => {
    if (currentUser) await setUserOnlineStatus(currentUser.uid, false);
    await signOut(auth);
    setSelectedChat(null);
    setIsGroup(false);
    navigate("/login");
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-purple-50 text-gray-900">
      {/* Sidebar */}
      <Sidebar setSelectedChat={setSelectedChat} setIsGroup={setIsGroup} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4  text-white shadow"
          style={{ backgroundColor: "#7b39ec" }}
        >
          <h1 className="text-xl font-bold">Zyncc Chat</h1>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {selectedChat ? (
            isGroup ? (
              <GroupChat groupId={selectedChat} />
            ) : (
              <ChatWindow chatId={selectedChat} />
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
              Select a user or group to start chatting 💬
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
