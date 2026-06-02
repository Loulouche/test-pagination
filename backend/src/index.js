const express  = require("express");
const cors     = require("cors");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
require("dotenv").config();

const app       = express();
const PORT      = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";


function parseQueryParams(query) {
  let page = parseInt(query.page) || 1;
  if (page < 1) page = 1;

  let limit = parseInt(query.limit) || 10;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  const validSorts = ["createdAt", "price", "name", "stock"];
  const sort = validSorts.includes(query.sort) ? query.sort : "createdAt";

  const order = query.order === "asc" ? 1 : -1;

  const category = query.category || null;
  const search = query.search || null;

  return { page, limit, sort, order, category, search };
}

function buildFilter(category, search) {
  const filter = {};
  if (category) 
    filter.category = category;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: escaped, $options: "i" };
  }
  return filter;
}

async function fetchProducts(db, filter, sort, order, skip, limit) {
  const [products, total] = await Promise.all([
    db.collection("products").find(filter).sort({ [sort]: order }).skip(skip).limit(limit).toArray(),
    db.collection("products").countDocuments(filter),
  ]);
  return { products, total };
}

async function start() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log("Connecté à MongoDB");

  process.on("SIGINT", async () => {
    await client.close();
    process.exit(0);
  });
  
  const db = client.db("shop");
  app.locals.db = db;

  app.use(cors());
  app.use(express.json());
  app.get("/api/products", async (req, res) => {
    try {
      const { page, limit, sort, order, category, search } = parseQueryParams(req.query);
      const filter = buildFilter(category, search);
      const skip = (page - 1) * limit;
      const { products, total } = await fetchProducts(req.app.locals.db, filter, sort, order, skip, limit);

      res.json({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.delete("/api/products/:id", async(req, res) =>{
    try {
      const id = req.params.id;
      const result  = await db.collection("products").deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0)
        return res.status(404).json({ error: "Produit non trouvé" });

      res.json({ success: true });
      
    } catch (error) {

      res.status(500).json({ error: "Erreur serveur" });
      
    }

  });

  app.listen(PORT, () => console.log("Serveur demarre sur http://localhost:" + PORT));
}

start().catch((err) => {
  console.error("Erreur de connexion MongoDB :", err.message);
  process.exit(1);
});
