# Acceptance fixture, not a user document

Every file next to this one is **generated output**, written by
`$bog_vmap_app_export_build` from `../app/export/`. Do not hand edit them: the
whole point of the folder is that nobody touched it after the export ran.

It exists to answer one question, the acceptance criterion of stage 7 in
[PLAN.md](../PLAN.md): does an exported document drop into the tree and build
with no manual fixes? Section 10 of [ARCHITECTURE.md](../ARCHITECTURE.md) states
that it must. A unit test cannot show it, because what has to succeed is a mam
build. This folder can, and does, every time CI runs: `demo` stands in the
`modules` of `.github/workflows/deploy.yml` beside `app`, built and never
published. It was added there on 09.09.2026, and until then this sentence was a
promise nothing kept.

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

Regenerated 09.09.2026 **through the editor** rather than by calling the export
on two strings: the two classes were opened as one document, a part was dropped
on the canvas and deleted again, the root class was renamed from
`$bog_vmap_app_page` — the name a fresh document gets — to `$bog_vmap_demo_page`,
and only then was the module written out. Every file came back byte for byte
what it had been.

That is what the folder is worth as a fixture now. It says that an edit of one
class does not eat the other, that a rename of the root moves the module folder
and carries the styles of the renamed class with it, and that what comes out
still builds — `npx mam bog/vmap/demo`, both audits green.
