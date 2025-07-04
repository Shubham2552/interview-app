module.exports = (sequelize, DataTypes) => {
    const Interview = sequelize.define('Interview', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        tableName: 'interviews',
        timestamps: true
    });

    return Interview;
};