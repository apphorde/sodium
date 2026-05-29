set -e

npm i @node-lambdas/cli

export baseDir=components
export PATH="./node_modules/.bin:$PATH"

for scope in $(ls -1 $baseDir); do
  echo "Entering $scope"
  for component in $(ls -1 $baseDir/$scope); do
    name=$(echo $component | sed s/.html//)
    echo -n "Publishing $scope/$name wrapper... "
    cat wrapper.mjs | curl -sS --fail -H "Authorization: $CDN_API_KEY" $CDN_API_URL/component/$scope/$name@latest --data-binary @-
    echo -n "Publishing $scope/$name template... "
    cat $baseDir/$scope/$component | curl -sS --fail -H "Authorization: $CDN_API_KEY" $CDN_API_URL/library/$scope/$name.html@latest --data-binary @-
  done
done

export baseDir=libraries
for scope in $(ls -1 $baseDir); do
  echo "Entering $scope"
  for library in $(ls -1 $baseDir/$scope); do
    name=$(echo $library | sed s/.mjs//)
    echo -n "Publishing $scope/$name... "
    cat $baseDir/$scope/$library | fn es-minify --module true | curl -sS --fail -H "Authorization: $CDN_API_KEY" $CDN_API_URL/library/$scope/$name@latest --data-binary @-
  done
done