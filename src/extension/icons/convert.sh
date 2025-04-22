#!/bin/bash

# Convert SVG to different PNG sizes
convert -background none -size 16x16 logo.svg icon16.png
convert -background none -size 48x48 logo.svg icon48.png
convert -background none -size 128x128 logo.svg icon128.png 