module.exports = function(eleventyConfig) {
  // Add a date formatting filter
  eleventyConfig.addFilter("dateFormat", function(date) {
    return new Date(date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });
  });

  // Create a collection for posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("now/posts/*.md");
  });

  // Add blog collection
  eleventyConfig.addCollection("blog", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_blog/*.md");
  })

  // Copy the directory-viewer icons through to the output
  eleventyConfig.addPassthroughCopy("directory/icons");

  // Update input/output config
  return {
    dir: {
      input: ".",
      output: "writing",
      includes: "_includes"
    }
  };
};