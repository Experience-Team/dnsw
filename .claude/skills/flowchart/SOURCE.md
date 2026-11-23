Copied from https://github.com/danshapiro/skill-flowchart at commit 9be83029a073bfa0d329bad8a29ec4aef40ecf7f
(5 Jul 2026), Apache-2.0. The git history and `.opencode/` config were left out.

To update, copy `SKILL.md`, `README.md`, `LICENSE`, `assets/`, `scripts/` and `references/` from a newer commit.

## Local changes

- `assets/flowchart-template.html` (23 Nov 2026): in an expanded group, a step with its own edge to (or from) an outside
  block keeps only that edge. Before, every exit was also joined to every block the parent leads to, so a group with
  two exits drew both going everywhere. A boundary box also names the outside block's top-level stage, so a step
  in one group can link straight to a step in another. An edge with `"loop": true` is drawn even though it points
  left (the renderer otherwise drops every leftward edge on desktop). Search the file for "dnsw change".
- `assets/flowchart-template.html`: the left column (View, Groups, Connections, Visible) has a Hide panel button that
  collapses it to a narrow strip; Show panel brings it back, and the choice is remembered on the device.
- `assets/flowchart-template.html`: arrowheads scale with the line (at least 14px, about three times its width), and
  the last straight piece before a box is at least one arrowhead long, so no arrowhead folds into a bend or hides
  under the box it points at.
- `scripts/package.json`: marks the scripts as CommonJS, because this repo's `package.json` sets `"type": "module"`.
