module.exports = function(eleventyConfig) {
  // Add a date formatting filter
  eleventyConfig.addFilter("dateFormat", function(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('en-AU', options);
    
    const now = new Date();
    const then = new Date(date);
    const diffInDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    
    let timeAgo;
    if (diffInDays === 0) {
      timeAgo = "today";
    } else if (diffInDays === 1) {
      timeAgo = "yesterday";
    } else if (diffInDays < 30) {
      timeAgo = `${diffInDays} days ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      timeAgo = `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      timeAgo = `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
    
    return `${formattedDate} (${timeAgo})`;
  });

  // Create a collection for posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("now/posts/*.md");
  });

  // Add blog collection
  eleventyConfig.addCollection("blog", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_blog/*.md");
  })

  // Update input/output config
  return {
    dir: {
      input: ".",
      output: "writing",
      includes: "_includes"
    }
  };
};