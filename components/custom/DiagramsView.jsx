// components/custom/DiagramsView.jsx
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function DiagramsView({
  diagrams,
  streamingContent,
  isStreaming,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("class");
  const [extractedDiagrams, setExtractedDiagrams] = useState({
    classDiagram: null,
    sequenceDiagram: null,
    flowchartDiagram: null,
    entityRelationshipDiagram: null,
  });

  // Toggle expanded/collapsed state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Extract diagrams from streaming content
  useEffect(() => {
    if (streamingContent) {
      // Extract class diagram
      const classMatch = streamingContent.match(
        /```mermaid\s*\n([\s\S]*?classDiagram[\s\S]*?)```/i
      );
      if (classMatch && classMatch[1]) {
        setExtractedDiagrams((prev) => ({
          ...prev,
          classDiagram: classMatch[1].trim(),
        }));
      }

      // Extract sequence diagram
      const sequenceMatch = streamingContent.match(
        /```mermaid\s*\n([\s\S]*?sequenceDiagram[\s\S]*?)```/i
      );
      if (sequenceMatch && sequenceMatch[1]) {
        setExtractedDiagrams((prev) => ({
          ...prev,
          sequenceDiagram: sequenceMatch[1].trim(),
        }));
      }

      // Extract flowchart diagram
      const flowchartMatch = streamingContent.match(
        /```mermaid\s*\n([\s\S]*?flowchart[\s\S]*?)```/i
      );
      if (flowchartMatch && flowchartMatch[1]) {
        setExtractedDiagrams((prev) => ({
          ...prev,
          flowchartDiagram: flowchartMatch[1].trim(),
        }));
      }

      // Extract entity relationship diagram
      const erMatch = streamingContent.match(
        /```mermaid\s*\n([\s\S]*?erDiagram[\s\S]*?)```/i
      );
      if (erMatch && erMatch[1]) {
        setExtractedDiagrams((prev) => ({
          ...prev,
          entityRelationshipDiagram: erMatch[1].trim(),
        }));
      }
    }
  }, [streamingContent]);

  // Combine provided diagrams with extracted diagrams
  const combinedDiagrams = {
    ...(diagrams || {}),
    classDiagram: diagrams?.classDiagram || extractedDiagrams.classDiagram,
    sequenceDiagram:
      diagrams?.sequenceDiagram || extractedDiagrams.sequenceDiagram,
    flowchartDiagram:
      diagrams?.flowchartDiagram || extractedDiagrams.flowchartDiagram,
    entityRelationshipDiagram:
      diagrams?.entityRelationshipDiagram ||
      extractedDiagrams.entityRelationshipDiagram,
  };

  const hasClassDiagram =
    combinedDiagrams.classDiagram || combinedDiagrams.renderedClassDiagram;
  const hasSequenceDiagram =
    combinedDiagrams.sequenceDiagram ||
    combinedDiagrams.renderedSequenceDiagram;
  const hasFlowchartDiagram =
    combinedDiagrams.flowchartDiagram ||
    combinedDiagrams.renderedFlowchartDiagram;
  const hasERDiagram =
    combinedDiagrams.entityRelationshipDiagram ||
    combinedDiagrams.renderedEntityRelationshipDiagram;

  // Set default active tab based on available diagrams
  useEffect(() => {
    if (hasClassDiagram) setActiveTab("class");
    else if (hasSequenceDiagram) setActiveTab("sequence");
    else if (hasFlowchartDiagram) setActiveTab("flowchart");
    else if (hasERDiagram) setActiveTab("er");
  }, [hasClassDiagram, hasSequenceDiagram, hasFlowchartDiagram, hasERDiagram]);

  if (
    !hasClassDiagram &&
    !hasSequenceDiagram &&
    !hasFlowchartDiagram &&
    !hasERDiagram
  ) {
    if (isStreaming) {
      // Show placeholder when streaming but no diagrams detected yet
      return (
        <div className="diagrams-container bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">UML Diagrams</h2>
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
          <div className="text-center text-gray-500 py-8">
            <p>Generating diagrams...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="diagrams-container bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">UML Diagrams</h2>
          {isStreaming && (
            <div className="ml-3 flex space-x-1">
              <div className="animate-pulse h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
              <div className="animate-pulse h-1.5 w-1.5 bg-blue-500 rounded-full animation-delay-200"></div>
              <div className="animate-pulse h-1.5 w-1.5 bg-blue-500 rounded-full animation-delay-400"></div>
            </div>
          )}
        </div>
        <button
          onClick={toggleExpand}
          className="text-gray-500 hover:text-gray-700 focus:outline-none text-sm"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      {isExpanded && (
        <Tabs
          defaultValue={
            hasClassDiagram
              ? "class"
              : hasSequenceDiagram
                ? "sequence"
                : hasFlowchartDiagram
                  ? "flowchart"
                  : "er"
          }
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="mb-4">
            {hasClassDiagram && (
              <TabsTrigger value="class">Class Diagram</TabsTrigger>
            )}
            {hasSequenceDiagram && (
              <TabsTrigger value="sequence">Sequence Diagram</TabsTrigger>
            )}
            {hasFlowchartDiagram && (
              <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
            )}
            {hasERDiagram && <TabsTrigger value="er">ER Diagram</TabsTrigger>}
          </TabsList>

          {hasClassDiagram && (
            <TabsContent value="class" className="mt-2">
              <div className="diagram-container p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto">
                {combinedDiagrams.renderedClassDiagram ? (
                  <img
                    src={`data:${combinedDiagrams.renderedClassDiagram.contentType};base64,${combinedDiagrams.renderedClassDiagram.data}`}
                    alt="Class Diagram"
                    className="mx-auto"
                  />
                ) : (
                  <pre className="text-xs whitespace-pre-wrap overflow-auto p-4 bg-gray-100 rounded font-mono">
                    {combinedDiagrams.classDiagram}
                  </pre>
                )}
              </div>
            </TabsContent>
          )}

          {hasSequenceDiagram && (
            <TabsContent value="sequence" className="mt-2">
              <div className="diagram-container p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto">
                {combinedDiagrams.renderedSequenceDiagram ? (
                  <img
                    src={`data:${combinedDiagrams.renderedSequenceDiagram.contentType};base64,${combinedDiagrams.renderedSequenceDiagram.data}`}
                    alt="Sequence Diagram"
                    className="mx-auto"
                  />
                ) : (
                  <pre className="text-xs whitespace-pre-wrap overflow-auto p-4 bg-gray-100 rounded font-mono">
                    {combinedDiagrams.sequenceDiagram}
                  </pre>
                )}
              </div>
            </TabsContent>
          )}

          {hasFlowchartDiagram && (
            <TabsContent value="flowchart" className="mt-2">
              <div className="diagram-container p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto">
                {combinedDiagrams.renderedFlowchartDiagram ? (
                  <img
                    src={`data:${combinedDiagrams.renderedFlowchartDiagram.contentType};base64,${combinedDiagrams.renderedFlowchartDiagram.data}`}
                    alt="Flowchart Diagram"
                    className="mx-auto"
                  />
                ) : (
                  <pre className="text-xs whitespace-pre-wrap overflow-auto p-4 bg-gray-100 rounded font-mono">
                    {combinedDiagrams.flowchartDiagram}
                  </pre>
                )}
              </div>
            </TabsContent>
          )}

          {hasERDiagram && (
            <TabsContent value="er" className="mt-2">
              <div className="diagram-container p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto">
                {combinedDiagrams.renderedEntityRelationshipDiagram ? (
                  <img
                    src={`data:${combinedDiagrams.renderedEntityRelationshipDiagram.contentType};base64,${combinedDiagrams.renderedEntityRelationshipDiagram.data}`}
                    alt="Entity Relationship Diagram"
                    className="mx-auto"
                  />
                ) : (
                  <pre className="text-xs whitespace-pre-wrap overflow-auto p-4 bg-gray-100 rounded font-mono">
                    {combinedDiagrams.entityRelationshipDiagram}
                  </pre>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
