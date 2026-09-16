#!/usr/bin/env bash
set -e

export CMAKE_ARGS="-DCMAKE_POLICY_VERSION_MINIMUM=3.5"
export CMAKE_BUILD_PARALLEL_LEVEL=1
export MAKEFLAGS="-j1"

pip install --no-cache-dir -r requirements.txt
