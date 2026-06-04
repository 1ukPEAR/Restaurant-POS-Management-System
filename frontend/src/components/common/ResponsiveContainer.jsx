export default function ResponsiveContainer({ children }) {
  return (
    <main
      className="
        min-h-screen
        flex-1
        bg-gray-50
        transition-all
        ml-0 md:ml-64        /* เฉพาะจอใหญ่เท่านั้นที่เว้น sidebar */
        px-4 py-6 sm:px-6    /* มี padding ข้างๆ เฉพาะภายใน content */
      "
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </main>
  );
}
