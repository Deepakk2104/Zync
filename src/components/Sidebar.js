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
    <div className="w-1/4 bg-gradient-to-b from-purple-800 to-purple-950 text-white p-5 flex flex-col overflow-y-auto shadow-lg">
      {/* Logo */}
      <div className="flex items-center mb-6">
        <div className="w-9 h-9 bg-white rounded-full mr-3 flex items-center justify-center text-purple-700 font-bold text-lg">
          Z
        </div>
        <h1 className="text-2xl font-bold tracking-wide">Zyncc</h1>
      </div>

      {/* Users Section */}
      <h2 className="text-lg font-semibold mb-2 border-b border-purple-600 pb-1">
        Users
      </h2>

      {users.length === 0 ? (
        <p className="text-purple-300 text-sm mb-4">No other users yet</p>
      ) : (
        <div className="space-y-1 mb-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-2 rounded hover:bg-purple-700 cursor-pointer flex items-center justify-between transition-all"
              onClick={() => {
                setSelectedChat(user.id);
                setIsGroup(false);
              }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={
                    user.photoURL ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="avatar"
                  className="w-7 h-7 rounded-full border border-purple-400"
                />
                <span className="truncate text-sm">
                  {user.name || user.email}
                </span>
              </div>
              {user.online ? (
                <span className="text-green-400 text-xs">●</span>
              ) : (
                <span className="text-purple-300 text-xs">○</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Groups Section */}
      <div className="flex justify-between items-center mt-6 mb-2 border-b border-purple-600 pb-1">
        <h2 className="text-lg font-semibold">Groups</h2>
        <button
          onClick={() => setShowInput(!showInput)}
          className="px-2 py-1 bg-green-500 rounded hover:bg-green-600 text-xs font-semibold transition-all"
        >
          + Create
        </button>
      </div>

      {/* Create Group Box */}
      {showInput && (
        <div className="flex flex-col gap-2 mb-4 bg-purple-800 p-3 rounded-lg animate-fade-in">
          <input
            type="text"
            className="p-2 rounded text-gray-900 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
            placeholder="Enter group name..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <div className="flex flex-col max-h-32 overflow-y-auto border border-purple-600 p-2 rounded bg-purple-900">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 mb-1 text-sm cursor-pointer"
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
            className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600 text-sm transition-all"
          >
            Create Group
          </button>
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <p className="text-purple-300 text-sm">No groups yet</p>
      ) : (
        <div className="space-y-1">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-2 rounded hover:bg-purple-700 cursor-pointer transition-all flex justify-between items-center"
              onClick={() => {
                setSelectedChat(group.id);
                setIsGroup(true);
              }}
            >
              <span className="truncate">{group.name}</span>
              <span className="text-purple-300 text-xs">
                {group.members?.length || 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
