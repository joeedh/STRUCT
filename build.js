({
    baseUrl: "./src",
    name: "../node_modules/almond/almond",
    include: "nstructjs",
    out: "nstructjs-build.js",
    wrap: {
      startFile: 'start.frag',
      endFile:   'end.frag'
    },
    insertRequire: ["nstructjs"],
    optimize: "none"
})
