// components/TableModal.jsx
import Modal from "../Modal";
import FormField from "../FormField";

export default function TableModal({
  open,
  onClose,
  tableName,
  setTableName,
  onSave,
  editingTable,
}) {
  return (
    <Modal open={open} title={editingTable ? "Edit Table" : "Create New Table"} onClose={onClose}>
      <FormField label="Table Name" value={tableName} onChange={setTableName} />
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="bg-bg border border-iconDark text-text px-4 py-2 rounded-2xl font-prompt hover:bg-gray-100 transition-all"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="bg-button text-secondary px-4 py-2 rounded-2xl shadow-iconLight font-prompt hover:bg-[#14567D] transition-all"
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
