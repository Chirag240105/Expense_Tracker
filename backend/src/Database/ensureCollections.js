import mongoose from "mongoose";
import {
  User,
  Category,
  Transaction,
  Budget,
  Goal,
  RecurringRule,
  AuditLog,
  Notification,
  RefreshToken,
} from "../models/index.js";

const models = [
  User,
  Category,
  Transaction,
  Budget,
  Goal,
  RecurringRule,
  AuditLog,
  Notification,
  RefreshToken,
];

const bsonTypes = {
  String: "string",
  Number: ["double", "int", "long", "decimal"],
  Decimal128: "decimal",
  Boolean: "bool",
  Date: "date",
  ObjectId: "objectId",
  Array: "array",
  Embedded: "object",
  Map: "object",
};

function schemaValidator(schema) {
  const properties = {};
  for (const [name, path] of Object.entries(schema.paths)) {
    if (name.includes(".") || name === "_id" || !bsonTypes[path.instance]) continue;
    const bsonType = bsonTypes[path.instance];
    const property = {
      bsonType: path.options.default === null
        ? Array.isArray(bsonType) ? [...bsonType, "null"] : [bsonType, "null"]
        : bsonType,
    };
    if (path.enumValues?.length) property.enum = path.enumValues;
    properties[name] = property;
  }

  const required = schema.requiredPaths().filter(
    (name) => !name.includes(".") && name !== "_id" && properties[name]
  );
  return {
    $jsonSchema: {
      bsonType: "object",
      ...(required.length ? { required } : {}),
      properties,
    },
  };
}

export async function ensureCollectionsAndValidators() {
  const db = mongoose.connection.db;
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name));
  const configured = new Map(
    models.map((model) => [model.collection.collectionName, schemaValidator(model.schema)])
  );
  configured.set("monthly_summaries", {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "year", "month", "totalIncome", "totalExpense"],
      properties: {
        userId: { bsonType: "objectId" },
        year: { bsonType: ["int", "long"] },
        month: { bsonType: ["int", "long"] },
        totalIncome: { bsonType: ["double", "int", "long", "decimal"] },
        totalExpense: { bsonType: ["double", "int", "long", "decimal"] },
      },
    },
  });

  for (const [name, validator] of configured) {
    if (!existing.has(name)) {
      await db.createCollection(name, {
        validator,
        validationLevel: "strict",
        validationAction: "error",
      });
    } else {
      await db.command({
        collMod: name,
        validator,
        validationLevel: "strict",
        validationAction: "error",
      });
    }
  }
}
