// src/routes/clientRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const permit = require("../middleware/roleMiddleware");
const clientController = require("../controllers/clientController");

router.use(auth);

router.post("/", permit("admin", "user"), clientController.createClient);
router.get("/", permit("admin", "user"), clientController.getClients);
router.get("/:id", permit("admin", "user"), clientController.getClient);
router.put("/:id", permit("admin", "user"), clientController.updateClient);
router.delete("/:id", permit("admin"), clientController.deleteClient); // only admin delete

module.exports = router;
