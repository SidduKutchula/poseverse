export default function softDeletePlugin(schema) {
  // Add soft-delete flag and timestamp columns
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  });

  // Query middleware to filter out soft-deleted items
  const excludeDeleted = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
  };

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);
  schema.pre("findOneAndUpdate", excludeDeleted);
  schema.pre("updateMany", excludeDeleted);

  // Reusable document instance method
  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };
}
