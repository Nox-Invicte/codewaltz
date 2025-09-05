"use client";

import { useState } from "react";
import AvatarUpload from "@/components/ui/avatar-upload";
import Modal from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { deleteAllSnippets } from "@/lib/supabase/snippets";


export default function ProfileClient() {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Modal state
  type ModalState = {
    open: boolean;
    title?: string;
    message?: string;
    onConfirm?: (() => void) | null;
    onCancel?: (() => void) | null;
    confirmText?: string;
    cancelText?: string;
    onlyOk?: boolean;
  };
  const [modal, setModal] = useState<ModalState>({ open: false });
  const showModal = (options: Omit<ModalState, 'open'>) => setModal({ ...options, open: true });
  const closeModal = () => setModal({ open: false });

  // ...existing code...


  const loadDefaults = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setDisplayName(user.user_metadata?.username || user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setAvatarUrl(user.user_metadata?.avatar_url);
    }
  };
  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    setLoading(true);
    try {
      // Upload to Supabase Storage (bucket: 'avatars')
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setAvatarUrl(publicUrl);
      // Save avatar URL to user metadata
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;
      showModal({
        title: "Success",
        message: "Avatar updated!",
        onlyOk: true,
        onConfirm: closeModal,
      });
    } catch (e: any) {
      showModal({
        title: "Error",
        message: e?.message || "Failed to upload avatar",
        onlyOk: true,
        onConfirm: closeModal,
      });
    } finally {
      setLoading(false);
    }
  };

  // load once
  useState(() => { loadDefaults(); return undefined; });

  const updateDisplayName = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { username: displayName } });
      if (error) throw error;
      showModal({
        title: "Success",
        message: "Display name updated",
        onlyOk: true,
        onConfirm: closeModal,
      });
    } catch (e: any) {
      showModal({
        title: "Error",
        message: e?.message || "Failed to update display name",
        onlyOk: true,
        onConfirm: closeModal,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      showModal({
        title: "Success",
        message: "Email update requested. Check your inbox to confirm.",
        onlyOk: true,
        onConfirm: closeModal,
      });
    } catch (e: any) {
      showModal({
        title: "Error",
        message: e?.message || "Failed to update email",
        onlyOk: true,
        onConfirm: closeModal,
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!password || password.length < 6) {
      showModal({
        title: "Error",
        message: "Password must be at least 6 characters",
        onlyOk: true,
        onConfirm: closeModal,
      });
      return;
    }
    showModal({
      title: "Confirm Password Change",
      message: "Are you sure you want to change your password?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        closeModal();
        setLoading(true);
        try {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;
          setPassword("");
          setSuccess(true);
          setTimeout(() => setSuccess(false), 2000);
        } catch (e: any) {
          showModal({
            title: "Error",
            message: e?.message || "Failed to update password",
            onlyOk: true,
            onConfirm: closeModal,
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: closeModal,
    });
  // ...existing code...
  };

  const handleDeleteAll = async () => {
    showModal({
      title: "Delete All Snippets",
      message: "Delete all your snippets? This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        setLoading(true);
        try {
          await deleteAllSnippets();
          showModal({
            title: "Success",
            message: "All snippets deleted",
            onlyOk: true,
            onConfirm: closeModal,
          });
        } catch (e: any) {
          showModal({
            title: "Error",
            message: e?.message || "Failed to delete snippets",
            onlyOk: true,
            onConfirm: closeModal,
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: closeModal,
    });
  };

  return (
    <>
      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.title}
        actions={
          modal.onlyOk ? (
            <button
              className="px-4 py-2 rounded-lg font-medium border bg-primary text-white"
              onClick={modal.onConfirm || closeModal}
            >
              OK
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 rounded-lg font-medium border"
                onClick={modal.onCancel || closeModal}
              >
                {modal.cancelText || "Cancel"}
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium border bg-primary text-white"
                onClick={modal.onConfirm || closeModal}
              >
                {modal.confirmText || "OK"}
              </button>
            </>
          )
        }
      >
        {modal.message}
      </Modal>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col items-center mb-8">
          <AvatarUpload imageUrl={avatarUrl} onUpload={handleAvatarUpload} size={96} />
          <span className="text-xs text-muted-foreground mt-2">Click to change avatar</span>
        </div>
        {/* ...existing code... */}
        <div className="rounded-xl border p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-4">Display Name</h3>
          <input
            className="w-full px-4 py-2 rounded-lg border bg-transparent mb-3"
            placeholder="Enter display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <button
            disabled={loading}
            onClick={updateDisplayName}
            className="px-4 py-2 rounded-lg font-medium border"
          >
            Save Name
          </button>
        </div>

        <div className="rounded-xl border p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-4">Update Email</h3>
          <input
            className="w-full px-4 py-2 rounded-lg border bg-transparent mb-3"
            placeholder="Enter new email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            disabled={loading}
            onClick={updateEmail}
            className="px-4 py-2 rounded-lg font-medium border"
          >
            Save Email
          </button>
        </div>

        <div className="rounded-xl border p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <input
            className="w-full px-4 py-2 rounded-lg border bg-transparent mb-3"
            placeholder="Enter new password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {success && (
            <p className="text-sm text-green-600 mb-2">Password updated successfully!</p>
          )}
          <button
            disabled={loading}
            onClick={updatePassword}
            className="px-4 py-2 rounded-lg font-medium border"
          >
            Save Password
          </button>
        </div>

        <div className="rounded-xl border p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
          <button
            disabled={loading}
            onClick={handleDeleteAll}
            className="px-4 py-2 rounded-lg font-semibold border text-red-600 border-red-600"
          >
            Delete All Snippets
          </button>
        </div>
      </div>
    </>
  );
// ...existing code...
}