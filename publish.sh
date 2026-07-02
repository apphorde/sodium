set -e

export PATH="$PWD/node_modules/.bin:$PATH"

npm i @node-lambdas/cli
mkdir tmpdir/
cd components

for library in $(ls -1 *.mjs); do
  cat $library | fn es-minify --module true > ../tmpdir/$library
  mv ../tmpdir/$library ./$library
done

tar -cz -f - . | curl -sS -H 'Authorization: '$DEPLOY_API_KEY $DEPLOY_API_URL --data-binary @-

