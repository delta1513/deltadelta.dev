---
title: Cellular Automata
description: Collection of artworks and experimentations using cellular automata
layout: blog-base.njk
---

I recently had an idea to make a cellular automata that follows some rules around RGB colours on a grid of pixels. In general, the rules are:
- There exists a grid of pixels and organisms that live on the grid, these are individual pixels that can move.
- Each organism consists of a RGB value
- When an organism traverses a tile, we 'mix' the colour of the pixel into the organism with a coefficient of `C`, and conversely, we 'mix' the colour value of the organism into the tile with a coefficient of `1 - C`
- An organism will always move in the direction that brings it closest to the one organism out of all which is closest to its current colour (using euclidean distance)
- If an organism collides with another organism, they will merge and the average of their colours becomes the RGB value of the remaining organism

I AI-generated the code that generates these simulations and used p5js.

These are some of the more interesting results I found.

![](/media/art/output.png)

![](/media/art/output+1.png)

![](/media/art/output+2.png)

![](/media/art/output+3.png)

This one here I just think is quite pretty, it was a single frame:

![](/media/art/this-is-just-pretty.png)


These pieces were heavily influenced by a recent video I watched on [emergent complexity](https://www.youtube.com/watch?v=0HqUYpGQIfs) and also by [The Coding Train](https://www.youtube.com/@TheCodingTrain)

After writing this, I now wonder what would happen if the coefficient was asymmetric, that is, for example, the organism will replicate itself as the tile instead of "mixing". Or maybe what would happen if the organisms searched for the closest match of all pixels on the grid instead of themselves?