#!/bin/bash

# 単体テストの名前変更（.test.ts(x)を.unit.test.ts(x)に）
for file in $(find src -type f -name "*.test.ts" -o -name "*.test.tsx"); do
  if [[ ! $file =~ \.unit\.test\. && ! $file =~ \.integration\.test\. && ! $file =~ \.e2e\.test\. && ! $file =~ \.playwright\.test\. ]]; then
    newname=$(echo $file | sed 's/\.test\./\.unit\.test\./g')
    git mv "$file" "$newname"
    echo "Renamed: $file -> $newname"
  fi
done

# Playwrightテストの名前変更（.playwright.test.tsを.e2e.test.tsに）
for file in $(find src -type f -name "*.playwright.test.ts"); do
  newname=$(echo $file | sed 's/\.playwright\.test\./\.e2e\.test\./g')
  git mv "$file" "$newname"
  echo "Renamed: $file -> $newname"
done

# e2e-userテストの名前変更（.e2e-user.test.tsを.e2e.test.tsに）
for file in $(find src -type f -name "*.e2e-user.test.ts"); do
  newname=$(echo $file | sed 's/\.e2e-user\.test\./\.e2e\.test\./g')
  git mv "$file" "$newname"
  echo "Renamed: $file -> $newname"
done

echo "Test file renaming completed." 