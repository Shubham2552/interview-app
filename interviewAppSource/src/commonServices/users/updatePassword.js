const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = process.env;
/**
 * Updates the user's password.
 * @param {Object} user - The user instance (Sequelize model or similar) with an update method.
 * @param {string} newPassword - The new password to set.
 * @returns {Promise<void>}
 */
async function updatePassword(user, newPassword, SALT_ROUNDS) {
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(SALT_ROUNDS, 10));
    await user.update({ password: hashedPassword });
}

module.exports = {
    updatePassword
};