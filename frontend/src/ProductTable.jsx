export default function ProductTable({ products, onDelete }) {
  const getStockColor = (stock) => {
    if (stock < 10) return "#E24B4A";
    if (stock < 30) return "#EF9F27";
    return "#639922";
  };

  return (
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
                <span className="dot" style={{ background: getStockColor(product.stock) }}></span>
                {product.stock}
              </td>
              <td>{product.price} €</td>
              <td>
                <button className="delete-btn" onClick={() => onDelete(product._id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}