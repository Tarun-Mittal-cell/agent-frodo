import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new workspace for a user
 */
export const CreateWorkspace = mutation({
  args: {
    messages: v.any(),
    user: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      const workspaceId = await ctx.db.insert("workspace", {
        messages: args.messages,
        user: args.user,
        createdAt: Date.now(),
        fileData: [], // Initialize with empty file array
      });
      return workspaceId;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw new Error(`Failed to create workspace: ${error.message}`);
    }
  },
});

/**
 * Get a workspace by ID
 */
export const GetWorkspace = query({
  args: {
    workspaceId: v.id("workspace"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.workspaceId);
    return result;
  },
});

/**
 * Update messages for a workspace
 */
export const UpdateMessages = mutation({
  args: {
    workspaceId: v.id("workspace"),
    messages: v.any(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.workspaceId, {
      messages: args.messages,
    });
    return result;
  },
});

/**
 * Update files for a workspace
 */
export const UpdateFiles = mutation({
  args: {
    workspaceId: v.id("workspace"),
    files: v.optional(v.any()), // Make files optional
  },
  handler: async (ctx, args) => {
    // Check if files exist
    if (!args.files) {
      console.warn(`No files provided for workspace update`);
      return { success: false, message: "No files provided" };
    }

    const result = await ctx.db.patch(args.workspaceId, {
      fileData: args.files,
    });

    return result;
  },
});

/**
 * Get all workspaces for a user
 */
export const GetAllWorkspace = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("workspace")
      .filter((q) => q.eq(q.field("user"), args.userId))
      .order("desc")
      .collect();

    return result;
  },
});
