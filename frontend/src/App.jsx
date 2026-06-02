import { useState, useEffect } from "react";
import Filters from "./Filters";
import ProductTable from "./ProductTable";
import Pagination from "./Pagination";


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

  // Récupère les produits depuis l'API à chaque changement de filtre, tri, page ou recherche
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({page, limit, sort, order});
    if (category) 
      params.append("category", category);
    if (debouncedSearch) 
      params.append("search", debouncedSearch);

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


 // Affiche le bouton "retour en haut" quand l'utilisateur scrolle de plus de 300px
  useEffect(() => {
  const handleScroll = () => setShowTop(window.scrollY > 300);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// Attend 300ms après la dernière frappe avant de lancer la recherche (debounce)
// évite d'envoyer une requête à chaque lettre tapée
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 300);
  return () => clearTimeout(timer);
}, [search]);


  const handleDelete = (id) => {
  fetch(`/api/products/${id}`, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) throw new Error("Erreur suppression");
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setPagination((prev) => ({...prev, total: prev.total - 1}));
    })
    .catch((err) => setError(err.message));
};
  
  return (
    <div className="app">
      <div className="header">
        <h1>Catalogue produits</h1>
        <Filters
          search={search} setSearch={setSearch}
          category={category} setCategory={setCategory}
          sort={sort} setSort={setSort}
          order={order} setOrder={setOrder}
          setPage={setPage}
        />
      </div>

      {loading && <p className="loading">Chargement...</p>}
      {error && <p className="error">Erreur : {error}</p>}

      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <p className="empty">Aucun produit trouvé.</p>
          ) : (
            <>
              <div className="stock-legend">
                <span className="total-results">Nombre de produits : {pagination.total}</span>
                <div style={{ display: "flex", gap: "1rem" }}>
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
              <ProductTable products={products} onDelete={handleDelete} />
            </>
          )}

          {pagination && (
            <Pagination page={page} totalPages={pagination.totalPages} setPage={setPage} />
          )}
        </>
      )}

      {showTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          ↑
        </button>
      )}
    </div>
  );
}