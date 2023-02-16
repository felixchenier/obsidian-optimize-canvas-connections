# Optimize Canvas Connections

Suppose you start a canvas.

![Figure 1](https://github.com/felixchenier/obsidian-optimize-canvas-connections/raw/master/images/fig1.png)

Then you move everything around while you brainstorm. The connections between notes may quickly become a mess.

![Figure 2](https://github.com/felixchenier/obsidian-optimize-canvas-connections/raw/master/images/fig2.png)

This simple plugin automatically reconnect notes together, using their nearest edges.

Run command:

`Optimize Canvas Connections: Optimize selection (preserve axes)`

`Optimize Canvas Connections: Optimize canvas (preserve axes)`

`Optimize Canvas Connections: Optimize selection (shortest path)`

or

`Optimize Canvas Connections: Optimize canvas (shortest path)`

![Figure 3](https://github.com/felixchenier/obsidian-optimize-canvas-connections/raw/master/images/fig3.png)

## Selection vs canvas

Indicates if you want to optimize the whole canvas or only the selected node's connection points.

## Shortest path vs Preserve axes

The `shortest path` option reconnects notes using their nearest edges, always using the shortest path possible. This is the most drastic approach.

The `preserve axes` option also reconnects notes using their nearest edges, but it respects the axes on which a connection originally begins and ends. For instance, a connection that begins on the right side of a note could be changed to begin from the left, but not from the top or bottom. Use this option to preserve meaning in vertical and horizontal flow (e.g., top-to-bottom = time, left-to-right = details).

**In doubt, use `preserve axes`.**
