({
    baseUrl: "./src",
    name: "../node_modules/almond/almond",
    include: "structjs",
    out: "build/nstructjs.js",
    wrap: {
      startFile: 'tools/start.frag',
      endFile:   'tools/end.frag'
    },
    insertRequire: ["structjs"],
    optimize: "none"
})
