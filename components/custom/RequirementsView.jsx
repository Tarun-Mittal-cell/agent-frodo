// components/custom/RequirementsView.jsx
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function RequirementsView({ requirements, streamingData = {} }) {
  const [activeTab, setActiveTab] = useState("functional");
  const [isExpanded, setIsExpanded] = useState(true);

  // Extract streaming data for requirements
  const extractionStream = Object.values(streamingData).find(
    (stream) => stream.type === "requirements_extraction"
  );

  // Get requirements with any streaming updates
  const getRequirements = () => {
    // If we have complete requirements, use those
    if (requirements) {
      return requirements;
    }

    // Otherwise, try to use streaming data
    if (extractionStream?.currentData?.requirements) {
      return extractionStream.currentData.requirements;
    }

    // Fallback empty structure
    return {
      functional: [],
      nonFunctional: [],
      userStories: [],
      constraints: [],
    };
  };

  const currentRequirements = getRequirements();

  // Determine if we should show streaming indicators
  const isStreaming =
    extractionStream &&
    extractionStream.status === "processing" &&
    !requirements;

  // Toggle expanded/collapsed state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!currentRequirements) {
    return null;
  }

  return (
    <div className="requirements-container bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Requirements Analysis</h2>

        <div className="flex items-center gap-4">
          {isStreaming && (
            <span className="text-xs flex items-center text-blue-600">
              <span className="relative h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Analyzing...
            </span>
          )}

          <button
            onClick={toggleExpand}
            className="text-gray-500 hover:text-gray-700 focus:outline-none text-sm"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <Tabs
          defaultValue="functional"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="functional">
              Functional
              {currentRequirements.functional.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                  {currentRequirements.functional.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="nonFunctional">
              Non-Functional
              {currentRequirements.nonFunctional.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                  {currentRequirements.nonFunctional.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="userStories">
              User Stories
              {currentRequirements.userStories.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                  {currentRequirements.userStories.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="constraints">
              Constraints
              {currentRequirements.constraints.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                  {currentRequirements.constraints.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="functional" className="mt-2">
            {currentRequirements.functional.length > 0 ? (
              <ul className="space-y-3">
                {currentRequirements.functional.map((req) => (
                  <RequirementItem
                    key={req.id}
                    requirement={req}
                    type="functional"
                  />
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isStreaming
                  ? "Extracting functional requirements..."
                  : "No functional requirements found"}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nonFunctional" className="mt-2">
            {currentRequirements.nonFunctional.length > 0 ? (
              <ul className="space-y-3">
                {currentRequirements.nonFunctional.map((req) => (
                  <RequirementItem
                    key={req.id}
                    requirement={req}
                    type="nonFunctional"
                  />
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isStreaming
                  ? "Extracting non-functional requirements..."
                  : "No non-functional requirements found"}
              </div>
            )}
          </TabsContent>

          <TabsContent value="userStories" className="mt-2">
            {currentRequirements.userStories.length > 0 ? (
              <ul className="space-y-3">
                {currentRequirements.userStories.map((story) => (
                  <UserStoryItem key={story.id} story={story} />
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isStreaming
                  ? "Extracting user stories..."
                  : "No user stories found"}
              </div>
            )}
          </TabsContent>

          <TabsContent value="constraints" className="mt-2">
            {currentRequirements.constraints.length > 0 ? (
              <ul className="space-y-3">
                {currentRequirements.constraints.map((constraint) => (
                  <RequirementItem
                    key={constraint.id}
                    requirement={constraint}
                    type="constraint"
                  />
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isStreaming
                  ? "Extracting constraints..."
                  : "No constraints found"}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function RequirementItem({ requirement, type }) {
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "functional":
        return "bg-blue-50 text-blue-700";
      case "nonFunctional":
        return "bg-green-50 text-green-700";
      case "constraint":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <li className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getTypeClass(type)}`}
          >
            {requirement.id}
          </span>

          {requirement.priority && (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getPriorityClass(requirement.priority)}`}
            >
              {requirement.priority}
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-800">{requirement.statement}</p>

      {requirement.rationale && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Rationale:</span>{" "}
          {requirement.rationale}
        </p>
      )}
    </li>
  );
}

function UserStoryItem({ story }) {
  return (
    <li className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700">
          {story.id}
        </span>

        {story.priority && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {story.priority}
          </span>
        )}
      </div>

      <p className="text-gray-800">{story.statement}</p>

      {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            Acceptance Criteria:
          </h4>
          <ul className="pl-5 text-sm text-gray-600 list-disc">
            {story.acceptanceCriteria.map((criteria, index) => (
              <li key={index}>{criteria}</li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
