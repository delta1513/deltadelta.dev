module.exports = function(eleventyConfig) {
  // Add a date formatting filter
  eleventyConfig.addFilter("dateFormat", function(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-AU', options);
  });

  // Create a collection for posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_now/posts/*.md");
  });

  return {
    dir: {
      input: "_now",
      output: "./"
    }
  };
};