/**
 * ReflectionModule.js
 * Enables the agent to reflect on its actions, analyze progress, and learn from experience.
 * Responsible for determining when plans need revision and generating final reports.
 */

class ReflectionModule {
  constructor(llmService, config = {}) {
    this.llm = llmService;
    this.logger = config.logger || console;
    this.reflectionThreshold = config.reflectionThreshold || 3; // Min actions before reflection
    this.recentActions = [];
  }

  /**
   * Set or update the LLM service
   * @param {Object} llmService - LLM service
   */
  setLLM(llmService) {
    this.llm = llmService;
  }

  /**
   * Reflect on the current plan, action, and result
   * @param {Object} plan - Current plan
   * @param {Object} result - Latest action result
   * @param {Object} memory - Agent memory
   * @returns {Object} - Reflection insights
   */
  async reflect(plan, result, memory) {
    this.logger.info("Reflecting on action result", {
      planId: plan.id,
      resultStatus: result.status,
    });

    // Add to recent actions
    this.recentActions.push({
      action: result.action,
      result: result,
      timestamp: new Date().toISOString(),
    });

    // Keep only the most recent actions
    if (this.recentActions.length > 10) {
      this.recentActions.shift();
    }

    // Skip detailed reflection if we haven't accumulated enough actions yet
    // (unless there was an error)
    if (
      this.recentActions.length < this.reflectionThreshold &&
      result.status !== "failed"
    ) {
      return this._quickReflection(plan, result);
    }

    // Get recent history from memory for context
    const recentHistory = memory
      ? memory.getRecentHistory(5)
      : this.recentActions.slice(-5);

    return this._detailedReflection(plan, result, recentHistory);
  }

  /**
   * Generate a final report for a completed task
   * @param {Object} task - The completed task
   * @param {Object} finalPlan - The final plan
   * @param {Object} memory - Agent memory
   * @returns {Object} - Final report
   */
  async generateFinalReport(task, finalPlan, memory) {
    this.logger.info("Generating final report", {
      taskId: task.id,
      planId: finalPlan.id,
    });

    if (!this.llm) {
      return {
        taskId: task.id,
        summary:
          "Task completed, but no LLM available for final report generation.",
        status: "completed",
        timestamp: new Date().toISOString(),
      };
    }

    // Gather all artifacts for this task
    const artifacts = memory ? memory.getArtifactsForTask(task.id) : [];

    // Gather all completed steps
    const completedSteps = finalPlan.getCompletedSteps();

    const reportPrompt = `
      You are an expert frontend developer creating a final report for a completed development task.
      
      TASK:
      ${JSON.stringify(task, null, 2)}
      
      FINAL PLAN:
      ${JSON.stringify(finalPlan, null, 2)}
      
      COMPLETED STEPS:
      ${JSON.stringify(completedSteps, null, 2)}
      
      ARTIFACTS CREATED:
      ${JSON.stringify(
        artifacts.map((a) => ({
          id: a.id,
          type: a.type,
          path: a.path,
          description: a.description,
        })),
        null,
        2
      )}
      
      Create a comprehensive final report for this completed frontend development task.
      Include a summary of what was accomplished, key components created, challenges encountered, and how they were resolved.
      Evaluate the quality of the implementation and suggest any potential future improvements.
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "Overall summary of the completed task",
        "keyAccomplishments": ["Accomplishment 1", "Accomplishment 2", ...],
        "components": [
          {
            "name": "Component name",
            "description": "What this component does",
            "quality": "Evaluation of quality"
          },
          ...
        ],
        "challenges": [
          {
            "description": "Challenge description",
            "resolution": "How it was resolved"
          },
          ...
        ],
        "codeQuality": "Overall code quality assessment",
        "futureImprovements": ["Improvement 1", "Improvement 2", ...],
        "learnings": ["Learning 1", "Learning 2", ...],
        "overallEvaluation": "Final assessment of the task completion"
      }
      `;

    try {
      const reportResponse = await this.llm.complete(reportPrompt, {
        temperature: 0.4,
        responseFormat: { type: "json_object" },
        maxTokens: 3000,
      });

      let finalReport;
      try {
        finalReport =
          typeof reportResponse === "string"
            ? JSON.parse(reportResponse)
            : reportResponse;
      } catch (e) {
        finalReport = {
          summary: reportResponse,
          keyAccomplishments: ["Task completed successfully"],
        };
      }

      return {
        taskId: task.id,
        timestamp: new Date().toISOString(),
        status: "completed",
        ...finalReport,
      };
    } catch (e) {
      this.logger.warn("Final report generation failed", { error: e.message });

      return {
        taskId: task.id,
        summary: "Task completed, but final report generation failed.",
        error: e.message,
        status: "completed",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Perform a quick reflection when not enough actions have accumulated
   * @private
   */
  _quickReflection(plan, result) {
    const needsPlanRevision = result.status === "failed";

    // Basic reflection insights
    return {
      needsPlanRevision,
      needsResearch: false,
      insights: needsPlanRevision
        ? [`Action failed: ${result.error || "Unknown error"}`]
        : ["Action completed successfully"],
      recommendation: needsPlanRevision
        ? "Revise plan to handle the failed action"
        : "Continue with the current plan",
      confidence: needsPlanRevision ? "low" : "high",
    };
  }

  /**
   * Perform a detailed reflection with LLM
   * @private
   */
  async _detailedReflection(plan, result, recentHistory) {
    if (!this.llm) {
      return this._quickReflection(plan, result);
    }

    const reflectionPrompt = `
      You are an expert frontend developer reflecting on the progress of a development task.
      
      CURRENT PLAN:
      ${JSON.stringify(plan, null, 2)}
      
      RECENT ACTION:
      ${JSON.stringify(result.action, null, 2)}
      
      ACTION RESULT:
      ${JSON.stringify(result, null, 2)}
      
      RECENT HISTORY:
      ${JSON.stringify(recentHistory, null, 2)}
      
      Reflect on the current state of the development process.
      Analyze the outcome of the recent action and how it affects the overall plan.
      Identify any issues, blockers, or opportunities for improvement.
      Determine if the current plan needs revision or if research is needed.
      
      Format your response as a JSON object with the following structure:
      {
        "needsPlanRevision": true|false,
        "needsResearch": true|false,
        "researchQueries": ["Query 1", "Query 2", ...],
        "insights": ["Insight 1", "Insight 2", ...],
        "recommendation": "Specific recommendation for next steps",
        "planRevisionStrategy": "How to revise the plan (if needed)",
        "confidence": "high|medium|low"
      }
      `;

    try {
      const reflectionResponse = await this.llm.complete(reflectionPrompt, {
        temperature: 0.3,
        responseFormat: { type: "json_object" },
        maxTokens: 2000,
      });

      let reflection;
      try {
        reflection =
          typeof reflectionResponse === "string"
            ? JSON.parse(reflectionResponse)
            : reflectionResponse;
      } catch (e) {
        // Fall back to quick reflection if parsing fails
        this.logger.warn("Failed to parse reflection response", {
          error: e.message,
        });
        return this._quickReflection(plan, result);
      }

      return reflection;
    } catch (e) {
      this.logger.warn("Detailed reflection failed", { error: e.message });
      return this._quickReflection(plan, result);
    }
  }
}

module.exports = ReflectionModule;
