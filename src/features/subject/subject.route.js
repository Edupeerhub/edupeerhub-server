const express = require("express");

const validate = require("@src/shared/middlewares/validate.middleware");

const { protectRoute } = require("@features/auth/auth.middleware");
const { Subject } = require("@models");
const { requireAdmin } = require("@features/admin/admin.middleware");
const sendResponse = require("@utils/sendResponse");

const router = express.Router();

router.use(protectRoute);

//get subjects
router.get("/", async (req, res) => {
  const admin = req.user.role === "admin";
  const query = {};

  if (admin) {
    query.where = {};
  } else {
    query.where = { isActive: true };
  }

  const subjects = await Subject.findAll({
    where: query,
  });

  sendResponse(res, 200, "success", subjects);
});

//add subject
router.post("/", requireAdmin, async (req, res) => {
  const newSubject = await Subject.create(req.body);
  sendResponse(res, 200, "success", newSubject);
});

//update subject
router.put("/:id", requireAdmin, async (req, res) => {
  const [, [updatedSubject]] = await Subject.update(req.body, {
    where: {
      id: req.params.id,
    },
    returning: true,
  });
  sendResponse(res, 200, "success", updatedSubject);
});

//delete subject

router.delete("/:id", requireAdmin, async (req, res) => {
  const deleteCount = await Subject.destroy({
    where: {
      id: req.params.id,
    },
  });

  if (deleteCount === 0) {
    sendResponse(res, 404, "Subject does not exist");
    return;
  }
  sendResponse(res, 200, "success");
});

module.exports = router;
