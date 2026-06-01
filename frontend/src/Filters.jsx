export default function Filters({ search, setSearch, category, setCategory, sort, setSort, order, setOrder, setPage }) {
  return (
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
  );
}