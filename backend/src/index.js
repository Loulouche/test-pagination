const express  = require("express");
const cors     = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app       = express();
const PORT      = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

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
    const db = req.app.locals.db;

    //page
    let page = parseInt(req.query.page) || 1;
    if (page < 1) page = 1;

    //limite de produit 
    let limit = parseInt(req.query.limit) || 10;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    // category
    let category = req.query.category || null;

    //search bar 
    let search = req.query.search || null;

    //tri
    let sort = "createdAt";
    if (req.query.sort === "price") 
      sort = "price";
    else if (req.query.sort === "name") 
      sort = "name";
    else if (req.query.sort === "stock") 
      sort = "stock";

    //ordre 
    let order = -1;
    if (req.query.order === "asc") order = 1;

    const filter = {};
    if (category) 
      filter.category = category;
    if (search)
    {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escaped, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.collection("products").find(filter).sort({ [sort]: order }).skip(skip).limit(limit).toArray(),
      db.collection("products").countDocuments(filter),
    ]);

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

  app.listen(PORT, () => console.log("Serveur demarre sur http://localhost:" + PORT));
}

start().catch((err) => {
  console.error("Erreur de connexion MongoDB :", err.message);
  process.exit(1);
});
