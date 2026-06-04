// ===============================
// ⭐ FULL FILE — ConfirmDialog.jsx
// ===============================

export default function ConfirmDialog({
  open,
  title = "ยืนยันการทำรายการ",
  message = "คุณต้องการทำรายการนี้หรือไม่?",
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center font-prompt">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-sm animate-fadeIn">

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 text-center">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-5">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
