"use client";

import { useState } from "react";

export default function Settings() {
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const handleDeleteAllClick = () => {
    setConfirmDeleteAll(true);
  };

  const handleConfirmDeleteAll = () => {
    localStorage.removeItem("userSnippets");
    setConfirmDeleteAll(false);
    alert("All snippets have been deleted.");
  };

  const handleCancelDeleteAll = () => {
    setConfirmDeleteAll(false);
  };

  return (
    <main className={`p-8 max-w-5xl mx-auto min-h-screen`}>
      <h1 className="text-6xl font-bold mb-8">Settings</h1>
      <p className="text-2xl mb-12">
        Customize your CodeWaltz experience.
      </p>
      <section className="space-y-12">
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
