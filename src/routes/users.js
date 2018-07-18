const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/users/signup", userController.signup);
router.post("/users/create", validation.validateUsers, userController.create);
router.get("/users/login", userController.loginForm);
router.post("/users/login", userController.login);
router.get("/users/logout", userController.logout);
router.get("/users/upgradeform", userController.upgradeForm);
router.post("/users/upgrade", userController.upgrade);
router.get("/users/downgradeform", userController.downgradeForm);
router.post("/users/downgrade", userController.downgrade);

module.exports = router;