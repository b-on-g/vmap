# Acceptance fixture of the router, not a user document

Every file next to this one is **generated output**, written by
`$bog_vmap_app_export_build` from `../app/export/`. Do not hand edit them, for
the same reason as in `../demo/`: the folder is worth something only while
nobody has touched it since the export ran.

`index.html` is missing on purpose, as in `../demo/`: the pack keeps a single
page by section 7 of [ARCHITECTURE.md](../ARCHITECTURE.md), and the page was
removed by hand after the export ran. What the router is worth as a fixture does
not pass through the page anyway — the address is measured on the built node
bundle, and the page the export writes is held byte for byte by a unit test of
the export. Without a source page the build writes no `-/index.html` and
synthesizes `-/test.html` around a root named after the module path, a class
this module does not declare; the tests in it still run.

`demo/` answers whether an exported document builds. This one answers the
question stage 6.5 adds: does a document of **several pages** build, and is a
page addressable once it does. A unit test cannot show either — what has to
succeed is a mam build, and what has to work afterwards is an address.

Both fixtures stand in the `modules` of `.github/workflows/deploy.yml`, built on
every run and published by nothing. A fixture built only when somebody remembers
to build it breaks exactly when nobody is watching it.

The document behind it is two artboards and one free part beside them:

- `Home` and `About` carry a `sub` of their own, so they are pages;
- `Card` carries none, so it is a free part — it exists for its ports and is
  drawn by nothing;
- `Away` and `Back` are ordinary `$mol_link` nodes with `arg * page \About` and
  `arg * page \Home`. Navigation between pages is written in the document, in
  plain $mol, and needs no code from the export at all. That is the whole reason
  the address key is a `$mol_state_arg` one.

What the built module is checked to contain and to do:

- `$bog_vmap_pages_app`, the router, declared **after** the document class it
  holds, because `class $A extends $[ '$B' ]` takes its base at definition time;
- `$mol_state_arg.value( 'page' )` in the body, one artboard returned out of the
  `switch`, and the first page as the default — measured on the built node
  bundle: no argument gives `Home`, `page=About` gives `About`, an unknown page
  name gives `Home`, and `page` is the only key ever asked for;
- the hand written body of `$bog_vmap_pages_hero`, still memoized by a separate
  expression after the class;
- no coordinate anywhere: the two pages lie side by side on the canvas by
  numbers that ride `spots` and never enter the document.

The router is not the document class and does not inherit it. An heir declared
in the same `.view.tree` silently loses the hand written body of its base, so
the document lies inside the router as `Doc` and its artboards are reached as
the flat properties `upper` makes of them.

To regenerate, run the export over the same two sources and overwrite the
folder. Placement is not free: the module path is the longest common prefix of
the class names, so `$bog_vmap_pages_doc` and `$bog_vmap_pages_hero` are what
put it at `bog/vmap/pages`, and the router is named after that path rather than
after a class precisely so that it cannot move the module.
