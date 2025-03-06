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
    createdAt: v.optional(v.number()), // Make it optional to handle both cases
    messages: v.any(), // JSON OBJECT
    fileData: v.optional(v.any()),
    user: v.id("users"),
  }),
});
