const orderSuccessEmail = (name, cartItems) => {
  const email = {
    body: {
      name,
      intro: "Your order has been placed successfully.",
      table: {
        data: cartItems.map((item) => {
          return {
            product: item.name,
            price: item.price,
            quantity: item.cartQuantity,
            total: item.price * cartQuantity,
          };
        }),
        columns: {
          customWidth: {
            product: "40%",
          },
        },
      },
      action: {
        instructions:
          "You can check the status of your order and more in your dashboard:",
        button: {
          color: "#3869D4", // Optional action button color
          text: "Go to Dashboard",
          link: "https://shopitoapp.vercel.app/",
        },
      },
      outro: "We thank you for your purchase"
    },
  };
  return email;
};

module.exports = {
  orderSuccessEmail,
};
