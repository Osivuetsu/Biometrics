#!/usr/bin/env bash
set -e

# Use a CMake 3.x version compatible with dlib 19.24.2
python -m pip install --upgrade pip setuptools wheel
python -m pip install --no-cache-dir "cmake==3.31.6"

# Reduce memory usage during dlib compilation
export CMAKE_BUILD_PARALLEL_LEVEL=1
export MAKEFLAGS="-j1"

# Install project dependencies
python -m pip install --no-cache-dir -r requirements.txt
