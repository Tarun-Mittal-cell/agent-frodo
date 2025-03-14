// components/WorkspaceList.jsx
import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function WorkspaceList({ userId }) {
  // Get workspace previews with pagination
  const { results, status, loadMore, hasMore } = usePaginatedQuery(
    api.workspace.GetWorkspacePreviews,
    { userId }
  );

  if (status === "loading" && !results) {
    return <div>Loading workspaces...</div>;
  }

  return (
    <div>
      <h2>Your Workspaces</h2>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {results?.workspaces.map((workspace) => (
          <div
            key={workspace._id}
            className="p-4 border rounded-lg"
            onClick={() => handleWorkspaceClick(workspace._id)}
          >
            <div>Workspace {workspace._id}</div>
            <div>
              Created: {new Date(workspace.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={status === "loading"}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {status === "loading" ? "Loading..." : "Load More Workspaces"}
        </button>
      )}
    </div>
  );
}
