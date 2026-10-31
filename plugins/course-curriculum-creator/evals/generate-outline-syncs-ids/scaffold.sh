#!/usr/bin/env bash
# Seed the workspace with a v2 course (no course.yaml) in ./lease-course
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p lease-course
cp -r "$here/fixture/." lease-course/
