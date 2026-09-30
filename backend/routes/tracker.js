const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  addWebsite,
  listWebsites,
  runCheck,
  getDashboard,
  resolveDiagnostic,
} = require("../controllers/trackerController");

router.use(requireAuth); // every route below requires a logged-in user

router.post("/websites", addWebsite);
router.get("/websites", listWebsites);
router.post("/websites/:websiteId/check", runCheck);
router.get("/websites/:websiteId/dashboard", getDashboard);
router.patch("/citations/:citationId/resolve", resolveDiagnostic);

module.exports = router;
