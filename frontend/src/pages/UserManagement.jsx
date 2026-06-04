import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";

import {
  EllipsisVertical,
  Edit3,
  Key,
  Trash2,
  UserPlus,
} from "lucide-react";

import ResponsiveContainer from "../components/common/ResponsiveContainer";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import SearchBox from "../components/common/SearchBox";

// -------------------------------------------------------------
//  Action Menu (สามจุด)
// -------------------------------------------------------------
function UserActionMenu({
  user,
  position,
  onEdit,
  onReset,
  onDelete,
  onClose,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className="bg-secondary border border-border rounded-2xl shadow-card w-32 font-sarabun"
    >
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/10"
        onClick={() => {
          onEdit(user);
          onClose();
        }}
      >
        <Edit3 size={16} /> Edit
      </button>

      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/10"
        onClick={() => {
          onReset(user);
          onClose();
        }}
      >
        <Key size={16} /> Reset
      </button>

      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
        onClick={() => {
          onDelete(user.username);
          onClose();
        }}
      >
        <Trash2 size={16} /> Delete
      </button>
    </div>,
    document.body
  );
}

// -------------------------------------------------------------
//  User Row
// -------------------------------------------------------------
function UserRow({ user, selectedUser, onSelect, onOpenMenu }) {
  return (
    <tr
      onClick={() => onSelect(user.username)}
      className={`cursor-pointer transition-colors ${
        selectedUser === user.username
          ? "bg-primary/20"
          : "bg-secondary hover:bg-primary/10"
      }`}
    >
      <td className="px-4 py-2">{user.username}</td>
      <td className="px-4 py-2">{user.role}</td>
      <td className="px-4 py-2">{user.email}</td>
      <td className="px-4 py-2">{user.phone}</td>

      <td className="px-4 py-2 relative flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.isActive ? "Active" : "Inactive"}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            onOpenMenu(user, {
              top: rect.bottom + window.scrollY,
              left: rect.right - 130,
            });
          }}
          className="p-1 text-iconDark hover:text-text"
        >
          <EllipsisVertical size={18} />
        </button>
      </td>
    </tr>
  );
}

