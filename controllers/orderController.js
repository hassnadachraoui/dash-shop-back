const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const { calculateTotalPrice, updateProductQuantity } = require("../utils");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/productModel");
const sendEmail = require("../utils/sendEmail");
const { orderSuccessEmail } = require("../emailTemplates/orderTemplate");

//Create new order
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderDate,
    orderTime,
    orderAmount,
    orderStatus,
    cartItems,
    shippingAddress,
    paymentMethod,
    coupon,
  } = req.body;

  // Validation :
  if (!cartItems || !orderStatus || !shippingAddress || !paymentMethod) {
    res.status(400);
    throw new Error("Order data missing !!!");
  }

  // Create Order
  await Order.create({
    user: req.user._id,
    orderDate,
    orderTime,
    orderAmount,
    orderStatus,
    cartItems,
    shippingAddress,
    paymentMethod,
    coupon,
  });

  //Update product quantity
  await updateProductQuantity(cartItems);

  //Send order Email to the user
  const subject = "New Order Placed - DashShop";
  const send_to = req.user.email;
  const template = orderSuccessEmail(req.user.name, cartItems);
  const reply_to = "no_reply@dashshop.com";

  await sendEmail(subject, send_to, template, reply_to);

  res.status(201).json({ messae: "Order Created" });
});

// Get Orders
const getOrders = asyncHandler(async (req, res) => {
  let orders;

  if (req.user.role === "admin") {
    orders = await Order.find().sort("-createdAt");
    return res.status(200).json(orders);
  }
  orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  return res.status(200).json(orders);
});

// Get Single Order
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (req.user.role === "admin") {
    return res.status(200).json(order);
  }
  // Match order to user
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized to view order");
  }
  res.status(200).json(order);
});

// Update Order Status
const updateOrderStatus = asyncHandler(async (req, res) => {
  console.log("Order ID:", req.params.id); // Vérification de l'ID ici

  const { orderStatus } = req.body;
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  //Update the order status
  await Order.findByIdAndUpdate(
    { _id: id },
    { orderStatus },
    { new: true, runValidators: true }
  );

  res.status(200).json({ message: "Order status updated" });
});

//Pay with Stripe
const payWithStripe = asyncHandler(async (req, res) => {
  const { items, shipping, description, coupon, paymentMethod } = req.body;

  const products = await Product.find();

  let orderAmount;
  orderAmount = calculateTotalPrice(products, items);

  if (!paymentMethod) {
    res.status(400);
    throw new Error("No payment method selected");
  }
  if (coupon !== null && coupon?.name !== "nil") {
    let totalAfterDiscount =
      orderAmount - (orderAmount * coupon.discount) / 100;
    orderAmount = totalAfterDiscount;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: orderAmount,
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
    description,
    shipping: {
      address: {
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        country: shipping.country,
        postal_code: shipping.postal_code,
      },
      name: shipping.name,
      phone: shipping.phone,
    },
    //receipt_email: customerEmail
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

//Verify FLW payment
const verifyFlwPayment = asyncHandler(async(req, res) => {
  res.send("Correct")
})

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  payWithStripe,
  verifyFlwPayment
};
