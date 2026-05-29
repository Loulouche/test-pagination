import { useState, useEffect } from "react";

const API_URL = "/api/products";

export default function App() {
  // Ces informations ne sont pas forcément nécessaires, vous pouvez les adapter à votre convenance
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const [page,     setPage]     = useState(1);
  const [limit]                 = useState(50); //init = 10
  const [category, setCategory] = useState("");
  const [sort,     setSort]     = useState("createdAt");
  const [order,    setOrder]    = useState("desc");

  //search bar
  const [search, setSearch] = useState("");

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
  }, [page, limit, category, sort, order, search]);

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
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">Toutes categories</option>
            <option value="shoes">Chaussures</option>
            <option value="clothing">Vetements</option>
            <option value="accessories">Accessoires</option>
            <option value="bags">Sacs</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="createdAt">Date</option>
            <option value="price">Prix</option>
            <option value="name">Nom</option>
          </select>
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="asc">Croissant</option>
            <option value="desc">Decroissant</option>
          </select>
        </div>
      </div>

      {loading && <p className="loading">Chargement...</p>}
      {error   && <p className="error">Erreur : {error}</p>}

      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <p className="empty">Aucun produit trouve.</p>
          ) : (
            <div className="table-wrap">
              <table>
              <thead>
                <tr>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                </tr>
              </thead>

              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.price} €</td>
                </tr>
              ))}
              </table>
            </div>
            
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
            style={p === page ? { fontWeight: "bold", background: "#e0e0e0" } : {}}
          >
            {p}
          </button>
        )
      );
    })()}

    <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}>{">"}</button>
  </div>
)}
        </>
      )}
    </div>
  );
}
