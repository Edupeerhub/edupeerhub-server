const express = require("express");
const { protectRoute } = require("@features/auth/auth.middleware");
const { Exam } = require("@models");
const { requireAdmin } = require("@features/admin/admin.middleware");
const sendResponse = require("@utils/sendResponse");

const router = express.Router();

router.use(protectRoute);

//get exams
router.get("/", async (req, res) => {
  const query = {};
  const userOrTutor = req.user.role === "tutor" || req.user.role === "student";

  if (userOrTutor) {
    query.where = {
      isActive: true,
    };
  }
  const exams = await Exam.findAll({
    where: query,
  });

  sendResponse(res, 200, "success", exams);
});

//add Exam
router.post("/", requireAdmin, async (req, res) => {
  const newExam = await Exam.create(req.body);
  sendResponse(res, 200, "success", newExam);
});

//update Exam
router.put("/:id", requireAdmin, async (req, res) => {
  const [, [updatedExam]] = await Exam.update(req.body, {
    where: {
      id: req.params.id,
    },
    returning: true,
  });
  sendResponse(res, 200, "success", updatedExam);
});

//delete Exam

router.delete("/:id", requireAdmin, async (req, res) => {
  const deleteCount = await Exam.destroy({
    where: {
      id: req.params.id,
    },
  });

  if (deleteCount === 0) {
    sendResponse(res, 404, "Exam does not exist");
    return;
  }
  sendResponse(res, 200, "success");
});

module.exports = router;
