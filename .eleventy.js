/**
 * Eleventy Configuration File
 * Configures Eleventy to use a dedicated assets folder and Decap CMS admin folder.
 */
module.exports = function(eleventyConfig) {
    
    // --- Pass-Through Copies ---
    // This tells Eleventy to copy the 'assets' (CSS/JS) folder and the 'admin' 
    // (Decap CMS) folder directly to the final '_site' output folder without processing them.
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("admin");

    // --- Directory Configuration ---
    // Defines where Eleventy should look for source files and where to put the output.
    return {
        // Look for source files (index.html, contact.html) in the project root
        dir: {
            input: ".", 
            // Location of template layouts (e.g., _includes/base.html)
            includes: "_includes", 
            // The final build destination folder (used by Netlify)
            output: "_site" 
        },
        // Specify the template languages Eleventy should process
        templateFormats: ["html", "md", "liquid", "njk"] 
    };
};
