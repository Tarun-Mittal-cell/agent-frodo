// lib/UMLGenerator.js
const { Server } = require("socket.io");
const chokidar = require("chokidar");
const { Project } = require("ts-morph");
const path = require("path");

// Helper function to generate PlantUML syntax from UML data
function generatePlantUML(umlData) {
  let plantUML = "@startuml\n";
  
  // Add classes
  umlData.classes.forEach((cls) => {
    plantUML += `class ${cls.name} {\n`;
    cls.methods.forEach((method) => {
      plantUML += `  ${method}\n`;
    });
    plantUML += "}\n";
  });

  // Add relationships (e.g., inheritance)
  umlData.relationships.forEach((rel) => {
    plantUML += `${rel.from} --> ${rel.to}\n`;
  });

  plantUML += "@enduml";
  return plantUML;
}

class UMLGenerator {
  constructor(server, codeDir) {
    // Initialize WebSocket server
    this.io = new Server(server, { cors: { origin: "*" } });
    this.codeDir = codeDir;

    // Set up TypeScript project for parsing code
    this.project = new Project({
      tsConfigFilePath: path.join(codeDir, "tsconfig.json"),
    });

    // Watch for file changes in the code directory
    this.watcher = chokidar.watch(codeDir, {
      ignored: /(^|[/\\])\../, // Ignore dotfiles
      persistent: true,
    });

    // Handle WebSocket connections
    this.io.on("connection", (socket) => {
      console.log("Client connected for UML streaming");
      socket.on("disconnect", () => console.log("Client disconnected"));
      // Send initial UML diagram to newly connected client
      this.updateUML();
    });

    // Update UML when files change
    this.watcher.on("change", (filePath) => {
      console.log(`File changed: ${filePath}`);
      this.updateUML();
    });

    // Generate initial UML diagram
    this.updateUML();
  }

  async updateUML() {
    try {
      // Reload the project to reflect the latest code changes
      this.project = new Project({
        tsConfigFilePath: path.join(this.codeDir, "tsconfig.json"),
      });
      const sourceFiles = this.project.getSourceFiles();

      // Extract UML data from source files
      const umlData = this.extractUMLData(sourceFiles);

      // Generate PlantUML syntax
      const plantUML = generatePlantUML(umlData);

      // Stream the updated diagram to all connected clients
      this.io.emit("uml_update", plantUML);
    } catch (error) {
      console.error("Error updating UML:", error.message);
      this.io.emit("error", { message: "Failed to update UML diagram" });
    }
  }

  extractUMLData(sourceFiles) {
    const classes = [];
    const relationships = [];

    sourceFiles.forEach((sourceFile) => {
      // Get all class declarations
      const classDeclarations = sourceFile.getClasses();
      classDeclarations.forEach((cls) => {
        const className = cls.getName() || "UnnamedClass";
        const methods = cls.getMethods().map((method) => {
          const params = method
            .getParameters()
            .map((p) => `${p.getName()}: ${p.getType().getText()}`);
          return `${method.getName()}(${params.join(", ")}): ${method
            .getReturnType()
            .getText()}`;
        });

        classes.push({ name: className, methods });

        // Check for inheritance relationships
        const baseClass = cls.getBaseClass();
        if (baseClass) {
          relationships.push({
            from: className,
            to: baseClass.getName(),
          });
        }
      });
    });

    return { classes, relationships };
  }
}

module.exports = UMLGenerator;
