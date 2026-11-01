#!/usr/bin/env bash
# Seed the workspace with the v2 CRE-201 course in ./cre-201
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p cre-201
cp -r "$here/fixture/." cre-201/
