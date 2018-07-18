const express = require("express");
const router = express.Router();
const wikiController = require("../controllers/wikiController")
const validation = require("./validation");

router.get("/wikis", wikiController.index);
router.get("/wikis/mywikis", wikiController.myWikis);
router.get("/wikis/new", wikiController.new);
router.post("/wikis/create", validation.validateWikis, wikiController.create);
router.get("/wikis/sharedwikis", wikiController.sharedWikis);

router.get("/wikis/:id", wikiController.show);
router.post("/wikis/:id/destroy", wikiController.destroy);
router.get("/wikis/:id/edit", wikiController.edit);
router.post("/wikis/:id/update", validation.validateWikis, wikiController.update);
router.post("/wikis/:id/setprivate", wikiController.setPrivate);
router.post("/wikis/:id/setpublic", wikiController.setPublic);
router.post("/wikis/:id/share", wikiController.share);

module.exports = router;