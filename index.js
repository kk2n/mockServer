const { mapKeys } = require('lodash')
const { readdirSync } = require('fs')
const { mock } = require('mockjs')
const jsonServer = require('json-server')

module.exports = function(config) {
  //API目录
  let dir = config.dir
  //数据
  let data = {}
  let methodArr = {}
  //自动获取api文件
  readdirSync(dir).forEach(file => Object.assign(data, require(`${dir}\/${file}`)))
  //创建jsonServer
  data = mapKeys(data, (val, key) => {
    let path = (key.split(' ')[1] || '').replace('/', '').replace(/\//g, '_')
    if (path) {
      methodArr[path] = key.split(' ')[0]
    }
    //返回带_的路径
    return path
  })
  //复制数据
  let tempData = { ...data }
  let router = jsonServer.router(data)
  router.render = (req, res) => {
    let pathUrlData = req.url.split('?')[0].replace('/', '')
    let pathMethod = (methodArr[pathUrlData] || '').toUpperCase()
    if (!pathMethod) {
      res.jsonp({ msg: '404，资源未找到！', code: '404404' })
    } else if (pathMethod !== req.method) {
      res.jsonp({ msg: '请求方式不正确！', code: '999999' })
    } else if (200 <= res.statusCode <= 299) {
      res.jsonp(
        mock({
          msg: '默认消息',
          code: '000000',
          ...(config.defaultData ? config.defaultData : {}),
          ...tempData[pathUrlData]
        })
      )
    } else {
      res.jsonp(
        mock({
          msg: `出现异常错误！错误码statusCode:${res.statusCode}`,
          ...(config.defaultData ? config.defaultData : {}),
          ...tempData[pathUrlData]
        })
      )
    }
  }
  this.server = jsonServer.create()
  this.server.use(jsonServer.defaults())
  // //定义response
  this.server.use(
    config.request ||
      function(res, req, next) {
        next()
      }
  )
  //定义路由规则
  this.server.use(
    jsonServer.rewriter({
      '/db/*/*/*/*/*/*/*': '/$1_$2_$3_$4_$5_$6_$7',
      '/db/*/*/*/*/*/*': '/$1_$2_$3_$4_$5_$6',
      '/db/*/*/*/*/*': '/$1_$2_$3_$4_$5',
      '/db/*/*/*/*': '/$1_$2_$3_$4',
      '/db/*/*/*': '/$1_$2_$3',
      '/db/*/*': '/$1_$2',
      '/db/*': '/$1',
      ...(config.router ? config.router : {})
    })
  )
  this.server.use(router)
}

// 例子

// const { port } = require('yargs').argv
// const MockServer = require('mockServer')
// const { join } = require('path')
// const mockServer = new MockServer({
//   dir: `${join(__dirname)}/mock`,
//   defaultData: { code: '000000'},
//   request(req, res, next) {},
//   router: {
//     '/db/*/*/*/*/*/*': '/$1_$2_$3_$4_$5_$6',
//     '/db/*/*/*/*/*': '/$1_$2_$3_$4_$5',
//     '/db/*/*/*/*': '/$1_$2_$3_$4',
//     '/db/*/*/*': '/$1_$2_$3',
//     '/db/*/*': '/$1_$2',
//     '/db/*': '/$1'
//   }
// })
// mockServer.server.listen(port, () => console.log(`API服务器：localhost:${port}`))
