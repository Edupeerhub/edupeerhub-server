require("dotenv").config();
require("module-alias/register");

const { addStreamUser } = require("../../features/auth/auth.service");
const { User } = require("@models");
const sequelize = require("@src/shared/database/index");

const syncAllUsersToStream = async () => {
  try {
    console.log("Starting Stream user sync...");

    const users = await User.findAll();
    console.log(`Found ${users.length} users to sync`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await addStreamUser({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          email: user.email,
          role: user.role,
        });

        successCount++;
        console.log(
          `✓ Synced user ${successCount}/${users.length}: ${user.firstName} ${user.lastName}`
        );
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to sync user ${user.id}:`, error.message);
      }
    }

    console.log("\n=== Sync Complete ===");
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total: ${users.length}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
};

syncAllUsersToStream();
