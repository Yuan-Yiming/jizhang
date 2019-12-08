// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const autoRecord = db.collection('autoRecord')  // 自动记账
const record = db.collection('jizhang_item')   // 账单
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 先取出集合记录总数
    const count = await autoRecord.count()
    const total = count.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = aotuRecord.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    // 获取所有定时所有任务列表
    let autoRecordTask = await Promise.all(tasks)

    for (let task of autoRecordTask) {
      //
    }
    
  } catch (e) {
    console.error(e)
  }
}