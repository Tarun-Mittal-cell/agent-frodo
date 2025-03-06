/**
 * Utilities for handling generated code files
 */

/**
 * Process files returned from the code generation API
 * @param {Array} files - Array of file objects from API
 * @returns {Object} Processed files organized by category
 */
export function processGeneratedFiles(files) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    console.error("No valid files provided to processGeneratedFiles");
    return {
      components: [],
      styles: [],
      scripts: [],
      html: [],
      other: [],
      allFiles: []
    };
  }

  // Log the received files for debugging
  console.log(`Processing ${files.length} generated files`);
  
  const result = {
    components: [],
    styles: [],
    scripts: [],
    html: [],
    other: [],
    allFiles: [...files] // Keep a reference to all files
  };

  // Process each file and categorize it
  files.forEach(file => {
    const { path, code, description } = file;
    
    if (!path || !code) {
      console.warn("File missing path or code:", file);
      return;
    }

    // Determine file category based on extension and path
    if (path.match(/\.(jsx|tsx)$/i) || path.includes('/components/')) {
      result.components.push(file);
    } 
    else if (path.match(/\.(css|scss|less)$/i) || path.includes('/styles/')) {
      result.styles.push(file);
    } 
    else if (path.match(/\.(js|ts)$/i) || path.includes('/scripts/')) {
      result.scripts.push(file);
    } 
    else if (path.match(/\.(html|htm)$/i)) {
      result.html.push(file);
    } 
    else {
      result.other.push(file);
    }
  });

  return result;
}

/**
 * Get the main file from generated files to display first
 * @param {Object} processedFiles - Files processed by processGeneratedFiles
 * @returns {Object} The main file to display
 */
export function getMainFile(processedFiles) {
  // First try to find a component that looks like a main page
  const mainComponentRegex = /(home|app|main|index|landing|page)/i;
  
  // Check components first
  const mainComponent = processedFiles.components.find(
    file => mainComponentRegex.test(file.path)
  );
  
  if (mainComponent) {
    return mainComponent;
  }
  
  // If no main component, fall back to first component or first file
  return (
    processedFiles.components[0] || 
    processedFiles.html[0] || 
    processedFiles.allFiles[0] || 
    {
      path: "No files generated",
      code: "// No code was generated",
      description: "No files were successfully generated"
    }
  );
}

/**
 * Extract a suitable preview image from the generated code
 * @param {Array} files - Array of file objects
 * @returns {String} URL of preview image or null
 */
export function extractPreviewImage(files) {
  if (!files || !Array.isArray(files)) return null;
  
  // Look for image URLs in the code
  const imageUrlRegex = /https?:\/\/[^\s'"]+\.(jpg|jpeg|png|gif|webp)/gi;
  
  for (const file of files) {
    if (!file.code) continue;
    
    const matches = file.code.match(imageUrlRegex);
    if (matches && matches.length > 0) {
      // Return the first image URL found
      return matches[0];
    }
  }
  
  // Try looking for unsplash URLs which are common in our templates
  const unsplashRegex = /https:\/\/source\.unsplash\.com\/[^\s'"]+/gi;
  
  for (const file of files) {
    if (!file.code) continue;
    
    const matches = file.code.match(unsplashRegex);
    if (matches && matches.length > 0) {
      // Return the first unsplash URL found
      return matches[0];
    }
  }
  
  // If no image URLs found, return null
  return null;
}
