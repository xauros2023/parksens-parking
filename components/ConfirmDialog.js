"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmDialog({ open, title, description, confirmLabel, busy, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="confirm-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancel?.();
          }}
        >
          <motion.div
            className="confirm-card"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <h3 id="confirm-dialog-title">{title}</h3>
            <p>{description}</p>
            <div className="confirm-card__actions">
              <button type="button" className="btn btn--sm btn--ghost" onClick={onCancel} disabled={busy}>
                Annuler
              </button>
              <button type="button" className="btn btn--sm btn--danger-solid" onClick={onConfirm} disabled={busy}>
                {busy ? "En cours…" : confirmLabel || "Confirmer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
