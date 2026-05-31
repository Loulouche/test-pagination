import { useState, useEffect } from "react";

const API_URL = "/api/products";

export default function App() {
  // Ces informations ne sont pas forcément nécessaires, vous pouvez les adapter à votre convenance
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const [page,     setPage]     = useState(1);
  const [limit, setLimit]       = useState(50); //init = 10
  const [category, setCategory] = useState("");
  const [sort,     setSort]     = useState("createdAt");
  const [order,    setOrder]    = useState("desc");
  const [showTop, setShowTop] = useState(false);

  //search bar
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({page, limit, sort, order});
    if (category) 
      params.append("category", category);
    if (search) 
      params.append("search", search);

  fetch(`/api/products?${params}`)
    .then((res) => {
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    })
    .then((data) => {
      setProducts(data.products);
      setPagination(data.pagination);
    })
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
  }, [page, limit, category, sort, order, debouncedSearch]);

  useEffect(() => {
  const handleScroll = () => setShowTop(window.scrollY > 300);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 300);
  return () => clearTimeout(timer);
}, [search]);

  const getStockColor = (stock) => {
    if (stock < 10) return "#E24B4A";
    if (stock < 30) return "#EF9F27";
    return "#639922";
  };
  
  return (
    <div className="app">
      <div className="header">
        <h1>Catalogue produits</h1>
        <div className="filters">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              }}
            />
            <div className="selects">
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">Toutes categories</option>
            <option value="shoes">Chaussures</option>
            <option value="clothing">Vetements</option>
            <option value="accessories">Accessoires</option>
            <option value="bags">Sacs</option>
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="createdAt">Date</option>
            <option value="price">Prix</option>
            <option value="name">Nom</option>
            <option value="stock">Quantité</option>
          </select>
          <select value={order} onChange={(e) => { setOrder(e.target.value); setPage(1); }}>
            <option value="asc">Croissant</option>
            <option value="desc">Decroissant</option>
          </select>
            </div>
            
        </div>
      </div>

      {loading && <p className="loading">Chargement...</p>}
      {error   && <p className="error">Erreur : {error}</p>}

      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <p className="empty">Aucun produit trouve.</p>
          ) : (
            <>
              <div className="stock-legend">
                <span className="total-results">Nombre de produits : {pagination.total}</span>
                <div style={{display: "flex", gap: "1rem"}}>
                  <span><span className="dot" style={{ background: "#E24B4A" }}></span> Stock critique (&lt;10)</span>
                  <span><span className="dot" style={{ background: "#EF9F27" }}></span> Stock faible (&lt;30)</span>
                  <span><span className="dot" style={{ background: "#639922" }}></span> En stock</span>
                </div>
              </div>
              <div className="limit-selector">
                <span>Articles par page :</span>
                {[10, 25, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setLimit(n); setPage(1); }}
                    style={limit === n ? { fontWeight: "500", background: "#e5e0d8", borderColor: "#1a1a1a" } : {}}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Quantité</th>
                      <th>Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>
                          <span className="dot" style={{
                            background: product.stock < 10 ? "#E24B4A" : product.stock < 30 ? "#EF9F27" : "#639922"
                          }}></span>
                          {product.stock}
                        </td>
                        <td>{product.price} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

      {pagination && (
  <div className="pagination">
    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>{"<"}</button>

    {(() => {
      const pages = [];
      const total = pagination.totalPages;

      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        if (page > 3) pages.push("...");
        for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
          pages.push(i);
        }
        if (page < total - 2) pages.push("...");
        pages.push(total);
      }

      return pages.map((p, i) =>
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
      );
    })()}

    <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}>{">"}</button>
  </div>
)}
        {showTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>)}
        </>
      )}
    </div>
  );
}
