set -e

export PATH="./node_modules/.bin:$PATH"
export componentsDir=components

npm i @node-lambdas/cli
mkdir tmpdir/

for library in $(ls -1 $componentsDir/*.mjs); do
  cat $componentsDir/$library | fn es-minify --module true > tmpdir/$library
  mv tmpdir/$library $componentsDir/$library
done

tar -cz -f - -C $componentsDir . | curl -sS -H 'Authorization: '$DEPLOY_API_KEY $DEPLOY_API_URL --data-binary @-

