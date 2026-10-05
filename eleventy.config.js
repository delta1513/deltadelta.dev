module.exports = function (eleventyConfig) {
  // Used by markdown.njk to render a post's date.
  eleventyConfig.addFilter("dateFormat", function (date) {
    return new Date(date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });
  });

  // input is "." so repo docs would otherwise be built as pages.
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("AGENTS.md");
  eleventyConfig.ignores.add("CLAUDE.md");
  eleventyConfig.ignores.add(".claude");

  // Static files. nginx used to serve the repo root directly, so these never
  // needed copying; Cloudflare only serves what lands in dist/.
  eleventyConfig.addPassthroughCopy("directory/icons");
  eleventyConfig.addPassthroughCopy("media");
  eleventyConfig.addPassthroughCopy("favicon.png");
  // Not served as an asset — Workers parses it and applies the rules.
  eleventyConfig.addPassthroughCopy("_redirects");

  return {
    dir: {
      input: ".",
      output: "dist",
      includes: "_includes"
    }
  };
};
