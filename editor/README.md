# Complish IDE

An IDE for Complish

I'm trying to keep this project very lightweight. No UI framework, for instance. Typescript is always kind of a must, though. 

But I do miss the structure that web components enforce.  I recently split up the CSS file into individual "per component" files because it was already unmaintainable. I ended up making a render-once fake UI framework in 3 lines of code.

Am considering adding SASS, but then I really would have to add either a `package.json` or at least a VSCode-specific `tasks.json` so I'll pass for now.

## Try it out

After git cloning, `tsc` and point IIS to index.html.  This assumes you have Typescript installed globally so if `tsc` is not a recognized command, first `npm install -g typescript`.  No need to run `npm install` because there's no package.json file and no dependencies.  I'm going for vanilla TS here.
