"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { processGeneratedFiles, getMainFile } from "@/lib/codeUtils";
import {
  Info,
  Code,
  FileText,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Infer a language from file extension
 */
const getLanguageFromPath = (path) => {
  const extension = path.split(".").pop().toLowerCase();
  const langMap = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    md: "markdown",
  };
  return langMap[extension] || "javascript";
};

/**
 * Return a relevant icon for the file type
 */
const getFileIcon = (path) => {
  if (/\.(jsx|tsx)$/i.test(path)) return <Code className="h-4 w-4" />;
  if (/\.(css|scss|less)$/i.test(path)) return <FileText className="h-4 w-4" />;
  if (/\.(js|ts)$/i.test(path)) return <FileText className="h-4 w-4" />;
  if (/\.(html|htm)$/i.test(path)) return <Code className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

/**
 * CodePreview
 * - Renders a list of generated files
 * - Allows toggling between code or a simple HTML preview (if .html)
 */
const CodePreview = ({ files }) => {
  const [processedFiles, setProcessedFiles] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("code"); // 'code' or 'preview'

  useEffect(() => {
    if (files && Array.isArray(files)) {
      const processed = processGeneratedFiles(files);
      setProcessedFiles(processed);

      // Set the active file to the main file (or fallback to first)
      const mainFile = getMainFile(processed);
      setActiveFile(mainFile);
    }
  }, [files]);

  const handleCopyCode = () => {
    if (activeFile?.code) {
      navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "code" ? "preview" : "code"));
  };

  // If no files or no processed data, show loading
  if (!processedFiles || !activeFile) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Processing Generated Code
          </CardTitle>
          <CardDescription>
            Loading and preparing the code files...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="w-full h-full flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {getFileIcon(activeFile.path)}
              <span>{activeFile.path.split("/").pop()}</span>
              <Badge variant="outline">
                {getLanguageFromPath(activeFile.path)}
              </Badge>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleViewMode}
                className="px-2 flex items-center"
                title={
                  viewMode === "code" ? "Switch to preview" : "Switch to code"
                }
              >
                {viewMode === "code" ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="px-2 flex items-center"
                disabled={copied}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <CardDescription>
            {activeFile.description || "Generated code file"}
          </CardDescription>
        </CardHeader>

        <Tabs
          defaultValue="code"
          className="w-full flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 border-b flex-shrink-0">
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="files">
                All Files ({processedFiles.allFiles.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="flex-1 overflow-hidden p-0">
            <TabsContent
              value="code"
              className="h-full w-full m-0 flex flex-col overflow-hidden"
            >
              {viewMode === "code" ? (
                <div className="h-full w-full overflow-auto bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-slate-800 dark:text-slate-200 w-full max-w-full">
                    <code>
                      {activeFile.code || "// No code content available"}
                    </code>
                  </pre>
                </div>
              ) : (
                <div className="h-full w-full overflow-auto bg-white dark:bg-slate-800 p-4 rounded-md">
                  {activeFile.path.endsWith(".html") ? (
                    <div
                      className="preview-container w-full h-full"
                      dangerouslySetInnerHTML={{ __html: activeFile.code }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                      <Info className="h-5 w-5 mr-2" />
                      Preview not available for this file type
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="h-full m-0 overflow-auto p-4">
              {/* File category sections */}
              {[
                { title: "Components", files: processedFiles.components },
                { title: "Styles", files: processedFiles.styles },
                { title: "Scripts", files: processedFiles.scripts },
                { title: "HTML", files: processedFiles.html },
                { title: "Other Files", files: processedFiles.other },
              ].map(
                (section) =>
                  section.files.length > 0 && (
                    <div className="mb-4" key={section.title}>
                      <h3 className="text-sm font-medium mb-2">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.files.map((file, idx) => (
                          <Button
                            key={idx}
                            variant={
                              activeFile === file ? "secondary" : "ghost"
                            }
                            className="w-full justify-start text-sm py-1 h-auto"
                            onClick={() => setActiveFile(file)}
                          >
                            {getFileIcon(file.path)}
                            <span className="ml-2 truncate">
                              {file.path.split("/").pop()}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="text-sm text-gray-500 pt-2 pb-4 px-6 flex-shrink-0">
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-1" />
            <span className="truncate">Path: {activeFile.path}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CodePreview;
