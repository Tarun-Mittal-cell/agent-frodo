import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Creates a new user if one doesn’t exist for the given email.
 * @returns {Promise<string|null>} The ID of the created user, or null if the user already exists.
 */
export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    if (existingUsers.length > 0) {
      return null;
    }

    try {
      const userId = await ctx.db.insert("users", {
        name: args.name,
        picture: args.picture,
        email: args.email,
        uid: args.uid,
        token: 50000,
      });
      return userId;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },
});

/**
 * Retrieves a user by their email.
 * @returns {Promise<object|null>} The user object, or null if no user is found.
 */
export const GetUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    if (users.length === 0) {
      return null;
    }

    return users[0];
  },
});

/**
 * Updates a user’s token value by their ID.
 * @returns {Promise<string>} The updated user’s ID.
 */
export const UpdateToken = mutation({
  args: {
    token: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    try {
      await ctx.db.patch(args.userId, { token: args.token });
      return args.userId;
    } catch (error) {
      throw new Error(`Failed to update token: ${error.message}`);
    }
  },
});

/**
 * Retrieves a user by their UID (Google sub).
 * @returns {Promise<object|null>} The user object, or null if no user is found.
 */
export const GetUserByUid = query({
  args: {
    uid: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("uid"), args.uid))
      .collect();

    if (users.length === 0) {
      return null;
    }

    return users[0];
  },
});
