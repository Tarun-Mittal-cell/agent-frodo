/**
 * PlanningModule.js
 * Responsible for creating, managing and revising plans for the autonomous agent.
 * Uses LLM to decompose tasks into actionable steps and determine execution order.
 */

const Plan = require("./Plan");

class PlanningModule {
  constructor(llmService) {
    this.llm = llmService;
  }

  /**
   * Set or update the LLM service
   * @param {Object} llmService - LLM service
   */
  setLLM(llmService) {
    this.llm = llmService;
  }

  /**
   * Extract JSON from a string response or return null if not found
   * @private
   */
  _extractJsonFromString(str) {
    try {
      // Try direct parsing first
      return JSON.parse(str);
    } catch (e) {
      try {
        // Look for JSON object pattern - try multiple strategies

        // Strategy 1: Find content between first { and last }
        const firstBrace = str.indexOf("{");
        const lastBrace = str.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
          const jsonSubstring = str.substring(firstBrace, lastBrace + 1);
          try {
            return JSON.parse(jsonSubstring);
          } catch (e2) {
            // Continue to next strategy
          }
        }

        // Strategy 2: Look for triple backticks with json
        const jsonBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
          try {
            return JSON.parse(jsonBlockMatch[1]);
          } catch (e3) {
            // Continue to next strategy
          }
        }

        // Strategy 3: Regex to find a JSON-like structure
        const jsonMatch = str.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e4) {
            // No more strategies, will return null
          }
        }
      } catch (e5) {
        // Ignore errors in extraction strategies
      }
    }
    // If all strategies fail, return null
    return null;
  }

  /**
   * Helper method to parse JSON responses robustly.
   * Handles various response formats from LLMs, returning a reasonable object even if parsing fails.
   * @param {string|object} response
   * @param {object} defaultValue Object to return if parsing fails
   * @returns {object} parsed JSON object or fallback value
   */
  _parseJsonResponse(response, defaultValue = null) {
    // If it's already an object, return it
    if (typeof response === "object" && response !== null) return response;

    // If it's a string, try to extract JSON
    if (typeof response === "string") {
      const extracted = this._extractJsonFromString(response);
      if (extracted) return extracted;

      // If extraction failed and we have a default value, return that
      if (defaultValue) return defaultValue;

      // Otherwise, create a basic object with the response text
      return {
        text: response.substring(0, 500),
        extractionFailed: true,
      };
    }

    // If it's neither an object nor a string, return the default or an error object
    return defaultValue || { error: "Unsupported response type" };
  }

  /**
   * Create an initial plan for a task
   * @param {Object} task - Task object
   * @returns {Object} - Plan object
   */
  async createInitialPlan(task) {
    if (!this.llm) {
      throw new Error("LLM service not configured for planning module");
    }

    // Generate a detailed plan with subtasks
    const planningPrompt = `
    You are an expert frontend application developer creating a detailed, step-by-step plan.
    
    TASK DESCRIPTION:
    ${task.description}
    
    REQUIREMENTS:
    ${task.requirements || "No specific requirements provided."}
    
    Create a comprehensive, detailed plan to complete this frontend development task.
    Each step should be clear, actionable, and describe a single unit of work.
    Include necessary research steps when you need to gather information.
    
    Your response MUST be a valid JSON object with the following structure:
    {
      "title": "Brief title of the plan",
      "description": "Detailed description of what we're building",
      "steps": [
        {
          "id": "step-1",
          "title": "Step title",
          "description": "Detailed description of the step",
          "type": "research|architecture|implementation|testing|deployment",
          "dependencies": [],
          "estimatedComplexity": "low|medium|high"
        }
        // more steps...
      ]
    }
    
    DO NOT include any explanatory text outside the JSON structure.
    `;

    try {
      const planResponse = await this.llm.complete(planningPrompt, {
        temperature: 0.2,
        responseFormat: { type: "json_object" },
      });

      // Create default plan data in case parsing fails
      const defaultPlanData = {
        title: `Plan for: ${task.description.substring(0, 50)}...`,
        description: task.description,
        steps: [
          {
            id: "step-1",
            title: "Implement the required functionality",
            description: task.description,
            type: "implementation",
            dependencies: [],
            estimatedComplexity: "medium",
          },
        ],
      };

      // Use helper to parse the response robustly
      const planData = this._parseJsonResponse(planResponse, defaultPlanData);

      // Ensure steps have valid IDs
      if (planData.steps) {
        planData.steps = planData.steps.map((step, index) => ({
          ...step,
          id: step.id || `step-${index + 1}`,
        }));
      }

      // Create plan object
      const planId = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = new Date().toISOString();

      return new Plan({
        id: planId,
        taskId: task.id,
        title: planData.title,
        description: planData.description,
        steps: planData.steps,
        createdAt,
        updatedAt: createdAt,
        status: "active",
      });
    } catch (error) {
      throw new Error(`Failed to create initial plan: ${error.message}`);
    }
  }

  /**
   * Determine the next action to take based on the current state and plan
   * @param {Object} currentState - Current state of the system
   * @param {Object} plan - Current plan
   * @returns {Object} - Next action to execute
   */
  async determineNextAction(currentState, plan) {
    if (!this.llm) {
      throw new Error("LLM service not configured for planning module");
    }

    // Get the list of pending steps
    const pendingSteps = plan.getPendingSteps();

    if (pendingSteps.length === 0) {
      return {
        type: "completion",
        description: "All planned steps have been completed",
        planId: plan.id,
      };
    }

    // From the pending steps, find those that have all dependencies satisfied
    const availableSteps = pendingSteps.filter((step) => {
      // No dependencies or all dependencies are completed
      return (
        !step.dependencies ||
        step.dependencies.length === 0 ||
        step.dependencies.every((depId) => {
          const depStep = plan.getStepById(depId);
          return depStep && depStep.status === "completed";
        })
      );
    });

    if (availableSteps.length === 0) {
      // We have a dependency problem - need to handle this case
      return this._createUnblockingAction(plan, pendingSteps, currentState);
    }

    // Choose the next step to execute
    const nextStep = availableSteps[0]; // Simple strategy: take the first available

    // Depending on the step type, create an appropriate action
    switch (nextStep.type) {
      case "research":
        return this._createResearchAction(nextStep, plan, currentState);

      case "architecture":
        return this._createArchitectureAction(nextStep, plan, currentState);

      case "implementation":
        return this._createImplementationAction(nextStep, plan, currentState);

      case "testing":
        return this._createTestingAction(nextStep, plan, currentState);

      case "deployment":
        return this._createDeploymentAction(nextStep, plan, currentState);

      default:
        // For any other step types, create a generic action
        return {
          type: "generate_code", // Default to code generation for unrecognized types
          stepId: nextStep.id,
          planId: plan.id,
          description: nextStep.description,
          codeRequirements: {
            step: nextStep,
            planContext: plan.description,
            projectStructure: currentState.projectStructure || {},
            existingCode: currentState.relevantCode || [],
            dependencies: (nextStep.dependencies || [])
              .map((depId) => plan.getStepById(depId))
              .filter(Boolean),
          },
        };
    }
  }

  /**
   * Revise the plan based on reflection insights or research results
   * @param {Object} currentPlan - Current plan
   * @param {Object} insights - Reflection insights or research results
   * @returns {Object} - Updated plan
   */
  async revisePlan(currentPlan, insights) {
    if (!this.llm) {
      throw new Error("LLM service not configured for planning module");
    }

    const revisionPrompt = `
    You are an expert frontend application developer revising a development plan.
    
    CURRENT PLAN:
    ${JSON.stringify(currentPlan, null, 2)}
    
    INSIGHTS/RESULTS REQUIRING PLAN REVISION:
    ${JSON.stringify(insights, null, 2)}
    
    Based on these insights, revise the plan. You can:
    1. Add new steps
    2. Remove steps
    3. Modify existing steps
    4. Change dependencies between steps
    
    Your response MUST be a valid JSON object with the following structure:
    {
      "title": "Updated title if needed",
      "description": "Updated description if needed",
      "steps": [
        {
          "id": "step-id", // Keep existing IDs for existing steps
          "title": "Step title",
          "description": "Detailed description of the step",
          "type": "research|architecture|implementation|testing|deployment",
          "dependencies": [],
          "estimatedComplexity": "low|medium|high",
          "status": "pending|in_progress|completed|blocked"
        }
        // more steps...
      ],
      "revisionReason": "Explain why you made these changes"
    }
    
    DO NOT include any explanatory text outside the JSON structure.
    `;

    try {
      const revisionResponse = await this.llm.complete(revisionPrompt, {
        temperature: 0.3,
        responseFormat: { type: "json_object" },
      });

      // Create default revision data that maintains the current plan structure
      const defaultRevisionData = {
        title: currentPlan.title,
        description: currentPlan.description,
        steps: currentPlan.steps,
        revisionReason: "Automatic revision due to response parsing failure",
      };

      // Use helper to parse the revision response
      const revisionData = this._parseJsonResponse(
        revisionResponse,
        defaultRevisionData
      );

      // Ensure steps have valid IDs and statuses
      if (revisionData.steps) {
        revisionData.steps = revisionData.steps.map((step, index) => {
          // Get existing step with same ID if it exists
          const existingStep = currentPlan.steps.find((s) => s.id === step.id);

          return {
            ...step,
            id: step.id || `step-${index + 1}`,
            // Keep existing status if present, otherwise default to pending
            status:
              step.status || (existingStep ? existingStep.status : "pending"),
          };
        });
      }

      // Create a new plan based on the revised data
      const revisionId = `plan-rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const updatedAt = new Date().toISOString();

      // Create a new plan with the updated information but preserve existing metadata
      const revisedPlan = new Plan({
        id: revisionId,
        previousPlanId: currentPlan.id,
        taskId: currentPlan.taskId,
        title: revisionData.title || currentPlan.title,
        description: revisionData.description || currentPlan.description,
        steps: revisionData.steps,
        revisionReason: revisionData.revisionReason,
        createdAt: updatedAt,
        updatedAt,
        status: "active",
      });

      return revisedPlan;
    } catch (error) {
      // If revision fails, create a slightly modified plan to avoid getting stuck
      const emergencyRevisionId = `plan-emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const updatedAt = new Date().toISOString();

      // Create a new step to address the error
      const emergencyStep = {
        id: `step-emergency-${Date.now()}`,
        title: "Fix error in previous step",
        description: `Address error: ${error.message}`,
        type: "implementation",
        dependencies: [],
        estimatedComplexity: "medium",
        status: "pending",
      };

      // Add the emergency step to the plan
      const modifiedSteps = [...currentPlan.steps, emergencyStep];

      const emergencyPlan = new Plan({
        id: emergencyRevisionId,
        previousPlanId: currentPlan.id,
        taskId: currentPlan.taskId,
        title: currentPlan.title,
        description: currentPlan.description,
        steps: modifiedSteps,
        revisionReason: `Emergency revision due to error: ${error.message}`,
        createdAt: updatedAt,
        updatedAt,
        status: "active",
      });

      return emergencyPlan;
    }
  }

  /**
   * Create a research action
   * @private
   */
  async _createResearchAction(step, plan, currentState) {
    // Generate specific research queries based on the step
    const researchPrompt = `
    You are an expert frontend developer planning research.
    
    RESEARCH STEP:
    ${JSON.stringify(step, null, 2)}
    
    PLAN CONTEXT:
    ${plan.description}
    
    Generate 1-3 specific, targeted research queries that will help accomplish this step.
    
    Your response MUST be a valid JSON array of strings.
    Do not include any explanatory text outside of the JSON structure.
    `;

    try {
      const queriesResponse = await this.llm.complete(researchPrompt, {
        temperature: 0.4,
        responseFormat: { type: "json_object" },
      });

      // Default queries in case parsing fails
      const defaultQueries = [step.description];

      // Try to parse the response
      let queries = this._parseJsonResponse(queriesResponse, defaultQueries);

      // Handle case where response isn't an array
      if (!Array.isArray(queries)) {
        if (typeof queriesResponse === "string") {
          // Try extracting lines from the text
          queries = queriesResponse
            .split(/\n+/)
            .filter((line) => line.trim().length > 0)
            .slice(0, 3);
        } else {
          queries = defaultQueries;
        }
      }

      return {
        type: "research",
        stepId: step.id,
        planId: plan.id,
        description: step.description,
        researchQueries: queries,
        researchContext: {
          planDescription: plan.description,
          stepDetails: step,
        },
      };
    } catch (error) {
      // Fall back to a basic research action if query generation fails
      return {
        type: "research",
        stepId: step.id,
        planId: plan.id,
        description: step.description,
        researchQueries: [step.description],
        researchContext: {
          planDescription: plan.description,
          stepDetails: step,
        },
      };
    }
  }

  /**
   * Create an architecture action
   * @private
   */
  async _createArchitectureAction(step, plan, currentState) {
    return {
      type: "architecture",
      stepId: step.id,
      planId: plan.id,
      description: step.description,
      architectureContext: {
        planDescription: plan.description,
        currentState: currentState.projectStructure || {},
      },
    };
  }

  /**
   * Create an implementation action
   * @private
   */
  async _createImplementationAction(step, plan, currentState) {
    return {
      type: "generate_code",
      stepId: step.id,
      planId: plan.id,
      description: step.description,
      codeRequirements: {
        step: step,
        planContext: plan.description,
        projectStructure: currentState.projectStructure || {},
        existingCode: currentState.relevantCode || [],
        dependencies: (step.dependencies || [])
          .map((depId) => plan.getStepById(depId))
          .filter(Boolean),
      },
    };
  }

  /**
   * Create a testing action
   * @private
   */
  async _createTestingAction(step, plan, currentState) {
    return {
      type: "testing",
      stepId: step.id,
      planId: plan.id,
      description: step.description,
      testingContext: {
        planDescription: plan.description,
        componentsToTest: step.componentsToTest || [],
      },
    };
  }

  /**
   * Create a deployment action
   * @private
   */
  async _createDeploymentAction(step, plan, currentState) {
    return {
      type: "deployment",
      stepId: step.id,
      planId: plan.id,
      description: step.description,
      deploymentContext: {
        planDescription: plan.description,
        environment: step.environment || "development",
      },
    };
  }

  /**
   * Create an action to unblock the plan when there's a dependency issue
   * @private
   */
  async _createUnblockingAction(plan, blockedSteps, currentState) {
    // Check if we've been calling unblock action repeatedly
    const unblockCount = (currentState.unblockAttempts || 0) + 1;

    // If we've tried unblocking too many times, force progress by marking some dependencies as completed
    if (unblockCount > 5) {
      // Find a step with the fewest dependencies that's blocked
      const stepToUnblock = [...blockedSteps].sort(
        (a, b) => (a.dependencies?.length || 0) - (b.dependencies?.length || 0)
      )[0];

      if (stepToUnblock) {
        return {
          type: "generate_code", // Force code generation for the step
          stepId: stepToUnblock.id,
          planId: plan.id,
          description: `${stepToUnblock.description} (dependencies bypassed)`,
          bypassDependencies: true,
          codeRequirements: {
            step: stepToUnblock,
            planContext: plan.description,
            projectStructure: currentState.projectStructure || {},
            existingCode: currentState.relevantCode || [],
            forceProgress: true,
          },
        };
      }
    }

    // Analyze why steps are blocked
    const blockedStepDetails = blockedSteps.map((step) => {
      const missingDependencies = (step.dependencies || []).filter((depId) => {
        const depStep = plan.getStepById(depId);
        return !depStep || depStep.status !== "completed";
      });

      return {
        stepId: step.id,
        title: step.title,
        description: step.description,
        missingDependencies,
      };
    });

    return {
      type: "unblock_plan",
      planId: plan.id,
      description: "Resolve dependency issues in the plan",
      blockedStepDetails,
      unblockAttempt: unblockCount,
      planContext: {
        planDescription: plan.description,
        currentState: {
          ...currentState,
          unblockAttempts: unblockCount,
        },
      },
    };
  }
}

module.exports = PlanningModule;
