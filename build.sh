#!/bin/bash
em++ Game.cpp -o Site.js \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS="['_main','_receive_input']" \
  -s EXPORTED_RUNTIME_METHODS="['ccall']" \
  && echo "Build successful! Run: python3 -m http.server"
