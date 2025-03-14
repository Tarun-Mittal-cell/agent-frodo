// convex/workspace.js
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
 * Get all workspaces for a user with pagination
 * This replaces the old GetAllWorkspace that was hitting limits
 */
export const GetAllWorkspace = query({
  args: {
    userId: v.id("users"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20; // Default page size

    // Create a query builder with the user filter and index
    const queryBuilder = ctx.db
      .query("workspace")
      .withIndex("by_user", (q) => q.eq("user", args.userId))
      .order("desc");

    // Apply pagination with cursor-based approach
    // The key issue: Convex expects 'numItems' in pagination options, not 'limit'
    const paginationOpts = { numItems: limit };
    if (args.cursor) {
      paginationOpts.cursor = args.cursor;
    }

    const paginatedResults = await queryBuilder.paginate(paginationOpts);

    return {
      workspaces: paginatedResults.page,
      continueCursor: paginatedResults.continueCursor,
    };
  },
});

/**
 * Get lightweight workspace previews (without large message content)
 * Use this for displaying lists of workspaces
 */
export const GetWorkspacePreviews = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Create a query builder that only gets minimal fields
    const queryBuilder = ctx.db
      .query("workspace")
      .withIndex("by_user", (q) => q.eq("user", args.userId))
      .order("desc");

    // Use field selection to avoid loading large message/file data
    const projection = queryBuilder.select(["_id", "createdAt"]);

    // Apply pagination - using numItems instead of limit
    const paginationOpts = { numItems: limit };
    if (args.cursor) {
      paginationOpts.cursor = args.cursor;
    }

    const paginatedResults = await projection.paginate(paginationOpts);

    return {
      workspaces: paginatedResults.page,
      continueCursor: paginatedResults.continueCursor,
    };
  },
});

/**
 * Get a count of workspaces for a user
 * Useful for UI displays without loading all workspace data
 */
export const CountWorkspaces = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const count = await ctx.db
      .query("workspace")
      .withIndex("by_user", (q) => q.eq("user", args.userId))
      .count();

    return count;
  },
});

/**
 * Delete a workspace
 */
export const DeleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspace"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.workspaceId);
    return { success: true };
  },
});
