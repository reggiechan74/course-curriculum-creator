#!/usr/bin/env bash
# Seed the workspace with the cohort golden sample in ./course
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p course
cp -r "$here/../../examples/courses/cohort/." course/
