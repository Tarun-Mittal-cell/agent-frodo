/**
 * FallbackCodeGenerator.js
 * Provides fallback code generation when AI services are unavailable or experiencing issues
 */

const fs = require("fs");
const path = require("path");

class FallbackCodeGenerator {
  constructor(config = {}) {
    this.projectRoot = config.projectRoot || process.cwd();
    this.templates = config.templates || this._loadDefaultTemplates();
    this.logger = config.logger || console;
  }

  /**
   * Load default code templates
   * @private
   */
  _loadDefaultTemplates() {
    return {
      reactCounter: {
        component: `import React, { useState } from 'react';
import styles from './Counter.module.css';

/**
 * Counter Component
 * 
 * A simple counter with increment, decrement, and reset functionality.
 * Displays the counter value in green when positive, red when negative.
 * 
 * @returns {JSX.Element} The Counter component
 */
const Counter = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prevCount => prevCount + 1);
  const decrement = () => setCount(prevCount => prevCount - 1);
  const reset = () => setCount(0);

  // Determine the CSS class based on count value
  const counterClass = count < 0 ? styles.negative : count > 0 ? styles.positive : '';

  return (
    <div className={styles.counter}>
      <h2>Counter Component</h2>
      
      <div className={styles.display}>
        <span className={\`\${styles.value} \${counterClass}\`}>{count}</span>
      </div>
      
      <div className={styles.controls}>
        <button onClick={decrement} className={styles.button}>Decrement</button>
        <button onClick={reset} className={styles.button}>Reset</button>
        <button onClick={increment} className={styles.button}>Increment</button>
      </div>
    </div>
  );
};

export default Counter;`,

        styles: `.counter {
  font-family: Arial, sans-serif;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.display {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.value {
  font-size: 36px;
  font-weight: bold;
}

.positive {
  color: green;
}

.negative {
  color: red;
}

.controls {
  display: flex;
  justify-content: space-between;
}

.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4285f4;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #3367d6;
}`,

        app: `import React from 'react';
import Counter from './components/Counter';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Counter Example</h1>
      </header>
      <main>
        <Counter />
      </main>
    </div>
  );
}

export default App;`,
      },
      reactTodo: {
        component: `import React, { useState } from 'react';
import styles from './TodoList.module.css';

/**
 * TodoList Component
 * 
 * A simple todo list with add, toggle, and delete functionality.
 * 
 * @returns {JSX.Element} The TodoList component
 */
const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className={styles.todoList}>
      <h2>Todo List</h2>
      
      <div className={styles.inputContainer}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task"
          className={styles.input}
        />
        <button onClick={addTodo} className={styles.addButton}>Add</button>
      </div>
      
      <ul className={styles.list}>
        {todos.map(todo => (
          <li key={todo.id} className={styles.item}>
            <span 
              className={\`\${styles.text} \${todo.completed ? styles.completed : ''}\`}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.text}
            </span>
            <button 
              onClick={() => deleteTodo(todo.id)}
              className={styles.deleteButton}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      
      {todos.length === 0 && (
        <p className={styles.emptyMessage}>No todos yet. Add one above!</p>
      )}
    </div>
  );
};

export default TodoList;`,
      },
    };
  }

  /**
   * Generate fallback code when AI services fail
   * @param {Object} requirements - Code generation requirements
   * @returns {Object} Generated code files
   */
  async generateFallbackCode(requirements) {
    try {
      this.logger.info(
        "Using fallback code generation for requirements:",
        requirements
      );

      // Determine which template to use based on requirements
      let templateKey = "reactCounter"; // Default

      if (
        requirements.planContext &&
        requirements.planContext.toLowerCase().includes("todo")
      ) {
        templateKey = "reactTodo";
      }

      const template = this.templates[templateKey];

      // Ensure the component directory exists
      const componentDir = path.join(this.projectRoot, "src/components");
      if (!fs.existsSync(componentDir)) {
        fs.mkdirSync(componentDir, { recursive: true });
      }

      // Write the component file
      const componentName =
        templateKey === "reactCounter" ? "Counter" : "TodoList";
      const componentPath = path.join(componentDir, `${componentName}.js`);
      fs.writeFileSync(componentPath, template.component);

      // Write the CSS module file
      const cssPath = path.join(componentDir, `${componentName}.module.css`);
      fs.writeFileSync(cssPath, template.styles);

      // Update App.js if it exists
      const appPath = path.join(this.projectRoot, "src/App.js");
      if (fs.existsSync(appPath)) {
        fs.writeFileSync(appPath, template.app);
      }

      this.logger.info(
        `Fallback code generation complete. Files written to ${componentDir}`
      );

      return {
        success: true,
        files: [
          {
            path: `src/components/${componentName}.js`,
            content: template.component,
          },
          {
            path: `src/components/${componentName}.module.css`,
            content: template.styles,
          },
          {
            path: "src/App.js",
            content: template.app,
          },
        ],
      };
    } catch (error) {
      this.logger.error("Fallback code generation failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = FallbackCodeGenerator;
