
const ApiError = require("../../shared/utils/apiError");
const { User, Student, Subject, Exam } = require("../../shared/database/models");

module.exports = {
    // get all
	async listStudents() {
		const students = await Student.findAll({
			include: [
				{ model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] },
				{ model: Subject, as: "subjects", attributes: ["id", "name"] },
				{ model: Exam, as: "exams", attributes: ["id", "name"] },
			],
		});

		return students.map((s) => {
			const plain = s.toJSON();
			return {
				id: plain.userId || plain.user_id,
				firstName: plain.user?.firstName || plain.user?.first_name,
				lastName: plain.user?.lastName || plain.user?.last_name,
				email: plain.user?.email,
				subjects: (plain.subjects || []).map((sub) => sub.name),
				exams: (plain.exams || []).map((ex) => ex.name),
			};
		});
	},
    // get one
	async getStudentById(id) {
		const student = await Student.findByPk(id, {
			include: [
				{ model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] },
				{ model: Subject, as: "subjects", attributes: ["id", "name"] },
				{ model: Exam, as: "exams", attributes: ["id", "name"] },
			],
		});
        if (!student) {
            return null;
        }
		const plain = student.toJSON();
		return {
				id: plain.userId || plain.user_id,
				firstName: plain.user?.firstName || plain.user?.first_name,
				lastName: plain.user?.lastName || plain.user?.last_name,
				email: plain.user?.email,
				subjects: (plain.subjects || []).map((sub) => sub.name),
				exams: (plain.exams || []).map((ex) => ex.name),
			};
	},
    // onboarding
	async createStudentForUser(userId, data) {
			if (!userId) {
				throw new ApiError("User id required", 400);
			}
			const payload = data || {};
			const existing = await Student.findByPk(userId);
			if (existing) {
				throw new ApiError("Student profile already exists", 409);
			}

			const user = await User.findByPk(userId);
			if (!user) {
				throw new ApiError("User not found", 404);
			}

			// normalize learningGoals to array of strings
			let goals = [];
			if (Array.isArray(payload.learningGoals)) {
				goals = payload.learningGoals.map((g) => (typeof g === "string" ? g : g.title));
			}

			const student = await Student.create({
				userId,
				gradeLevel: payload.gradeLevel,
				learningGoals: JSON.stringify(goals),
			});

			// mark user as onboarded
			try {
				await user.update({ isOnboarded: true });
			} catch (err) {
				// don't fail onboarding if updating user flag fails; log and continue
				console.error('Failed to set user.isOnboarded:', err.message || err);
			}

			if (payload.subjects) {
				await student.setSubjects(payload.subjects);
			}
			if (payload.exams) {
				await student.setExams(payload.exams);
			}

		return this.getStudentById(userId);
	},

		async getUserById(userId) {
			const user = await User.findByPk(userId, { attributes: ["id", "role", "firstName", "lastName", "email"] });
				if (!user) {
					return null;
				}
				return user.toJSON();
		},
    // update user
	async updateStudent(id, data) {
		const payload = data || {};
		const student = await Student.findByPk(id);
			if (!student) {
				throw new ApiError("Student not found", 404);
			}

			if (payload.gradeLevel) {
				student.gradeLevel = payload.gradeLevel;
			}
			if (payload.learningGoals) {
				const goals = Array.isArray(payload.learningGoals)
					? payload.learningGoals.map((g) => (typeof g === "string" ? g : g.title))
					: [];
				student.learningGoals = JSON.stringify(goals);
			}
			if (typeof payload.isOnboarded === "boolean") {
				student.isOnboarded = payload.isOnboarded;
			}

		await student.save();

		// ensure user is marked onboarded after profile update
		try {
			const userId = student.userId || student.id;
			const user = await User.findByPk(userId);
			if (user && !user.isOnboarded) {
				await user.update({ isOnboarded: true });
			}
		} catch (err) {
			console.error('Failed to set user.isOnboarded on update:', err.message || err);
		}

			if (payload.subjects) {
				await student.setSubjects(payload.subjects);
			}
			if (payload.exams) {
				await student.setExams(payload.exams);
			}

		return this.getStudentById(student.userId || student.id);
	},

	async deleteStudent(id) {
		const student = await Student.findByPk(id);
			if (!student) {
				throw new ApiError("Student not found", 404);
			}
			await student.setSubjects([]);
			await student.setExams([]);
			await student.destroy();
		return { id };
	}
};
