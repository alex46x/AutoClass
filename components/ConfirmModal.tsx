'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const ModalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-[#1C1C1E] w-full max-w-[320px] rounded-[24px] overflow-hidden shadow-2xl border border-white/5"
          >
            <div className="p-6 text-center space-y-2">
              <h3 className="text-[17px] font-bold text-white leading-tight">
                {title}
              </h3>
              <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
                {message}
              </p>
              <p className="text-[13px] text-slate-400 font-medium opacity-80">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex border-t border-white/10">
              <button
                onClick={onCancel}
                className="flex-1 py-4 text-[17px] font-medium text-blue-500 hover:bg-white/5 active:bg-white/10 transition-colors border-r border-white/10"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-4 text-[17px] font-bold transition-colors hover:bg-white/5 active:bg-white/10 ${
                  variant === 'danger' ? 'text-rose-500' : 'text-blue-500'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(ModalContent, document.body);
}
