import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means global system default category
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 60,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
      index: true,
    },
    color: {
      type: String,
      default: "#4F46E5",
      trim: true,
    },
    icon: {
      type: String,
      default: "tag",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user (allowing multiple users to have categories with same name)
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

export const Category = mongoose.model("Category", categorySchema);
export default Category;
