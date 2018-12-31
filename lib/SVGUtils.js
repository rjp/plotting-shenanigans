const MathUtils = require('./MathUtils')
const util = require('util')

const LINE_US_BOUNDS = {
  x: {
    min: 700,
    max: 1700
  },
  y: {
    min: -1000,
    max: 1000
  }
}

const LINE_US_WIDTH = LINE_US_BOUNDS.x.max - LINE_US_BOUNDS.x.min
const LINE_US_HEIGHT = LINE_US_BOUNDS.y.max - LINE_US_BOUNDS.y.min
const fs = require('fs')
const path = require('svg-path-properties')
const extract = require('extract-svg-path').parse
const tools = require('simple-svg-tools')
const SVGO = require('svgo')

const cleanSVG = (str) => {
  const svgo = new SVGO({
    plugins: [{ cleanupAttrs: true },
      { removeDoctype: true },
      { removeXMLProcInst: true },
      { removeComments: true },
      { removeMetadata: true },
      { removeTitle: true },
      { removeDesc: true },
      { removeUselessDefs: true },
      { removeEditorsNSData: true },
      { removeEmptyAttrs: true },
      { removeHiddenElems: true },
      { removeEmptyText: true },
      { removeEmptyContainers: true },
      { removeViewBox: false },
      { cleanUpEnableBackground: true },
      { convertStyleToAttrs: true },
      { convertColors: true },
      { convertPathData: true },
      { convertTransform: true },
      { removeUnknownsAndDefaults: true },
      { removeNonInheritableGroupAttrs: true },
      { removeUselessStrokeAndFill: true },
      { removeUnusedNS: true },
      { cleanupIDs: true },
      { cleanupNumericValues: true },
      { moveElemsAttrsToGroup: true },
      { moveGroupAttrsToElems: true },
      { collapseGroups: true },
      { removeRasterImages: false },
      { mergePaths: true },
      { convertShapeToPath: true },
      { sortAttrs: true },
      { transformsWithOnePath: false },
      { removeDimensions: true },
      { removeAttrs: { attrs: '(stroke|fill)' } }]
  })
  return svgo.optimize(str)
}

const traceSVGFile = (path, sampleRate = 5) => traceSVGString(fs.readFileSync(path, { encoding: 'utf8' }), sampleRate)

const traceSVGString = async (str, sampleRate = 5) =>
  cleanSVG(str)
    .then(svg => {
      svg = svg.data
    let t = new tools.SVG(svg)
    let bw = t.width - t.left
    let bh = t.height - t.top

    // Which side of the image greater exceeds the bounds?
    let xScaleDiff = bw / LINE_US_WIDTH
    let yScaleDiff = bh / LINE_US_HEIGHT

    // Take the larger of the two & use that as the drawing's new inverse scale.
    const scale = 1 / (xScaleDiff > yScaleDiff ? xScaleDiff : yScaleDiff)
    let ccen = MathUtils.getCenterPoint({x:{min:t.left,max:t.width},y:{min:t.left,max:t.height}})
    let lcen = MathUtils.getCenterPoint(LINE_US_BOUNDS)
    let dx = lcen.x - ccen.x
    let dy = lcen.y - ccen.y
    console.log(`${t.left},${t.top} [${util.inspect(ccen)},${util.inspect(lcen)}; ${dx},${dy}] ${t.width},${t.height} => ${xScaleDiff},${yScaleDiff} => ${scale}`)

//    console.log(t)
      const e = extract(svg)
      const props = path.svgPathProperties(e)
      const len = props.getTotalLength()
      const steps = Math.ceil(len / sampleRate)
      const firstPt = props.getPointAtLength(0)
        let output = []
      const allParts = props.getParts()
        let p = { x:{min:-99999,max:-99999}, y:{min:-99999,max:-99999} }
        let curZ = -999
      for (var j = 0; j < allParts.length; j++) {
          let np = allParts[j]
          let q = MathUtils.scaleBounds({x:{min:np.start.x-t.left,max:np.end.x-t.left},y:{min:np.start.y-t.top,max:np.end.y-t.top}}, scale)
          q.x.min = Math.round(q.x.min + LINE_US_BOUNDS.x.min)
          q.x.max = Math.round(q.x.max + LINE_US_BOUNDS.x.min)
          q.y.min = Math.round(q.y.min + LINE_US_BOUNDS.y.min)
          q.y.max = Math.round(q.y.max + LINE_US_BOUNDS.y.min)
          if (isNaN(q.x.min) || isNaN(q.x.max) || isNaN(q.y.min) || isNaN(q.y.max)) {
              continue
          }
          if (p.x.max != q.x.min || p.y.max != q.y.min) {
              output.push({ G: 1, Z: 500 })
              output.push({ G: 1, X: Math.round(q.x.min), Y: Math.round(q.y.min) })
              curZ = 500
          }
          if (curZ != 0) {
              output.push({ G: 1, Z: 0 })
              curZ = 0
          }
          output.push({ G: 1, X: Math.round(q.x.max), Y: Math.round(q.y.max) })
          p = q
          /*
          for (var i = 0; i <= steps; i++) {
            const per = i / steps
            const p = np.getPointAtLength(len * per)
            if (p.x != prevP.x || p.y != prevP.y) {
                output.push({ G: 1, X: p.x, Y: p.y, Z: 500 })
            }
            output.push({ G: 1, X: Math.round(p.x), Y: Math.round(p.y), Z: 0 })
            prevP = p
          }
          */
      }
      // Return home.
      output.push({ G: 28 })
      return output
    })

// Turns an object into its gcode string equivalent.
const obj2GCode = obj => Object.keys(obj).map(key => `${key}${obj[key]}`).join(' ').replace('G0', 'G00').replace('G1','G01').replace('XNaN','').replace('YNaN','')

module.exports = {
  traceSVGFile,
  traceSVGString,
  obj2GCode
}
