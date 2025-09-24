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
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  // Update currentUser if auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) navigate("/login"); // Redirect if logged out
    });
    return () => unsubscribe();
  }, [navigate]);

  // Online status effect
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;
    setUserOnlineStatus(uid, true);

    return () => {
      // Check if still logged in before marking offline
      if (auth.currentUser) {
        setUserOnlineStatus(auth.currentUser.uid, false);
      }
    };
  }, [currentUser]);

  const handleLogout = async () => {
    if (currentUser) {
      await setUserOnlineStatus(currentUser.uid, false);
    }
    await signOut(auth);
    setSelectedChat(null);
    setIsGroup(false);
    navigate("/login");
  };

  if (!currentUser) {
    return null; // Prevent rendering before auth is ready
  }

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
