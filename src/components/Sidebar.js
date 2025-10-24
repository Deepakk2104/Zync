import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";

export default function Sidebar({ setSelectedChat, setIsGroup }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs
          .filter((doc) => doc.id !== auth.currentUser.uid)
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

  const toggleMemberSelection = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    const members = [auth.currentUser.uid, ...selectedMembers];
    await addDoc(collection(db, "groups"), {
      name: newGroupName,
      members,
      createdAt: new Date(),
    });
    setNewGroupName("");
    setSelectedMembers([]);
    setShowInput(false);
  };

  return (
    <div className="w-1/4 bg-purple-700 text-white p-4 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-white rounded-full mr-2"></div>
        <h1 className="text-2xl font-bold">Zyncc</h1>
      </div>

      {/* Users */}
      <h2 className="text-lg font-semibold mb-2">Users</h2>
      {users.length === 0 ? (
        <p className="text-purple-200 text-sm mb-4">No other users yet</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="p-2 mb-1 rounded hover:bg-purple-600 cursor-pointer flex justify-between items-center"
            onClick={() => {
              setSelectedChat(user.id);
              setIsGroup(false);
            }}
          >
            <span>{user.name || user.email}</span>
            {user.online ? (
              <span className="text-green-400 text-xs">● Online</span>
            ) : (
              <span className="text-purple-300 text-xs">Offline</span>
            )}
          </div>
        ))
      )}

      {/* Groups */}
      <h2 className="text-lg font-semibold mt-6 mb-2 flex justify-between items-center">
        Groups
        <button
          onClick={() => setShowInput(!showInput)}
          className="px-2 py-1 bg-green-500 rounded hover:bg-green-600 text-sm"
        >
          + Create
        </button>
      </h2>

      {showInput && (
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            className="p-2 rounded text-gray-900"
            placeholder="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <div className="flex flex-col max-h-40 overflow-y-auto border p-2 rounded bg-purple-600">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 mb-1 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => toggleMemberSelection(user.id)}
                />
                <span>{user.name || user.email}</span>
              </label>
            ))}
          </div>
          <button
            onClick={createGroup}
            className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
          >
            Add Group
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-purple-200 text-sm">No groups yet</p>
      ) : (
        groups.map((group) => (
          <div
            key={group.id}
            className="p-2 mb-1 rounded hover:bg-purple-600 cursor-pointer"
            onClick={() => {
              setSelectedChat(group.id);
              setIsGroup(true);
            }}
          >
            {group.name}
          </div>
        ))
      )}
    </div>
  );
}
