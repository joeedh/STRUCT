({
    baseUrl: "./src",
    name: "../node_modules/almond/almond",
    include: "structjs",
    out: "build/nstructjs.js",
    wrap: {
      startFile: 'start.frag',
      endFile:   'end.frag'
    },
    insertRequire: ["structjs"],
    optimize: "none"
})
