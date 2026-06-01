export default function Pagination({ page, totalPages, setPage }) {
  const pages = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>{"<"}</button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="page-info">...</span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p)}
            disabled={p === page}
            style={p === page ? { fontWeight: "bold", background: "#e5e0d8" } : {}}
          >
            {p}
          </button>
        )
      )}

      <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>{">"}</button>
    </div>
  );
}