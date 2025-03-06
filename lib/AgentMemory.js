/**
 * AgentMemory.js
 * Manages the agent's memory, storing tasks, plans, code artifacts, and research results.
 * Provides a structured way to maintain context and history for decision-making.
 */

class AgentMemory {
  constructor(config = {}) {
    // Core memory stores
    this.tasks = new Map();
    this.plans = new Map();
    this.actions = [];
    this.results = new Map();
    this.reflections = [];
    this.artifacts = new Map();
    this.codeBase = new Map();
    this.research = new Map();
    this.projectContext = config.projectContext || {};
    
    // Vectorstore for semantic search (if enabled)
    this.useVectorStore = config.useVectorStore || false;
    this.vectorStore = config.vectorStore || null;
    
    // Configuration
    this.persistToDisk = config.persistToDisk || false;
    this.memoryPath = config.memoryPath || './agent-memory';
    
    // Initialize persistence if enabled
    if (this.persistToDisk) {
      this._initPersistence();
    }
  }

  /**
   * Initialize persistence mechanisms
   * @private
   */
  _initPersistence() {
    const fs = require('fs');
    const path = require('path');
    
    // Normalize memory path
    this.memoryPath = path.resolve(this.memoryPath);
    
    try {
      if (!fs.existsSync(this.memoryPath)) {
        fs.mkdirSync(this.memoryPath, { recursive: true });
      }
      
      // Create subdirectories for different types of memory
      const subdirs = [
        'tasks', 'plans', 'actions', 'results', 
        'reflections', 'artifacts', 'research', 'codebase'
      ];
      
      for (const dir of subdirs) {
        const subPath = path.resolve(this.memoryPath, dir);
        if (!fs.existsSync(subPath)) {
          fs.mkdirSync(subPath, { recursive: true });
        }
      }
    } catch (error) {
      console.error(`Failed to initialize memory persistence: ${error.message}`);
      throw new Error(`Memory initialization failed: ${error.message}`);
    }
  }

  /**
   * Add a new task to memory
   * @param {Object} task - Task object
   */
  addTask(task) {
    this.tasks.set(task.id, task);
    
    if (this.useVectorStore && this.vectorStore) {
      this.vectorStore.addDocument({
        id: `task-${task.id}`,
        text: `Task: ${task.description}`,
        metadata: { type: 'task', taskId: task.id }
      });
    }
    
    if (this.persistToDisk) {
      this._saveTaskToDisk(task);
    }
    
    return task.id;
  }

  /**
   * Update an existing task in memory
   * @param {Object} task - Updated task object
   */
  updateTask(task) {
    if (!this.tasks.has(task.id)) {
      throw new Error(`Task ${task.id} not found in memory`);
    }
    
    this.tasks.set(task.id, task);
    
    if (this.persistToDisk) {
      this._saveTaskToDisk(task);
    }
    
    return task;
  }

  /**
   * Get a task by ID
   * @param {string} taskId - Task ID
   * @returns {Object} - Task object
   */
  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * Store a plan in memory
   * @param {Object} plan - Plan object
   */
  storePlan(plan) {
    this.plans.set(plan.id, plan);
    
    if (this.useVectorStore && this.vectorStore) {
      this.vectorStore.addDocument({
        id: `plan-${plan.id}`,
        text: `Plan: ${plan.description}`,
        metadata: { type: 'plan', planId: plan.id, taskId: plan.taskId }
      });
    }
    
    if (this.persistToDisk) {
      this._savePlanToDisk(plan);
    }
    
    return plan.id;
  }

  /**
   * Update an existing plan in memory
   * @param {Object} plan - Updated plan object
   */
  updatePlan(plan) {
    if (!this.plans.has(plan.id)) {
      throw new Error(`Plan ${plan.id} not found in memory`);
    }
    
    this.plans.set(plan.id, plan);
    
    if (this.persistToDisk) {
      this._savePlanToDisk(plan);
    }
    
    return plan;
  }

  /**
   * Get a plan by ID
   * @param {string} planId - Plan ID
   * @returns {Object} - Plan object
   */
  getPlan(planId) {
    return this.plans.get(planId);
  }

  /**
   * Get the most recent plan for a task
   * @param {string} taskId - Task ID
   * @returns {Object} - Plan object
   */
  getLatestPlanForTask(taskId) {
    // Find all plans for the task
    const taskPlans = Array.from(this.plans.values())
      .filter(plan => plan.taskId === taskId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return taskPlans.length > 0 ? taskPlans[0] : null;
  }

  /**
   * Store an action result in memory
   * @param {Object} action - Action object
   * @param {Object} result - Result object
   */
  storeResult(action, result) {
    const resultId = `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const storedAction = {
      ...action,
      id: action.id || `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp
    };
    
    const storedResult = {
      id: resultId,
      actionId: storedAction.id,
      result,
      timestamp
    };
    
    this.actions.push(storedAction);
    this.results.set(storedResult.id, storedResult);
    
    if (this.useVectorStore && this.vectorStore) {
      this.vectorStore.addDocument({
        id: `action-${storedAction.id}`,
        text: `Action: ${JSON.stringify(storedAction)}`,
        metadata: { type: 'action', actionId: storedAction.id }
      });
      
      this.vectorStore.addDocument({
        id: `result-${resultId}`,
        text: `Result: ${JSON.stringify(result)}`,
        metadata: { type: 'result', resultId, actionId: storedAction.id }
      });
    }
    
    if (this.persistToDisk) {
      this._saveActionAndResultToDisk(storedAction, storedResult);
    }
    
    return resultId;
  }

