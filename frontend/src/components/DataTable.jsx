import { useMemo, useState } from 'react'

export default function DataTable({ data = [], columns = [], searchable = true, paginated = true, pageSize = 10 }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [selectedRowId, setSelectedRowId] = useState(null) // เก็บ row ที่ถูกเลือก

  const filtered = useMemo(() => {
    if (!q) return data
    const lc = q.toLowerCase()
    return data.filter(row =>
      Object.values(row).some(v => String(v ?? '').toLowerCase().includes(lc))
    )
  }, [q, data])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = paginated ? filtered.slice((page-1)*pageSize, page*pageSize) : filtered

  return (
    <div className="w-full">
      {searchable && (
        <div className="p-3 flex justify-between items-center">
          <input
            value={q}
            onChange={(e)=>{ setQ(e.target.value);} }
            placeholder="Search..."
            className="w-full md:w-64 border border-gray-300 rounded-lg p-2"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="p-2 text-center">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => {
              const isSelected = selectedRowId === (row._id || idx)
              return (
                <tr
                  key={row._id || idx}
                  className={`border-b hover:bg-gray-50 cursor-pointer ${
                    isSelected ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => setSelectedRowId(row._id || idx)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="p-2 text-center">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            })}
            {!pageData.length && (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {paginated && totalPages > 1 && (
        <div className="flex justify-end gap-2 p-3">
          <button className="btn-secondary" onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <div className="px-3 py-2 text-sm">{page} / {totalPages}</div>
          <button className="btn-primary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
        </div>
      )}
    </div>
  )
}
