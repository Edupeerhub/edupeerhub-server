"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "is_deleted");

    await queryInterface.removeIndex("users", ["is_deleted"]).catch(() => {});

    // Ensure Postgres generates UUIDs (set default to gen_random_uuid)
    // await queryInterface.sequelize.query(`
    //   ALTER TABLE "users"
    //   ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
    // `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "is_deleted", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addIndex("users", ["is_deleted"]);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
    `);
  },
};
