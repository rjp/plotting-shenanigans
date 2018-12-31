const dns = require('dns')
const Telnet = require('telnet-client')
const fs = require('fs')
const SVGUtils = require('./lib/SVGUtils')
const MathUtils = require('./lib/MathUtils')
const connection = new Telnet()
let gcode

// Set up application drawing bounds.
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

// Check if the user supplied an SVG.
if (process.argv.length < 3) {
  console.log(`Usage: node index.js PATH_TO_SVG`)
  process.exit(1)
}

// Manipulates gcode to fit within the line-us printable boundaries.
const processGCode = gcode => {
  console.log('Processing gcode.')

/*
  // Determine the bounds of the gcode.
  console.log('Getting drawing bounds.')
  let bounds = MathUtils.getBounds(gcode)

  const drawingWidth = bounds.x.max - bounds.x.min
  const drawingHeight = bounds.y.max - bounds.y.min

  // Which side of the image greater exceeds the bounds?
  let xScaleDiff = drawingWidth / LINE_US_WIDTH
  let yScaleDiff = drawingHeight / LINE_US_HEIGHT

  // Take the larger of the two & use that as the drawing's new inverse scale.
  const scale = 1 / (xScaleDiff > yScaleDiff ? xScaleDiff : yScaleDiff)

  // Go through all the points & scale.
  console.log('Scaling points.')
  gcode = MathUtils.scalePoints(gcode, scale)

  // Scale the old bounds to their new size.
  console.log(`Scaling bounds by ${scale}`)
  bounds = MathUtils.scaleBounds(bounds, scale)

  // Now, center the drawing within the bounds.
  let drawingCenter = MathUtils.getCenterPoint(bounds)
  let boundsCenter = MathUtils.getCenterPoint(LINE_US_BOUNDS)
  let centerDiffX = boundsCenter.x - drawingCenter.x
  let centerDiffY = boundsCenter.y - drawingCenter.y

  // Go through all points & adjust to center.
  console.log('Transforming points.')
  gcode = MathUtils.transformPoints(gcode, centerDiffX, centerDiffY)

  gcode.forEach(g => {
      if (g.Y == 0) {
        console.log(`WHY: (${Math.round(g.X)},${Math.round(g.Y)})`)
      }
  })

  */

    process.stdout.write(`<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" baseProfile="full" viewBox="650 -1000 1800 1000"><!-- p1 -->`)
    let curZ = 500
    let curP = ""
    let pG = gcode[0]
    let pP = gcode[1]
  gcode.forEach(g => {
        if (g.Z != undefined) {
            if (g.Z == 0 && curZ > 0) { // pen down
                process.stdout.write(`<!--u--><path fill="none" stroke="#F00" d="${curP} L ${pP.X} ${pP.Y}"/>`)
            } else {
                process.stdout.write(`<!--d--><path fill="none" stroke="#000" d="${curP}"/>`)
                curP = ""
            }
            curZ = g.Z
        } else {
            if (curZ > 0) {
                curP = curP + `M${g.X} ${g.Y} `
            } else {
                curP = curP + `L${g.X} ${g.Y} `
                pP = g
            }
        }
      pG = g
  })
                process.stdout.write(`<path fill="none" stroke="#000" d="${curP}"/>`)
      process.stdout.write(`</svg>\n`)


  // // Adjust the bounds (this doesn't really have any functional purpose)
  // bounds = transformRect(bounds, centerDiffX, centerDiffY)
/*
  console.log('Reducing close points.')
  // Go through & remove points that are very close to each other.
  let prevGCode
  let newGCode = []
    // Assume the first thing is a pen command Because Reasons
  curZ = gcode[0].Z
  for (var i = 0; i < gcode.length; i++) {
    let cG = gcode[i]
      console.log("SHORT?", cG)
      // Push all pen up/downs
      //
      if (cG.Z != undefined) {
          newGCode.push(cG)
          curZ = cG.Z
          console.log("PUSHED", cG)
          continue
      }
// if the pen is down, trim short segments
      if (curZ == 0) {
          if (pG != undefined) {
              let dist = MathUtils.distance(cG, pG)
              console.log("DIST", cG, pG, dist)
              // console.log(i, dist)
              if (dist >= 30) { // 10mm
                  newGCode.push(cG)
          console.log("PUSHED", cG)
                  pG = cG
              }
          }
      } else {
          newGCode.push(cG)
          console.log("PUSHED", cG)
          pG = cG
      }
    }

    let trimmedGCode = []
    let lastG
    for(var i=0; i<newGCode.length; i++) {
        // ignore pendown/penup pairs
        let cG = newGCode[i]
        console.log("CHECK", cG)
        if (lastG == undefined) { // first pass
            lastG = cG
        } else {
            if (cG.Z != undefined && lastG.Z != undefined) {
                console.log("TRIM", lastG, cG)
            } else {
                trimmedGCode.push(lastG)
                lastG = cG
            }
        }
    }
    trimmedGCode.push(lastG)
    gcode = trimmedGCode

    process.stdout.write(`<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" baseProfile="full" viewBox="650 -1000 1800 1000"><!-- p2 -->`)
    curZ = 500
    curP = ""
    pG = gcode[0]
    pP = gcode[1]
  gcode.forEach(g => {
        if (g.Z != undefined) {
            if (g.Z == 0 && curZ > 0) { // pen down
                process.stdout.write(`<!--u--><path fill="none" stroke="#F00" d="${curP} L ${pP.X} ${pP.Y}"/>`)
            } else {
                process.stdout.write(`<!--d--><path fill="none" stroke="#000" d="${curP}"/>`)
                curP = ""
            }
            curZ = g.Z
        } else {
            if (curZ > 0) {
                curP = curP + `M${g.X} ${g.Y} `
            } else {
                curP = curP + `L${g.X} ${g.Y} `
                pP = g
            }
        }
      pG = g
  })
                process.stdout.write(`<path fill="none" stroke="#000" d="${curP}"/>`)
      process.stdout.write(`</svg>\n`)
      */

  gcode.forEach(g => {
      if (g.X != undefined) {
          g.X = g.X
          g.Y = -g.Y
      }
  })

/*
    process.stdout.write(`<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" baseProfile="full" viewBox="650 -1000 1800 1000"><!-- p2 --><path fill="none" stroke="#000" d="M ${gcode[0].X} ${gcode[0].Y} `)
  gcode.forEach(g => {
    if (g.X !== undefined && !isNaN(g.X)) {
        if (g.Z > 0) {
            if (prevG.X != g.X || prevG.Y != g.Y) {
                process.stdout.write(`M ${g.X} ${g.Y} `)
            }
        } else {
            process.stdout.write(`L ${g.X} ${g.Y} `)
        }
        prevG = g
    }
  })
      process.stdout.write(`"></svg>\n`)
      */
  return gcode
}

// Sends a gcode instruction to the line-us
const sendGCode = () => {
    for (var i = 0; i < gcode.length; i++ ) {
        let step = SVGUtils.obj2GCode(gcode[i])
        process.stdout.write(`${step}\n`)
    }
}

const svgPath = process.argv[2]

if (!fs.existsSync(svgPath)) {
  console.log(`Could not locate an SVG at ${svgPath}`)
  process.exit(1)
} else {
  (async () => {
    // Convert SVG into an array of GCode objects.
    // We need these in a numeric format to scale them.
    gcode = await SVGUtils.traceSVGFile(svgPath)

    // Scale to best fit the machine's drawing bounds.
    gcode = processGCode(gcode)

    process.stdout.write(`<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" baseProfile="full" viewBox="650 -1000 1800 1000"><!-- p2 --><path stroke="#000" d="M ${Math.round(gcode[0].X)} ${Math.round(gcode[0].Y)} `)
  gcode.forEach(g => {
    process.stdout.write(`L ${Math.round(g.X)} ${Math.round(g.Y)} `)
  })
      process.stdout.write(`"></svg>\n`)

      sendGCode()
  })()
}
