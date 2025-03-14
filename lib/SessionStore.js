// lib/SessionStore.js
/**
 * Store for active generation sessions
 * @type {Map<string, Object>}
 */
const activeSessions = new Map();

/**
 * Get a session by ID
 * @param {string} sessionId - The session ID
 * @returns {Object|undefined} Session data
 */
export function getSession(sessionId) {
  return activeSessions.get(sessionId);
}

/**
 * Create a new session
 * @param {string} sessionId - The session ID
 * @param {Object} data - Initial session data
 * @returns {Object} Created session data
 */
export function createSession(sessionId, data) {
  const session = {
    id: sessionId,
    status: "initializing",
    progress: 0,
    createdAt: Date.now(),
    ...data,
  };

  activeSessions.set(sessionId, session);
  return session;
}

/**
 * Update a session
 * @param {string} sessionId - The session ID
 * @param {Object} data - Updated session data
 * @returns {Object|undefined} Updated session data
 */
export function updateSession(sessionId, data) {
  const session = activeSessions.get(sessionId);
  if (!session) return undefined;

  const updatedSession = {
    ...session,
    ...data,
    updatedAt: Date.now(),
  };

  activeSessions.set(sessionId, updatedSession);
  return updatedSession;
}

/**
 * Delete a session
 * @param {string} sessionId - The session ID
 * @returns {boolean} Success status
 */
export function deleteSession(sessionId) {
  return activeSessions.delete(sessionId);
}

/**
 * Clean up old sessions (older than 2 hours)
 */
export function cleanupOldSessions() {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.createdAt < twoHoursAgo) {
      // Clean up the session
      if (session.agent && session.agent.cleanup) {
        try {
          session.agent.cleanup();
        } catch (error) {
          console.error(`Error cleaning up session ${sessionId}:`, error);
        }
      }

      activeSessions.delete(sessionId);
    }
  }
}

// Set up periodic cleanup
setInterval(cleanupOldSessions, 30 * 60 * 1000); // Run every 30 minutes
