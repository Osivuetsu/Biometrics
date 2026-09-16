#!/usr/bin/env bash
set -e

# Ensure Render uses executables installed in the Python virtual environment
export PATH="/opt/render/project/src/.venv/bin:$PATH"

# Reduce memory usage during compilation
export CMAKE_BUILD_PARALLEL_LEVEL=1
export MAKEFLAGS="-j1"

echo "Python location:"
which python
python --version

echo "Installing compatible CMake..."
python -m pip install --no-cache-dir "cmake==3.31.6"

# Ensure the pip-installed CMake is used
export PATH="/opt/render/project/src/.venv/bin:$PATH"

echo "CMake location:"
which cmake
cmake --version

echo "Installing project dependencies..."
python -m pip install --no-cache-dir -r requirements.txt
