# Acceptance fixture, not a user document

Every file next to this one is **generated output**, written by
`$bog_vmap_app_export_build` from `../app/export/`. Do not hand edit them: the
whole point of the folder is that nobody touched it after the export ran.

It exists to answer one question, the acceptance criterion of stage 7 in
[PLAN.md](../PLAN.md): does an exported document drop into the tree and build
with no manual fixes? Section 10 of [ARCHITECTURE.md](../ARCHITECTURE.md) states
that it must. A unit test cannot show it, because what has to succeed is a mam
build. This folder can, and does, every time CI runs.

What the built bundle is checked to contain:

- both classes of the document;
- `this.Calc().result()` — a wire, both links intact, so the mechanism of
  section 1 survives export;
- `$mol_mem( $bog_vmap_demo_calc.prototype, "sum" )` — a hand written body still
  memoized, applied as a separate expression after the class the way studio does
  it in `source_js_decorators()`;
- `$mol_style_attach` carrying the stylesheet.

It also closes the second half of the circle of section 5: the `-/web.view.tree`
this module builds parses with the library model of `../lib/`, which reads the
exported document back as a donor pack with a full port list. An exported site is
a component library for the next document, and this is where that stops being a
promise.

To regenerate, run the export over the same two sources and overwrite the folder.
Placement is not free — the module path comes from the longest common prefix of
the class names, so `$bog_vmap_demo_page` and `$bog_vmap_demo_calc` are what put
it at `bog/vmap/demo`.
