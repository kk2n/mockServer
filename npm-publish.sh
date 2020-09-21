#!/usr/bin/env bash

echo "请输入你的新发布的版本号(ex:1.0.0)："

read version

# 处理 package.json
sed -i -e "s/\"version\": \(.*\)/\"version\": \"$version\",/g" 'package.json'
if [ -f "package.json-e" ];then
  rm 'package.json-e'
fi
echo '版本号修改成功'

npm config get registry # 检查仓库镜像库

npm config set registry=http://registry.npmjs.org # 设置仓库镜像库: 淘宝镜像https://registry.npm.taobao.org

echo '请进行登录相关操作：'

npm login # 登陆

echo "-------publishing-------"

npm publish # 发布

npm config set registry=https://registry.npm.taobao.org # 设置为淘宝镜像

echo "完成"
exit