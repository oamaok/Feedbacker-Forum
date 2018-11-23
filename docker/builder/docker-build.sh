set -e
set -u

apk add --no-cache git

cd client
npm install
cd ../server
npm install

