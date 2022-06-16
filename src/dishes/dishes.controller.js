const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
// Import notfound error handler ~Mercy
const notFound = require("../errors/notFound");
// Import badRequest
const badRequest = require("../errors/badRequest");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}
// Validation code for list and update! When given a dish id, are there any dishes that have that Id ~Mercy
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  res.locals.foundDish = foundDish;
  if (res.locals.foundDish) {
    return next();
  } else {
    return notFound(req, res, next);
  }
}

function read(req, res) {
//   const dishId = req.params.dishId;
//   const foundDish = dishes.find((dish) => dish.id === dishId);
  res.json({ data: res.locals.foundDish });
}

/* Validation code for create and update! When given a potential dish, 
does it have all the categories to actually make it a dish ~Mercy*/
function validationCodeForCreate(req, res, next) {
  const { data: { name, description, image_url, price } = {} } = req.body;

  let errorMessage;

  if (!name) {
    errorMessage = "Dish must include a name";
  } else if (!description) {
    errorMessage = "Dish must include a description";
  } else if (!image_url) {
    errorMessage = "Dish must include a image_url";
  } else if (!price) {
    errorMessage = "Dish must include a price";
  } else if (Number(price) <= 0) {
    errorMessage = "Dish must have a price that is an integer greater than 0";
  } else if (price !== Number(price)) {
    errorMessage = "Dish must have a price that is an integer greater than 0";
  }

  if (errorMessage) {
    return badRequest(errorMessage, req, res, next);
  } else {
    return next();
  }
}
/* Since the potential dish has passed all the test of being a dish,  
create the dish using the potential dish information, and add that dish
to the list of dishes. ~Mercy */
function create(req, res) {
  const { data: { name, description, image_url, price } = {} } = req.body;
  const newestDishMember = {
    id: nextId(),
    name,
    description,
    image_url,
    price,
  };
  dishes.push(newestDishMember);
  res.status(201).json({ data: newestDishMember });
}
/* More validation code for update! ~Mercy*/
function validationForUpdate(req, res, next) {
  const dishId = req.params.dishId;
  const idFromTheBody = req.body.data.id;
  if (idFromTheBody) {
    if (dishId === idFromTheBody) {
      return next();
    } else {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${idFromTheBody}, Route: ${dishId}`,
      });
    }
  }
  return next();
}

function update(req, res) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { name, description, image_url, price } = {} } = req.body;
  foundDish.name = name;
  foundDish.description = description;
  foundDish.image_url = image_url;
  foundDish.price = price;
  res.json({ data: foundDish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [validationCodeForCreate, create],
  update: [dishExists, validationCodeForCreate, validationForUpdate, update],
};
