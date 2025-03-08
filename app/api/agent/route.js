// app/api/agent/route.js

import { NextResponse } from "next/server";
import AutonomousAgent from "../../../lib/AutonomousAgent";

// Store agent instances in a Map to handle multiple tasks
const agents = new Map();
// Store task data
const tasks = new Map();

// Handle cleanup of idle agents
setInterval(
  () => {
    const now = Date.now();
    // Clean up tasks older than 30 minutes
    for (const [taskId, taskData] of tasks.entries()) {
      if (now - taskData.lastActivity > 30 * 60 * 1000) {
        const agent = agents.get(taskData.agentId);
        if (agent) {
          agent.cleanup().catch(console.error);
          agents.delete(taskData.agentId);
        }
        tasks.delete(taskId);
      }
    }
  },
  10 * 60 * 1000
); // Check every 10 minutes

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, apiKey, task, taskId } = body;

    // Initialize an agent
    if (action === "initialize") {
      try {
        // Create a new agent
        const agent = new AutonomousAgent();
        const agentId = Date.now().toString();

        // Store progress data
        let progressData = [];

        // Initialize the agent
        console.log(
          "Initializing agent with API key:",
          apiKey ? "API key provided" : "No API key"
        );
        const result = await agent.initialize(
          apiKey,
          {
            onProgress: (data) => {
              progressData.push(data);
            },
            onComplete: (data) => {
              if (tasks.has(agentId)) {
                tasks.get(agentId).result = data;
                tasks.get(agentId).status = "completed";
                tasks.get(agentId).lastActivity = Date.now();
              }
            },
            onError: (error) => {
              console.error("Agent error callback:", error);
              if (tasks.has(agentId)) {
                tasks.get(agentId).error = error;
                tasks.get(agentId).status = "error";
                tasks.get(agentId).lastActivity = Date.now();
              }
            },
          },
          {
            debugMode: true, // Enable debug mode for more detailed logs
          }
        );

        // Store the agent
        agents.set(agentId, agent);

        return NextResponse.json({
          success: result.success,
          message: result.message,
          agentId: agentId,
        });
      } catch (initError) {
        console.error("Agent initialization error:", initError);
        return NextResponse.json(
          {
            success: false,
            message: `Initialization error: ${initError.message}`,
          },
          { status: 500 }
        );
      }
    }

    // Start a task
    if (action === "start") {
      try {
        // Generate a unique task ID
        const taskId = Date.now().toString();
        const agentId = body.agentId || Array.from(agents.keys())[0];

        // Get the agent
        const agent = agents.get(agentId);

        if (!agent) {
          console.error("Agent not found for agentId:", agentId);
          console.error("Available agents:", Array.from(agents.keys()));
          return NextResponse.json(
            {
              success: false,
              message: "Agent not found. Please initialize first.",
            },
            { status: 400 }
          );
        }

        // Create a new task entry
        tasks.set(taskId, {
          agentId,
          task,
          status: "starting",
          progress: 0,
          history: [
            {
              role: "user",
              content: task,
              timestamp: new Date().toISOString(),
            },
          ],
          lastActivity: Date.now(),
        });

        // Start the task asynchronously with custom configuration
        const taskOptions = {
          maxIterations: 30, // Increase iterations for complex tasks
          debugMode: true, // Enable debug mode
          model: "claude-3-5-sonnet-20241022", // Explicitly set the model
          systemPrompt: `You are Frodo, an elite autonomous web development assistant that creates visually stunning, modern websites with React, Next.js, and Tailwind CSS. You excel at:

1. Creating exceptional UI/UX designs that are visually striking and intuitive
2. Implementing 3D elements and animations that create immersive experiences
3. Autonomously debugging and fixing issues without human intervention
4. Ensuring all images load correctly and are optimized
5. Producing production-ready, error-free code that follows best practices

Your designs should be innovative and impressive enough to make even the most discerning tech leaders jealous. When using the computer, be methodical:
- Browse the web to research latest design trends and techniques
- Access GitHub to find and implement cutting-edge libraries
- Test your code thoroughly and fix any issues
- Validate that all images are loading properly
- Create 3D elements that enhance the user experience

Always aim for the highest possible quality in every aspect of development.

When given a task to create a UI component, focus first on understanding the requirements fully, 
then create high-quality React components using Tailwind CSS. Create complete, working code 
that's ready to be used.`,
        };

        console.log("Starting task with options:", taskOptions);
        agent
          .startTask(task, taskOptions)
          .then((result) => {
            // Update task data
            if (tasks.has(taskId)) {
              tasks.get(taskId).result = result;
              tasks.get(taskId).status = "completed";
              tasks.get(taskId).progress = 100;
              tasks.get(taskId).history = agent.getTaskHistory();
              tasks.get(taskId).lastActivity = Date.now();
            }
          })
          .catch((error) => {
            console.error("Task error:", error);
            // Update task error
            if (tasks.has(taskId)) {
              tasks.get(taskId).error = {
                message: error.message,
                stack: error.stack,
              };
              tasks.get(taskId).status = "error";
              tasks.get(taskId).history = agent.getTaskHistory();
              tasks.get(taskId).lastActivity = Date.now();
            }
          });

        return NextResponse.json({
          success: true,
          taskId: taskId,
          message: "Task started",
        });
      } catch (startError) {
        console.error("Error starting task:", startError);
        return NextResponse.json(
          {
            success: false,
            message: `Error starting task: ${startError.message}`,
          },
          { status: 500 }
        );
      }
    }

    // Get task status
    if (action === "status") {
      if (!taskId || !tasks.has(taskId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Task not found",
          },
          { status: 400 }
        );
      }

      const taskData = tasks.get(taskId);

      // If task is running, update history from agent
      if (taskData.status === "running") {
        const agent = agents.get(taskData.agentId);
        if (agent) {
          taskData.history = agent.getTaskHistory();
          taskData.status = agent.isRunning ? "running" : "completed";
          taskData.progress =
            (agent.currentIteration / agent.maxIterations) * 100;
          taskData.lastActivity = Date.now();
        }
      }

      return NextResponse.json({
        success: true,
        status: taskData,
      });
    }

    // Stop a task
    if (action === "stop") {
      if (!taskId || !tasks.has(taskId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Task not found",
          },
          { status: 400 }
        );
      }

      const taskData = tasks.get(taskId);
      const agent = agents.get(taskData.agentId);

      if (agent) {
        const result = agent.stopTask("Stopped by user");
        taskData.status = "stopped";
        taskData.history = agent.getTaskHistory();
        taskData.lastActivity = Date.now();

        return NextResponse.json({
          success: true,
          result: result,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Agent not found",
          },
          { status: 400 }
        );
      }
    }

    // Return unknown action
    return NextResponse.json(
      {
        success: false,
        message: "Unknown action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
