export default function FormField({ label, type='text', value, onChange, placeholder, required, error }) {
  return (
    <div className="mb-3">
      {label && <label className="block mb-1 font-medium">{label}{required && ' *'}</label>}
      <input
        type={type}
        value={value}
        onChange={e=>onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg p-2 ${error ? 'border-error' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-primary`}
      />
      {error && <div className="text-error text-xs mt-1">{error}</div>}
    </div>
  )
}
