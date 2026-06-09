set -e

npm i @node-lambdas/cli

export baseDir=components
export PATH="./node_modules/.bin:$PATH"

for scope in $(ls -1 $baseDir); do
  echo "Publishing components from $scope"
  tar -cz -f - -C $baseDir/$scope --exclude node_modules/ --exclude .git/ --exclude tmp/ . | curl -sS -H 'Authorization: '$DEPLOY_API_KEY $DEPLOY_API_URL --data-binary @-
done

export baseDir=libraries
echo "---"
for scope in $(ls -1 $baseDir); do
  echo "Entering $scope"
  for library in $(ls -1 $baseDir/$scope); do
    name=$(echo $library | sed s/.mjs//)
    echo -n "Publishing $scope/$name... "
    cat $baseDir/$scope/$library | fn es-minify --module true | curl -sS --fail -H "Authorization: $CDN_API_KEY" $CDN_API_URL/library/$scope/$name@latest --data-binary @-
  done
done