  /**
   * Store reflection insights in memory
   * @param {Object} reflection - Reflection object
   */
  storeReflection(reflection) {
    const reflectionId = `reflection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const storedReflection = {
      ...reflection,
      id: reflectionId,
      timestamp
    };
    
    this.reflections.push(storedReflection);
    
    if (this.useVectorStore && this.vectorStore) {
      this.vectorStore.addDocument({
        id: `reflection-${reflectionId}`,
        text: `Reflection: ${JSON.stringify(reflection)}`,
        metadata: { type: 'reflection', reflectionId }
      });
    }
    
    if (this.persistToDisk) {
      this._saveReflectionToDisk(storedReflection);
    }
    
    return reflectionId;
  }

  /**
   * Store final reflection for a task
   * @param {string} taskId - Task ID
   * @param {Object} finalReflection - Final reflection object
   */
  storeFinalReflection(taskId, finalReflection) {
    const reflectionId = `final-reflection-${taskId}`;
    const timestamp = new Date().toISOString();
    
    const storedReflection = {
      ...finalReflection,
      id: reflectionId,
      taskId,
      isFinal: true,
      timestamp
    };
    
    this.reflections.push(storedReflection);
    
    if (this.useVectorStore && this.vectorStore) {
      this.vectorStore.addDocument({
        id: `finalReflection-${reflectionId}`,
        text: `Final Reflection: ${JSON.stringify(finalReflection)}`,
        metadata: { type: 'finalReflection', reflectionId, taskId }
      });
    }
    
    if (this.persistToDisk) {
      this._saveReflectionToDisk(storedReflection);
    }
    
    return reflectionId;
  }

  /**
   * Store a code artifact in memory
   * @param {Object} artifact - Artifact object
   */
  storeArtifact(artifact) {
    if (!artifact.id) {
      artifact.id = `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    if (!artifact.timestamp) {
      artifact.timestamp = new Date().toISOString();
    }
    
    this.artifacts.set(artifact.id, artifact);
    
    // If it's a code artifact, also update the codebase
    if (artifact.type === 'code') {
      this.codeBase.set(artifact.path, artifact);
    }
    
    if (this.useVectorStore && this.vectorStore) {
      this.vectorStore.addDocument({
        id: `artifact-${artifact.id}`,
        text: `Artifact: ${artifact.description || ''}\nContent: ${artifact.content || ''}`,
        metadata: { 
          type: 'artifact', 
          artifactId: artifact.id,
          artifactType: artifact.type,
          taskId: artifact.taskId
        }
      });
    }
    
    if (this.persistToDisk) {
      this._saveArtifactToDisk(artifact);
    }
    
    return artifact.id;
  }

