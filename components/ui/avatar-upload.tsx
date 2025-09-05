import React, { useRef, useState, useEffect } from "react";

interface AvatarUploadProps {
  imageUrl?: string;
  onUpload: (file: File) => void;
  size?: number;
}

export default function AvatarUpload({ imageUrl, onUpload, size = 64 }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(imageUrl);

  // Update preview if imageUrl prop changes (e.g., after upload)
  useEffect(() => {
    setPreview(imageUrl);
  }, [imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    }
  };

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <img
        src={preview || "/default-avatar.png"}
        alt="Avatar"
        className="rounded-full object-cover border border-zinc-300 dark:border-zinc-700 shadow w-full h-full"
        style={{ width: size, height: size }}
      />
      <button
        type="button"
        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        onClick={() => inputRef.current?.click()}
        aria-label="Upload avatar"
      >
        <span className="text-white text-xs font-semibold">Change</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
