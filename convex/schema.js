// convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
    token: v.optional(v.number()),
  }),
  workspace: defineTable({
    createdAt: v.optional(v.number()),
    messages: v.any(), // JSON OBJECT
    fileData: v.optional(v.any()),
    user: v.id("users"),
  }).index("by_user", ["user"]), // Added index for efficient filtering
});
