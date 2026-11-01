#!/usr/bin/env bash
# Seed the workspace with the workshop sample in ./lease-course, with the
# ID comments removed from the outline so that the sync has work to do.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p lease-course
cp -r "$here/../../examples/courses/workshop/." lease-course/
sed -i '/^<!-- id: .* -->$/d' lease-course/02-design/course-outline.md
