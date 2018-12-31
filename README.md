# Plotting Shenanigans

Shenanigans in the world of plotting / gcode / etc.

THIS IS NOT EVEN ALPHA CODE. IT MIGHT TURN YOUR DOG GREEN.

Cargo-culted from
https://github.com/Line-us/Line-us-Programming/tree/master/C
https://github.com/Meandmybadself/Line-Us

node code changed to handle individual paths, transform the points before GCode conversion.
missing: interpolation along paths, removing tiny segments, optimising GCode output

# Workflow
(such as it is!)

```
node index.js hny.svg 2>&1 | grep ^G0 > hny.gcode
cat hny.gcode | ./sendgcode
```

If you want to visualise the render with pen movements, you can use the debugging output.

```
node index.js hny.svg 2>&1 | tee log | grep ^G0 > hny.gcode
grep p1 log > p1.svg
```

Black lines are plotted, red lines are pen movements.
