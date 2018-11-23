set -e
set -u

cp docker/production/api/config.json .
mkdir -p server/build
node misc/dump-version.js > server/build/version.json

