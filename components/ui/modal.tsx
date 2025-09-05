import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div
        className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg shadow-lg max-w-md w-full p-6 relative border border-zinc-200 dark:border-zinc-700"
      >
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="mb-4">{children}</div>
        {actions && <div className="flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
