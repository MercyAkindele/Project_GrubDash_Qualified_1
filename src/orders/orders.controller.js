const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
// Import notfound error handler ~Mercy
const notFound = require("../errors/notFound");
// Import badRequest to use whenever you have a status 400. ~Mercy
const badRequest = require("../errors/badRequest");

// Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({
    data: orders,
  });
}

/* Validation code for create and update! When given a potential order, 
does it have all the categories to actually make it an order ~Mercy*/
function validationCodeForCreate(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  let errorMessage;

  if (!deliverTo) {
    errorMessage = "Order must include a deliverTo";
  } else if (!mobileNumber) {
    errorMessage = "Order must include a mobileNumber";
  } else if (!dishes) {
    errorMessage = "Order must include a dish";
  } else if (!Array.isArray(dishes)) {
    errorMessage = "Order must include at least one dish";
  } else if (dishes.length === 0) {
    errorMessage = "Order must include at least one dish";
  }

  // If dished is an array, validate each dish in the array ~Mercy
  if (dishes && Array.isArray(dishes)) {
    dishes.forEach((dish, index) => {
      if (!dish.quantity) {
        errorMessage = `Dish ${index} must have a quantity that is an integer greater than 0`;
      } else if (Number(dish.quantity) <= 0) {
        errorMessage = `Dish ${index} must have a quantity that is an integer greater than 0`;
      } else if (dish.quantity !== Number(dish.quantity)) {
        errorMessage = `Dish ${index} must have a quantity that is an integer greater than 0`;
      }
    });
  }

  if (errorMessage) {
    return badRequest(errorMessage, req, res, next);
  } else {
    return next();
  }
}
/* Since the potential order has passed all the test of being an order,  
create the order using the potential order information, and add that order
to the list of orders. ~Mercy */
function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newestOrderMember = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
  };
  orders.push(newestOrderMember);
  res.status(201).json({ data: newestOrderMember });
}

/* Validation code for list, update, read and delete! 
When given an order id, are there any orders that actually have that Id ~Mercy*/
function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  res.locals.foundOrder = foundOrder

  if (foundOrder) {
    return next();
  } else {
    return notFound(req, res, next);
  }
}

function read(req, res) {
//   const orderId = req.params.orderId;
//   const foundOrder = orders.find((order) => order.id === orderId);

//   res.json({ data: foundOrder });

    res.json({ data: res.locals.foundOrder });
}

/* More validation code for update! ~Mercy*/
function validationForUpdate(req, res, next) {
  const orderId = req.params.orderId;
  const idFromTheBody = req.body.data.id;
//   const foundOrder = orders.find((order) => order.id === orderId);
  const { data: { status } = {} } = req.body;

  let errorMessage;

  if (idFromTheBody && orderId !== idFromTheBody) {
    errorMessage = `Order id does not match route id. Order: ${idFromTheBody}, Route: ${orderId}.`;
  } else if (!status) {
    errorMessage = `Order must have a status of pending, preparing, out-for-delivery, delivered`;
  } else if (status.length === 0) {
    errorMessage = `Order must have a status of pending, preparing, out-for-delivery, delivered`;
  } else if (
    status !== "pending" &&
    status !== "preparing" &&
    status !== "out-for-delivery" &&
    status !== "delivered"
  ) {
    errorMessage = `Order must have a status of pending, preparing, out-for-delivery, delivered`;
  } else if (res.locals.foundOrder.status === "delivered") {
    errorMessage = `A delivered order cannot be changed`;
  }

  if (errorMessage) {
    return badRequest(errorMessage, req, res, next);
  } else {
    return next();
  }
}

function update(req, res) {
  const orderId = req.params.orderId;
//   const foundOrder = orders.find((order) => order.id === orderId);

  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  res.locals.foundOrder.deliverTo = deliverTo;
  res.locals.foundOrder.mobileNumber = mobileNumber;
  res.locals.foundOrder.dishes = dishes;
  res.json({ data: res.locals.foundOrder });
}
// Validation for destroy! Do not delete an order unless it is pending! ~Mercy
function isTheStatusPending(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder.status === "pending") {
    return next();
  } else {
    return badRequest(
      `An order cannot be deleted unless it is pending`,
      req,
      res,
      next
    );
  }
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [validationCodeForCreate, create],
  read: [orderExists, read],
  update: [orderExists, validationCodeForCreate, validationForUpdate, update],
  delete: [orderExists, isTheStatusPending, destroy],
};
