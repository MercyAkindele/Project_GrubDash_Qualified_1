const router = require("express").Router();
// import controller
const controller = require("./orders.controller");
//import method not allowed
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /orders routes needed to make the tests pass
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);
module.exports = router;
