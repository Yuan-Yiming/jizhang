// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const comm = db.command
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const where = {
      _openid: comm.eq(event._openid),
      date_str: comm.lte(event.endTime).and(comm.gte(event.startTime))
    }
    // 先取出集合记录总数
    console.log('yun1:', where)
    const countResult = await db.collection('jizhang_item').where(where).count()
    // console.log('yun2:', countResult)
    const total = countResult.total
    console.log('yun3:', total)
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('jizhang_item').orderBy('date_str', 'desc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).where(where).get()
      tasks.push(promise)
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
            data: acc.data.concat(cur.data),
            errMsg: acc.errMsg,
        }
    })
  } catch (e) {
    console.error(e)
  }
}