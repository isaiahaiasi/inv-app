#! /usr/bin/env node

console.log(
  "\nThis script populates some test data to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

const userArgs = process.argv.slice(2);

const async = require("async");

const mongoose = require("mongoose");
console.log(userArgs[0]);
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const Category = require("./models/category");
const product = require("./models/product");

const categories = [];
const products = [];

function saveDocument(doc, docCollection, modelName, cb) {
  doc.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }

    console.log(`new ${modelName}: ` + doc);
    docCollection.push(doc);
    cb(null, doc);
  });
}

function addDocument(fields, createFn, cb) {
  const { doc, docCollection, modelName } = createFn(fields);
  saveDocument(doc, docCollection, modelName, cb);
}

function createCategory({ name, description }) {
  const categoryDetail = { name };
  if (description) {
    categoryDetail.description = description;
  }

  return {
    doc: new Category(categoryDetail),
    modelName: "Category",
    docCollection: categories,
  };
}

function createProduct({ name, description, category, price, stock }) {
  const productDetail = { name, category, price, stock };

  if (description) {
    productDetail.description = description;
  }

  return {
    doc: new product(productDetail),
    modelName: "Product",
    docCollection: products,
  };
}

const categoryData = [
  {
    name: "Trick Weapons",
    description:
      "Trick Weapons in Bloodborne are weapons wielded in the right hand. These weapons can be transformed into alternate forms and have different attacks in their transformed mode.",
  },
  {
    name: "Firearms",
    description:
      "Firearms are Weapons in Bloodborne that are used in the left hand and are employed in beast hunting. They fire projectiles at the enemy, doing damage and various other effects. They can also be used to parry enemies. ",
  },
  {
    name: "Hunter Tools",
    description:
      'Hunter Tools are Items that function similarly to "Spells" in the Souls series. These items are unlimited use, and have special effects for combat and tactics. They consume either Quicksilver Bullets or Blood Bullets.',
  },
  {
    name: "Attire",
    description:
      'Armor, or Attire is protective equipment for the player character in Bloodborne. Characters can equip protective gear in four different body slots: Head, Chest, Arms and Legs. Attire or Armor is often comprised of "Sets", with a uniform, matching look and similar protective characteristics.',
  },
  {
    name: "Consumables",
    description:
      "Consumables in Bloodborne are Items that deplete with use. They can be found around Yharnam, on corpses of fallen enemies and purchased from Messengers (vendors).",
  },
];

// category names are just stubs used to find the actual category objs once array has been populated
const productData = [
  {
    name: "Amygdalan Arm",
    description:
      "The arm of a small Amygdala Great One. Strictly speaking, the Amygdalan Arm is no trick weapon of any sort, but certain madmen wield them like clubs. Starts as a large, tough blunt weapon formed of bone, but when extended, the hand quivers as if it were still alive.",
    price: 6600000,
    stock: 1,
    category: "Trick Weapons",
  },
  {
    name: "Hunter Axe",
    description:
      "One of the trick weapons of the workshop, commonly used on the hunt. Retains the qualities of an axe, but offers a wider palette of attacks by transforming. Boasts a heavy blunt attack, leading to high rally potential. No matter their pasts, beasts are no more than beasts. Some choose this axe to play the part of executioner.",
    price: 20000,
    stock: 30,
    category: "Trick Weapons",
  },
  {
    name: "Ludwig's Holy Blade",
    description:
      "A trick weapon typically used by Healing Church hunters. It is said that the silver sword was employed by Ludwig, the first hunter of the church. When transformed, it combines with its sheath to form a greatsword. It exhibits several departures from the workshop's design, suggesting that the Church anticipated much larger inhuman beasts.",
    price: 10_000_00,
    stock: 3,
    category: "Trick Weapons",
  },
  {
    name: "Blood Vial",
    description:
      "Special blood used in ministration. Restores HP. Once a patient has had their blood ministered, a unique but common treatment in Yharnam, successive infusions recall the first, and are all the more invigorating for it. No surprise that most Yharnamites are heavy users of blood.",
    price: 10000,
    stock: 1000,
    category: "Consumables",
  },
];

function createCategories(cb) {
  const createCategoryFns = categoryData.map((cat) => {
    return function (callback) {
      addDocument(cat, createCategory, callback);
    };
  });
  async.series(createCategoryFns, cb); // (2nd param is optional callback)
}

function createProducts(cb) {
  const createProductFns = productData.map((product) => {
    const category =
      categories.find((cat) => cat.name === product.category) ?? categories[2];

    return function (callback) {
      addDocument({ ...product, category }, createProduct, callback);
    };
  });

  async.series(createProductFns, cb);
}

async.series(
  [createCategories, createProducts],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("final products: " + results);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
