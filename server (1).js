const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || "2580";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let orders = [];
let nextId = 1001;

app.get("/api/menu", (req, res) => res.json(menu));
app.get("/api/orders", (req, res) => {
  if (req.headers["x-admin-pin"] !== ADMIN_PIN) return res.status(401).json({ error: "Incorrect admin PIN" });
  res.json(orders);
});
app.post("/api/orders", (req, res) => {
  const { customer, phone, address, notes, orderType, paymentMethod, items } = req.body || {};
  if (!customer || !phone || !Array.isArray(items) || !items.length || !["Delivery","Pickup"].includes(orderType) || paymentMethod !== "UPI") {
    return res.status(400).json({ error: "Please provide name, phone number, and at least one item." });
  }
  const cleanItems = items.map(i => {
    const product = menu.find(p => p.id === Number(i.id));
    const qty = Math.max(1, Math.min(50, Number(i.qty) || 1));
    return product ? { id: product.id, name: product.name, price: product.price, qty, subtotal: product.price * qty } : null;
  }).filter(Boolean);
  if (!cleanItems.length) return res.status(400).json({ error: "No valid menu items selected." });
  const order = {
    id: nextId++, customer: String(customer).slice(0, 100), phone: String(phone).slice(0, 30),
    address: String(address || "").slice(0, 300), orderType, paymentMethod, paymentStatus: "Not verified", notes: String(notes || "").slice(0, 500),
    items: cleanItems, total: cleanItems.reduce((sum, i) => sum + i.subtotal, 0),
    status: "New", createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  io.emit("new-order", order);
  res.status(201).json({ ok: true, orderId: order.id, total: order.total });
});
app.patch("/api/orders/:id/status", (req, res) => {
  if (req.headers["x-admin-pin"] !== ADMIN_PIN) return res.status(401).json({ error: "Incorrect admin PIN" });
  const allowed = ["New", "Preparing", "Ready", "Completed", "Cancelled"];
  const order = orders.find(o => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
  order.status = req.body.status;
  io.emit("order-updated", order);
  res.json({ ok: true });
});

const menu = [
  {id:1, category:"Shawarma", name:"Regular Shawarma", description:"Juicy chicken, garlic mayo, fresh veggies, signature sauce, soft rumali wrap", price:89},
  {id:2, category:"Shawarma", name:"GT Special Shawarma", description:"Extra chicken, cheese, fries, garlic mayo, GT special sauce, fresh lettuce", price:130},
  {id:3, category:"Biryani", name:"Half Biryani", description:"2 chicken pieces, basmati rice, raita, salad", price:90},
  {id:4, category:"Biryani", name:"Full Biryani", description:"4 chicken pieces, basmati rice, raita, salad", price:180},
  {id:5, category:"Biryani", name:"GT Special Biryani", description:"6 chicken pieces, basmati rice, boiled egg, fried onion, extra masala, raita, salad", price:250},
  {id:6, category:"Chicken Fry", name:"Chicken Fry", description:"Crispy fried chicken (200g), garlic dip", price:150},
  {id:7, category:"Chicken Fry", name:"GT Fire Chicken", description:"Spicy & crispy chicken (300g), peri peri seasoning, garlic mayo, mint dip, fries (small)", price:220},
  {id:8, category:"Fries", name:"French Fries", description:"Crispy & salted", price:70},
  {id:9, category:"Fries", name:"GT Loaded Fries", description:"Fries, cheese sauce, garlic mayo, GT special sauce, peri peri seasoning, spring onion", price:99},
  {id:10, category:"Chowmein", name:"Chicken Chowmein", description:"Wok tossed chicken, fresh vegetables, signature sauces", price:160},
  {id:11, category:"Chowmein", name:"Egg Chowmein", description:"Egg, fresh vegetables, signature sauces", price:130},
  {id:12, category:"Rolls", name:"Double Egg Roll", description:"Double egg, onion, green chutney, signature sauce", price:50},
  {id:13, category:"Rolls", name:"GT Loaded Egg Roll", description:"Double egg, chicken, cheese, onion, capsicum, garlic mayo, GT special sauce", price:99},
  {id:14, category:"Sandwiches", name:"Chicken Sandwich", description:"Grilled chicken, lettuce, onion, tomato, garlic mayo, toasted bread", price:90},
  {id:15, category:"Sandwiches", name:"Chicken Cheese Sandwich", description:"Grilled chicken, cheese, garlic mayo, GT special sauce, toasted bread", price:120},
  {id:16, category:"Add-ons", name:"Add-on: Extra Cheese", description:"Add to your order", price:30},
  {id:17, category:"Add-ons", name:"Add-on: Extra Sauce", description:"Add to your order", price:30},
  {id:18, category:"Add-ons", name:"Add-on: Extra Chicken", description:"Add to your order", price:30},
  {id:19, category:"Add-ons", name:"Add-on: Extra Veggies", description:"Add to your order", price:30},
  {id:20, category:"Drinks", name:"Coca-Cola", description:"Cold drink", price:20},
  {id:21, category:"Drinks", name:"Pepsi", description:"Cold drink", price:20},
  {id:22, category:"Drinks", name:"Sprite", description:"Cold drink", price:20},
  {id:23, category:"Drinks", name:"Thums Up", description:"Cold drink", price:20},
  {id:24, category:"Drinks", name:"Water Bottle", description:"Packaged drinking water", price:20}
];

server.listen(PORT, () => console.log(`Grill Theory ordering running on port ${PORT}`));
