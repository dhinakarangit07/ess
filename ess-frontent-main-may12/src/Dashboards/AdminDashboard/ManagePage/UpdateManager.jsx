// Same imports as before
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateManager = ({
  open,
  setOpen,
  managerId,
  ShiftList,
  DepartmentList,
  fetchManagerList,
}) => {
  const [ManagerData, setManagerData] = useState({
    manager_name: "",
    email: "",
    gender: "",
    dob: "",
    manager_image: null,
    manager_id: "",
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchManagerData = async () => {
      if (!managerId) return;

      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/api/managers/get/${managerId}/`,
        );
        setManagerData({
          manager_name: data.manager_name,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          manager_image: null,
          manager_id: data.manager_id,
          username: data.username,
          password: "",
          department: data.department,
          shift: data.shift,
          hired_date: data.hired_date,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load manager data.");
      }
    };

    fetchManagerData();
  }, [managerId]);

  const validateForm = () => {
    const newErrors = {};
    if (!/^[A-Za-z\s]*$/.test(ManagerData.manager_name))
      newErrors.manager_name = "Only letters allowed in name";

    if (!/^[A-Za-z\s]*$/.test(ManagerData.username))
      newErrors.username = "Only letters allowed in username";

    const today = new Date().toISOString().split("T")[0];
    if (ManagerData.dob > today)
      newErrors.dob = "Date of Birth cannot be a future date";

    if (ManagerData.hired_date > today)
      newErrors.hired_date = "Hired Date cannot be a future date";

    if (!ManagerData.password)
      newErrors.password = "Password is required to update manager";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    Object.entries(ManagerData).forEach(([key, value]) => {
      if (key === "manager_image" && !value) return;
      if (key === "manager_id") return;
      if (key === "password" && value === "") return;
      formData.append(key, value);
    });

    try {
      const res = await axios.put(
        `${apiBaseUrl}/admin/managers/${managerId}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Manager updated successfully");
      fetchManagerList();
      setOpen(false);
    } catch (error) {
      const err = error?.response?.data;
      if (err?.username) {
        setErrors({ username: err.username });
      } else if (err?.email) {
        setErrors({ email: err.email });
      } else if (err?.password) {
        setErrors({ password: err.password });
      } else {
        toast.error("Failed to update manager.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Manager</DialogTitle>
        </DialogHeader>
        <form className="space-y-2" onSubmit={handleSubmit}>
          {/* PERSONAL DETAILS */}
          <div className="grid gap-2">
            {/* Name */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Name</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={ManagerData.manager_name}
                  onChange={(e) =>
                    setManagerData({
                      ...ManagerData,
                      manager_name: e.target.value,
                    })
                  }
                />
                {errors.manager_name && (
                  <p className="text-red-500 text-xs">{errors.manager_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-3 gap-2 items-start">
              <label>Email</label>
              <div className="col-span-2">
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded"
                  value={ManagerData.email}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, email: e.target.value })
                  }
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>
            {/* Gender */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Gender</label>
              <select
                className="col-span-2 border px-3 py-2 rounded"
                value={ManagerData.gender}
                onChange={(e) =>
                  setManagerData({ ...ManagerData, gender: e.target.value })
                }
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* DOB */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Date of Birth</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={ManagerData.dob}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, dob: e.target.value })
                  }
                />
                {errors.dob && (
                  <p className="text-red-500 text-xs">{errors.dob}</p>
                )}
              </div>
            </div>

            {/* Profile image */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Profile Image</label>
              <input
                type="file"
                className="col-span-2 border px-3 py-2 rounded"
                onChange={(e) =>
                  setManagerData({
                    ...ManagerData,
                    manager_image: e.target.files[0],
                  })
                }
              />
            </div>
          </div>

          {/* WORK DETAILS */}
          <div className="grid gap-2">
            {/* Department */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Department</label>
              <select
                className="col-span-2 border px-3 py-2 rounded"
                value={ManagerData.department}
                onChange={(e) =>
                  setManagerData({ ...ManagerData, department: e.target.value })
                }
              >
                <option value="">Select Department</option>
                {DepartmentList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Manager ID (read-only) */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>User ID</label>
              <input
                className="col-span-2 border px-3 py-2 rounded bg-gray-100"
                value={ManagerData.manager_id}
                disabled
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Password</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={ManagerData.password}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, password: e.target.value })
                  }
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Username</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={ManagerData.username}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, username: e.target.value })
                  }
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Hired Date */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Hired Date</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={ManagerData.hired_date}
                  onChange={(e) =>
                    setManagerData({
                      ...ManagerData,
                      hired_date: e.target.value,
                    })
                  }
                />
                {errors.hired_date && (
                  <p className="text-red-500 text-xs">{errors.hired_date}</p>
                )}
              </div>
            </div>

            {/* Shift */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Shift</label>
              <select
                className="col-span-2 border px-3 py-2 rounded"
                value={ManagerData.shift}
                onChange={(e) =>
                  setManagerData({ ...ManagerData, shift: e.target.value })
                }
              >
                <option value="">Select Shift</option>
                {ShiftList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shift_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded-lg"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Update
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateManager;
