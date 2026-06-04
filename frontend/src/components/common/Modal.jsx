export default function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">{title}</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
