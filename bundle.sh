#!/bin/bash

PKG_VERSION=$(node -p "require('./package.json').version")

echo "Generating manifest..."
d2-manifest package.json build/manifest.webapp

BUNDLE_NAME="kb-ovc-serv-widget-$PKG_VERSION.zip"

rimraf $BUNDLE_NAME
cd build || echo "You need to build first the app" && return
bestzip $BUNDLE_NAME *

mkdir bundle
mv $BUNDLE_NAME ./bundle
cd ..
