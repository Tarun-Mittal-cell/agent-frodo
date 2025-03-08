# Project Guidelines

## Build Commands

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style Guidelines

### Imports

- Use absolute imports with `@/` alias (e.g., `import Component from "@/components/Component"`)
- Group imports: React/Next.js, external libraries, internal components/utils

### Component Structure

- Use functional components with hooks
- Export components at the end of file
- Use JSDoc comments for complex components

### Naming Conventions

- PascalCase for components and files (e.g., `FilesSection.jsx`)
- camelCase for variables, functions, and instances
- Use descriptive, specific names

### Styling

- Use Tailwind CSS for styling
- Use `cn()` utility for conditional class merging
- Follow glass morphism and responsive design patterns

### Error Handling

- Use try/catch blocks for async operations
- Provide meaningful error messages
- Emit events for error states using `eventEmitter`

### Best Practices

- Use React.forwardRef when needed
- Destructure props at component level
- Leverage Next.js App Router conventions
