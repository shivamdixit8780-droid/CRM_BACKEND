require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI;

const products = [
  {
    name: "Herbal Face Wash",
    price: 1299,
    category: "Skincare",
    size: "100 ml",
    image: "HerbalFaceWash.png",
    description:
      "Deep cleanses and refreshes skin with natural aloe vera and green tea extracts. Removes impurities without drying skin. Suitable for all skin types.",
    usage:
      "1. Wet your face with lukewarm water.\n2. Take a small amount on palm.\n3. Gently massage in circular motions for 30 seconds.\n4. Rinse thoroughly with water.\n5. Use twice daily — morning and night.",
    benefits: "Deep cleansing, refreshing, natural glow, removes acne",
    stock: 150,
  },
  {
    name: "Herbal Green Tea",
    price: 1499,
    category: "Wellness",
    size: "25 Tea Bags",
    image: "HerbalGreenTea.png",
    description:
      "Pure and natural green tea rich in antioxidants. Boosts metabolism, aids weight management, supports heart health, and strengthens immunity. 100% natural with no preservatives.",
    usage:
      "1. Boil 1 cup of water (150 ml).\n2. Place one tea bag in the cup.\n3. Pour hot water over the tea bag.\n4. Let it steep for 3-5 minutes.\n5. Remove tea bag and enjoy.\n6. Best consumed 2-3 times daily.",
    benefits: "Rich in antioxidants, aids metabolism, boosts immunity, heart health",
    stock: 200,
  },
  {
    name: "Herbal Hair Oil",
    price: 1599,
    category: "Haircare",
    size: "200 ml",
    image: "HerbalHairOil.png",
    description:
      "Nourishes hair and strengthens roots with the goodness of hibiscus, amla, and coconut. Prevents hair fall, promotes growth, and adds natural shine.",
    usage:
      "1. Take small amount of oil on palm.\n2. Apply gently on scalp and hair roots.\n3. Massage in circular motions for 5-10 minutes.\n4. Leave overnight or for at least 2 hours.\n5. Wash with mild shampoo.\n6. Use 2-3 times a week for best results.",
    benefits: "Prevents hair fall, strengthens roots, promotes growth, natural shine",
    stock: 120,
  },
  {
    name: "Herbal Immunity Booster",
    price: 1899,
    category: "Wellness",
    size: "60 Capsules",
    image: "HerbalImmunityBooster.png",
    description:
      "Natural herbs blend for immunity support. Made with amla, turmeric, ginger, and black pepper. Boosts body's natural defense system and improves overall wellness.",
    usage:
      "1. Take 1 capsule twice daily.\n2. Consume after meals with warm water.\n3. Best taken in morning and evening.\n4. Continue for at least 3 months for visible results.\n5. Consult doctor if pregnant or on medication.",
    benefits: "Boosts immunity, natural energy, improves digestion, antioxidant rich",
    stock: 180,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    await Product.deleteMany({});
    console.log("🗑️  Old products deleted");

    await Product.insertMany(products);
    console.log("✅ 4 Products added successfully!");

    products.forEach((p) => {
      console.log(`   → ${p.name} - ₹${p.price}`);
    });

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedDatabase();