const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderDate: {
      type: String,
      required: [true, "Please add an order date"],
      trim: true,
    },
    orderTime: {
      type: String,
      required: [true, "Please add and order date"],
      trim: true,
    },
    orderAmount: {
      type: Number,
      required: [true, "Please add and order amount"],
      rim: true,
    },
    orderStatus: {
      type: String,
      required: [true, "Please add and order status"],
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    cartItems: {
      //type: String,
      type: [Object],
      required: [true],
    },
    shippingAddress: {
      type: Object,
      //type: String,
      required: true,
    },
    coupon: {
      type: Object,
      required: true,
      default: {
        name: "nil",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
