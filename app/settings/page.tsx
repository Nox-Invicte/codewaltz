"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteAllSnippets } from "@/lib/supabase/snippets";
import type { User } from "@supabase/supabase-js";

export default function Settings() {
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      setDisplayName(data.user.user_metadata?.username ?? "");
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleDeleteAllClick = () => {
    setConfirmDeleteAll(true);
  };

  const handleConfirmDeleteAll = async () => {
    try {
      await deleteAllSnippets();
      setConfirmDeleteAll(false);
      alert("All snippets have been deleted.");
    } catch (error) {
      alert("Failed to delete snippets. Please try again.");
      console.error("Error deleting all snippets:", error);
    }
  };

  const handleCancelDeleteAll = () => {
    setConfirmDeleteAll(false);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };

  const handleUpdateDisplayName = async () => {
    setUpdateStatus(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { username: displayName },
    });
    if (error) {
      setUpdateStatus({ success: false, message: error.message });
    } else {
      setUpdateStatus({ success: true, message: "Display name updated successfully." });
      // Redirect to profile after successful update
      router.push(`/profile/${user?.id}`);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <main className={`p-8 max-w-5xl mx-auto min-h-screen`}>
      <h1 className="text-6xl font-bold mb-8">Settings</h1>
      <p className="text-2xl mb-12">
        Customize your CodeWaltz experience.
      </p>
      <section className="space-y-12">
        <div className="rounded-lg p-6 shadow-lg bg-gray-800 bg-opacity-50">
          <h2 className="text-2xl text-white font-semibold mb-4">Display Name</h2>
          <input
            type="text"
            value={displayName}
            onChange={handleDisplayNameChange}
            className="w-full p-2 rounded mb-4 text-white"
            placeholder="Enter your display name"
          />
          <button
            onClick={handleUpdateDisplayName}
            className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded"
          >
            Update Display Name
          </button>
          {updateStatus && (
            <p
              className={`mt-4 ${
                updateStatus.success ? "text-green-400" : "text-red-400"
              }`}
            >
              {updateStatus.message}
            </p>
          )}
        </div>

        <div className="rounded-lg p-6 shadow-lg bg-gray-800 bg-opacity-50">
          <h2 className="text-2xl text-white font-semibold mb-4">Snippets</h2>
          <button
            onClick={handleDeleteAllClick}
            className="bg-red-600 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded"
          >
            Delete All Snippets
          </button>
        </div>
      </section>

      {confirmDeleteAll && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 border-4 border-gray-400 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Confirm Delete All</h2>
            <p className="mb-6 text-white">
              Are you sure you want to delete all your saved snippets? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDeleteAll}
                className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAll}
                className="bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
