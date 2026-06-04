export default function StatKPI({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-card text-center">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-primary font-bold text-lg md:text-xl">{value}</p>
    </div>
  )
}
