import { req } from './common.js'
const duration = window.dayjs_plugin_duration
dayjs.extend(duration)


/**
 * 测试
 */
document.querySelector('.add-data').addEventListener('click', function () {
  chrome.storage.sync.clear();
})

/**
 * 绑定用户的BID
 */
document
  .querySelector('#bind-bid')
  .addEventListener('click', async function () {
    const bid = document.querySelector('#bid').value.trim()
    if (!bid) {
      return alert('bid 不能为空')
    }

    const data = { bid, everyDayLimitSec: -1 }

    // 在存储中记录下bid
    chrome.storage.sync.set({ BM_BID: bid }, function () {
      console.log('设置BID成功')
    })

    req('/user/add', 'POST', data).then((res) => {
      console.log('this data', res)

      window.location.reload()
    })

  })


// 程序正常执行
window.onload = function () {
  // 加载已经保存的BID
  chrome.storage.sync.get(['BM_BID', 'BM_LIMIT'], function (items) {
    console.log('Settings retrieved', items['BM_BID'])
    const bid = items['BM_BID']
    const BM_LIMIT = items['BM_LIMIT']
    

    if (!bid) {
      // 尚未绑定BID
      document.querySelector('.more').innerHTML = `
        <h2 style="color:red;text-align:center;">请先完成绑定UID</h2>
      `
      return
    }

    document.querySelector('#bid').value = bid


    // 加载每日限额
    if (BM_LIMIT) {
      const limit = dayjs.duration(BM_LIMIT * 1000).format('HH:mm')
      document.querySelector('#limit').value = limit
    }

  })


}


/**
 * 设置每天的限制
 */
function handleSetEverydayLimit() {
  const limit = document.querySelector('#limit').value
  console.log('limit', limit)

  // 将时间转化成秒数
  const time = limit.split(':')
  const limitSec = time[0] * 3600 + time[1] * 60


  chrome.storage.sync.get(['BM_BID'], function (items) {
    const bid = items['BM_BID']
    if(!bid) return

    // 将每日限额保存的数据库
    req('/user/update', 'POST', { bid, everyDayLimitSec: limitSec }, (res) => {
      console.log('res', res)
    })

    chrome.storage.sync.set({BM_LIMIT: limitSec}, function () {
      console.log('保存每日限额成功')
      alert('保存每日限额成功')
    })

  })
}

document
  .querySelector('#set-limit')
  .addEventListener('click', handleSetEverydayLimit)