  /**
   * Store research results in memory
   * @param {Object} researchResults - Research results object
   */
  storeResearchResults(researchResults) {
    if (!researchResults.id) {
      researchResults.id = `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    if (!researchResults.timestamp) {
      researchResults.timestamp = new Date().toISOString();
    }
    
    this.research.set(researchResults.id, researchResults);
    
    if (this.useVectorStore && this.vectorStore) {
      this.vectorStore.addDocument({
        id: `research-${researchResults.id}`,
        text: `Research: ${JSON.stringify(researchResults)}`,
        metadata: { 
          type: 'research', 
          researchId: researchResults.id,
          query: researchResults.query,
          taskId: researchResults.taskId
        }
      });
    }
    
    if (this.persistToDisk) {
      this._saveResearchToDisk(researchResults);
    }
    
    return researchResults.id;
  }

  /**
   * Get all artifacts for a specific task
   * @param {string} taskId - Task ID
   * @returns {Array} - Array of artifacts
   */
  getArtifactsForTask(taskId) {
    return Array.from(this.artifacts.values())
      .filter(artifact => artifact.taskId === taskId);
  }

  /**
   * Get project context
   * @returns {Object} - Project context object
   */
  getProjectContext() {
    return this.projectContext;
  }

  /**
   * Update project context
   * @param {Object} context - Updated context object
   */
  updateProjectContext(context) {
    this.projectContext = {
      ...this.projectContext,
      ...context
    };
    
    if (this.persistToDisk) {
      this._saveProjectContextToDisk();
    }
    
    return this.projectContext;
  }

  /**
   * Get recent actions and results
   * @param {number} limit - Number of recent actions to retrieve
   * @returns {Array} - Array of action-result pairs
   */
  getRecentHistory(limit = 10) {
    // Get the most recent actions
    const recentActions = this.actions
      .slice(-limit)
      .reverse();
    
    // For each action, find its result
    return recentActions.map(action => {
      const resultEntry = Array.from(this.results.values())
        .find(r => r.actionId === action.id);
      
      return {
        action,
        result: resultEntry ? resultEntry.result : null
      };
    });
  }

  /**
   * Perform a semantic search in memory
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   * @returns {Array} - Search results
   */
  semanticSearch(query, limit = 5) {
    if (!this.useVectorStore || !this.vectorStore) {
      throw new Error('Vector store is not enabled or configured');
    }
    
    return this.vectorStore.search(query, limit);
  }

  /**
   * Save task to disk
   * @private
   */
  _saveTaskToDisk(task) {
    if (!this.persistToDisk) return;
    
    const fs = require('fs');
    const path = require('path');
    const taskDir = path.join(this.memoryPath, 'tasks');
    
    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(taskDir, `${task.id}.json`),
      JSON.stringify(task, null, 2),
      'utf8'
    );
  }

  /**
   * Save plan to disk
   * @private
   */
  _savePlanToDisk(plan) {
    if (!this.persistToDisk) return;
    
    const fs = require('fs');
    const path = require('path');
    const planDir = path.join(this.memoryPath, 'plans');
    
    if (!fs.existsSync(planDir)) {
      fs.mkdirSync(planDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(planDir, `${plan.id}.json`),
      JSON.stringify(plan, null, 2),
      'utf8'
    );
  }

  /**
   * Save action and result to disk
   * @private
   */
  _saveActionAndResultToDisk(action, result) {
    if (!this.persistToDisk) return;
    
    const fs = require('fs');
    const path = require('path');
    const actionsDir = path.join(this.memoryPath, 'actions');
    const resultsDir = path.join(this.memoryPath, 'results');
    
    if (!fs.existsSync(actionsDir)) {
      fs.mkdirSync(actionsDir, { recursive: true });
    }
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(actionsDir, `${action.id}.json`),
      JSON.stringify(action, null, 2),
      'utf8'
    );
    
    fs.writeFileSync(
      path.join(resultsDir, `${result.id}.json`),
      JSON.stringify(result, null, 2),
      'utf8'
    );
  }

  /**
   * Save reflection to disk
   * @private
   */
  _saveReflectionToDisk(reflection) {
    if (!this.persistToDisk) return;
    
    const fs = require('fs');
    const path = require('path');
    const reflectionsDir = path.join(this.memoryPath, 'reflections');
    
    if (!fs.existsSync(reflectionsDir)) {
      fs.mkdirSync(reflectionsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reflectionsDir, `${reflection.id}.json`),
      JSON.stringify(reflection, null, 2),
      'utf8'
    );
  }

  /**
   * Save artifact to disk
   * @private
   */
  _saveArtifactToDisk(artifact) {
    if (!this.persistToDisk) return;
    
    const fs = require('fs');
    const path = require('path');
    const artifactsDir = path.join(this.memoryPath, 'artifacts');
    
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(artifactsDir, `${artifact.id}.json`),
      JSON.stringify(artifact, null, 2),
      'utf8'
    );
    
    // If it's a code artifact, also save it to the appropriate path
    if (artifact.type === 'code' && artifact.path && artifact.content) {
      const codeDir = path.join(this.memoryPath, 'codebase');
      const codePath = path.join(codeDir, artifact.path);
      const codeParentDir = path.dirname(codePath);
      
      if (!fs.existsSync(codeParentDir)) {
        fs.mkdirSync(codeParentDir, { recursive: true });
      }
      
      fs.writeFileSync(codePath, artifact.content, 'utf8');
    }
  }

  /**
   * Save research to disk
   * @private
   */
  _saveResearchToDisk(research) {
    if (!this.persistToDisk) return;
    
    const fs = require('fs');
    const path = require('path');
    const researchDir = path.join(this.memoryPath, 'research');
    
    if (!fs.existsSync(researchDir)) {
      fs.mkdirSync(researchDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(researchDir, `${research.id}.json`),
      JSON.stringify(research, null, 2),
      'utf8'
    );
  }

  /**
   * Save project context to disk
   * @private
   */
  _saveProjectContextToDisk() {
    if (!this.persistToDisk) return;
    
    const fs = require('fs');
    const path = require('path');
    const contextPath = path.join(this.memoryPath, 'project-context.json');
    
    fs.writeFileSync(
      contextPath,
      JSON.stringify(this.projectContext, null, 2),
      'utf8'
    );
  }
}

module.exports = AgentMemory;