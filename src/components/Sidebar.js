import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Sidebar({ setSelectedChat, setIsGroup }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs
          .filter((doc) => doc.id !== auth.currentUser.uid) // exclude self
          .map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    const unsubGroups = onSnapshot(collection(db, "groups"), (snap) => {
      setGroups(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubGroups();
    };
  }, []);

  return (
    <div className="w-1/4 bg-gray-900 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      {users.map((user) => (
        <div
          key={user.id}
          className="p-2 hover:bg-gray-700 cursor-pointer rounded"
          onClick={() => {
            setSelectedChat(user.id);
            setIsGroup(false);
          }}
        >
          <div className="flex justify-between items-center">
            <span>{user.name || user.email}</span>
            {user.online ? (
              <span className="ml-2 text-green-400">● Online</span>
            ) : (
              <span className="ml-2 text-gray-500 text-xs">
                Last seen:{" "}
                {user.lastSeen
                  ? user.lastSeen.toDate().toLocaleTimeString()
                  : "N/A"}
              </span>
            )}
          </div>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6 mb-2">Groups</h2>
      {groups.map((group) => (
        <div
          key={group.id}
          className="p-2 hover:bg-gray-700 cursor-pointer rounded"
          onClick={() => {
            setSelectedChat(group.id);
            setIsGroup(true);
          }}
        >
          {group.name}
        </div>
      ))}
    </div>
  );
}
