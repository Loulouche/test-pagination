export default function ProductTable({ products }) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}