// -------------------------------------------------------------
//  Main Component
// -------------------------------------------------------------
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openMenuUser, setOpenMenuUser] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [editUser, setEditUser] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newUser, setNewUser] = useState(null);

  // ---------------- ADD NEW ERROR STATE ----------------
  const [newUserErrors, setNewUserErrors] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  // -------------------------------------------------------------
  // LOAD USERS
  // -------------------------------------------------------------
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/user/", {
        headers: { Authorization: token },
      });

      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setUsers(list);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // -------------------------------------------------------------
  // FILTER
  // -------------------------------------------------------------
  const filteredData = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------------------------------------------------
  // VALIDATION LIKE REGISTER
  // -------------------------------------------------------------
  const validateNewUserField = (name, value) => {
    let msg = "";

    if (name === "username") {
      if (!value.trim()) msg = "กรุณากรอกชื่อผู้ใช้";
      else if (value.length < 3) msg = "ต้องมีอย่างน้อย 3 ตัว";
      else if (!/^[a-zA-Z0-9]+$/.test(value))
        msg = "ใช้ได้เฉพาะภาษาอังกฤษและตัวเลขเท่านั้น";
    }

    if (name === "password") {
      if (!value) msg = "กรุณากรอกรหัสผ่าน";
      else if (/\s/.test(value)) msg = "ห้ามมีช่องว่าง";
      else if (value.length < 8) msg = "รหัสผ่านต้องมีอย่างน้อย 8 ตัว";
    }

    if (name === "email") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) msg = "กรุณากรอกอีเมล";
      else if (!regex.test(value)) msg = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (name === "phone") {
      if (!/^\d{10}$/.test(value)) msg = "ต้องเป็นตัวเลข 10 หลัก";
    }

    setNewUserErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const canCreateUser =
    newUser?.username &&
    newUser?.password &&
    newUser?.email &&
    newUser?.phone &&
    !newUserErrors.username &&
    !newUserErrors.password &&
    !newUserErrors.email &&
    !newUserErrors.phone;

  // -------------------------------------------------------------
  // LOADING UI
  // -------------------------------------------------------------
  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 font-sarabun">
        Loading users...
      </div>
    );

  // -------------------------------------------------------------
  // RETURN UI
  // -------------------------------------------------------------
  return (
    <ResponsiveContainer className="font-sarabun">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-h2 font-prompt">User List</h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full md:w-auto">
          <div className="flex-1 w-full sm:w-auto">
            <SearchBox value={search} onChange={setSearch} />
          </div>

          <button
            onClick={() =>
              setNewUser({
                username: "",
                password: "",
                email: "",
                phone: "",
              })
            }
            className="bg-button text-white px-4 py-2 rounded-lg shadow-md mt-2 sm:mt-0 hover:bg-white hover:text-button flex items-center gap-2"
          >
            <UserPlus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl shadow-card">
        <table className="min-w-full text-sm text-text">
          <thead className="bg-secondary border-b border-border/40 text-text font-prompt">
            <tr>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((user) => (
              <UserRow
                key={user.username}
                user={user}
                selectedUser={selectedUser}
                onSelect={(username) =>
                  setSelectedUser((p) => (p === username ? null : username))
                }
                onOpenMenu={(user, pos) => {
                  setOpenMenuUser(user);
                  setMenuPosition(pos);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION MENU */}
      {openMenuUser && (
        <UserActionMenu
          user={openMenuUser}
          position={menuPosition}
          onEdit={setEditUser}
          onReset={(u) =>
            setResetTarget({ username: u.username, newPassword: "" })
          }
          onDelete={async (username) => {
            const confirm = await Swal.fire({
              title: "Delete user?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Delete",
            });

            if (!confirm.isConfirmed) return;

            try {
              const res = await fetch(
                `http://localhost:3000/api/user/${username}`,
                { method: "DELETE", headers: { Authorization: token } }
              );
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);

              Swal.fire("Deleted!", "User removed", "success");
              setUsers((prev) =>
                prev.filter((u) => u.username !== username)
              );
            } catch (err) {
              Swal.fire("Error", err.message, "error");
            }

            setOpenMenuUser(null);
          }}
          onClose={() => setOpenMenuUser(null)}
        />
      )}

      {/* EDIT USER (unchanged) */}
      {editUser && (
        <Modal
          open={true}
          title={`Edit ${editUser.username}`}
          onClose={() => setEditUser(null)}
        >
          <FormField
            label="Email"
            value={editUser.email}
            onChange={(v) => setEditUser({ ...editUser, email: v })}
          />

          <FormField
            label="Phone"
            value={editUser.phone}
            onChange={(v) => setEditUser({ ...editUser, phone: v })}
          />

          <FormField
            label="Role"
            value={editUser.role}
            onChange={(v) => setEditUser({ ...editUser, role: v })}
          />

          <div className="flex items-center gap-2 mt-3">
            <label>Active:</label>
            <input
              type="checkbox"
              checked={!!editUser.isActive}
              onChange={(e) =>
                setEditUser({ ...editUser, isActive: e.target.checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={() => setEditUser(null)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={async () => {
                const confirm = await Swal.fire({
                  title: "Save changes?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Save",
                });
                if (!confirm.isConfirmed) return;

                try {
                  const payload = {
                    role: editUser.role,
                    email: editUser.email,
                    phone: editUser.phone,
                    isActive: editUser.isActive,
                  };

                  const res = await fetch(
                    `http://localhost:3000/api/user/update/${editUser.username}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                      },
                      body: JSON.stringify(payload),
                    }
                  );

                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);

                  Swal.fire("Updated!", "User updated", "success");
                  setEditUser(null);
                  fetchUsers();
                } catch (err) {
                  Swal.fire("Error", err.message, "error");
                }
              }}
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* RESET PASSWORD */}
      {resetTarget && (
        <Modal
          open={true}
          title={`Reset Password for ${resetTarget.username}`}
          onClose={() => setResetTarget(null)}
        >
          <FormField
            label="New Password"
            type="password"
            value={resetTarget.newPassword}
            onChange={(v) =>
              setResetTarget((s) => ({ ...s, newPassword: v }))
            }
          />

          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={() => setResetTarget(null)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={async () => {
                const confirm = await Swal.fire({
                  title: "Reset password?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Reset",
                });

                if (!confirm.isConfirmed) return;

                try {
                  const res = await fetch(
                    `http://localhost:3000/api/user/reset-password/${resetTarget.username}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                      },
                      body: JSON.stringify({ newPassword: resetTarget.newPassword }),
                    }
                  );

                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);

                  Swal.fire("Success!", "Password reset", "success");
                  setResetTarget(null);
                } catch (err) {
                  Swal.fire("Error", err.message, "error");
                }
              }}
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* ADD NEW USER (VALIDATION ADDED) */}
      {newUser && (
        <Modal open={true} title="Create New User" onClose={() => setNewUser(null)}>
          
          {/* Username */}
          <FormField
            label="Username"
            value={newUser.username}
            onChange={(v) => {
              setNewUser({ ...newUser, username: v });
              validateNewUserField("username", v);
            }}
          />
          {newUserErrors.username && (
            <p className="text-red-500 text-xs mb-2">{newUserErrors.username}</p>
          )}

          {/* Password */}
          <FormField
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(v) => {
              setNewUser({ ...newUser, password: v });
              validateNewUserField("password", v);
            }}
          />
          {newUserErrors.password && (
            <p className="text-red-500 text-xs mb-2">{newUserErrors.password}</p>
          )}

          {/* Email */}
          <FormField
            label="Email"
            value={newUser.email}
            onChange={(v) => {
              const clean = v.trim();
              setNewUser({ ...newUser, email: clean });
              validateNewUserField("email", clean);
            }}
          />
          {newUserErrors.email && (
            <p className="text-red-500 text-xs mb-2">{newUserErrors.email}</p>
          )}

          {/* Phone */}
          <FormField
            label="Phone"
            value={newUser.phone}
            onChange={(v) => {
              const cleaned = v.replace(/\D/g, "").slice(0, 10);
              setNewUser({ ...newUser, phone: cleaned });
              validateNewUserField("phone", cleaned);
            }}
          />
          {newUserErrors.phone && (
            <p className="text-red-500 text-xs mb-2">{newUserErrors.phone}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={() => setNewUser(null)}>
              Cancel
            </button>

            <button
              className={`btn-primary ${
                canCreateUser ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!canCreateUser}
              onClick={async () => {
                try {
                  const res = await fetch("http://localhost:3000/api/user/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: token,
                    },
                    body: JSON.stringify(newUser),
                  });

                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);

                  Swal.fire("🎉 Success", "เพิ่มผู้ใช้แล้ว", "success");
                  setNewUser(null);
                  fetchUsers();
                } catch (err) {
                  Swal.fire("Error", err.message, "error");
                }
              }}
            >
              Create
            </button>
          </div>
        </Modal>
      )}
    </ResponsiveContainer>
  );
}
