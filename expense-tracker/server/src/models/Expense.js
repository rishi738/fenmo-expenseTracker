import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Expense = sequelize.define(
  "Expense",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    requestId: {
      field: "request_id",
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR"
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    pinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      field: "created_at",
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "expenses",
    indexes: [
      { unique: true, fields: ["request_id"] },
      { fields: ["category"] },
      { fields: ["date"] }
    ]
  }
);
