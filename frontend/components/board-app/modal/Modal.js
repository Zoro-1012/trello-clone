"use client";

export default function Modal({ children, onClose }) {
  return (
    <div className="modal-shell" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
