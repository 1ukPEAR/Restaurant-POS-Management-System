export default function CardGrid({ items = [], renderCard, emptyText = 'No items' }) {
  if (!items.length) {
    return <div className="p-6 text-center text-gray-500">{emptyText}</div>
  }
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((it, idx) => (
        <div key={it._id || idx} className="bg-white rounded-2xl shadow-card p-4">
          {renderCard ? renderCard(it) : <pre className="text-xs">{JSON.stringify(it, null, 2)}</pre>}
        </div>
      ))}
    </div>
  )
}
