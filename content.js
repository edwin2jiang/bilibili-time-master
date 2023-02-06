const baseURL = 'https://fctest.appletest.cn'

async function req(url, method, data) {
  return await fetch(baseURL + url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      return response
    })
    .catch((error) => {
      console.error('Error:', error)
      return error
    })
}

const data = {
  sec: 0,
  days: [],
  limitSec: -1, // -1 代表不设置限制
}

// 获取今天的标准时间 yyyy-MM-dd
function getTodayFormatTime() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}-${month > 9 ? month : '0' + month}-${
    day > 9 ? day : '0' + day
  }`
}

function getFormatTime(time) {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}-${month > 9 ? month : '0' + month}-${
    day > 9 ? day : '0' + day
  }`
}

let isBlock = false

class EveryDayTime {
  constructor(date, sec) {
    this.date = date // 日期（yyyy/MM/dd）
    this.sec = sec // 使用秒数
  }
}

function isHaveToday(days, today) {
  for (let i = 0; i < days.length; i++) {
    if (days[i].date === today) {
      return true
    }
  }
  return false
}

// 秒数，格式化成小时和分钟
function convertSecond2HourMin(sec) {
  let hour = Math.floor(sec / 3600)
  let min = Math.floor((sec - hour * 3600) / 60)
  return `${hour}小时${min}分钟`
}

// 一个按钮，作用是打开一个本地页面
function createButton(text, onclick) {
  const button = document.createElement('button')
  button.innerText = text
  button.onclick = onclick
  return button
}

const timeTipDom = document.createElement('div')

// 程序主体
window.onload = async () => {
  console.log('B站时间管理大师启动了!')

  // 去除广告屏蔽-修改提示
  const adDom = document.querySelector('.adblock-tips')
  if (adDom) {
    adDom.style.display = 'none'
  }

  // 发送弹幕的元素位置向上抬起
  const sendBarrageDoms = document.querySelectorAll('.fixed-reply-box')
  if (sendBarrageDoms.length != 0) {
    console.log('sendBarrageDoms', sendBarrageDoms)
    sendBarrageDoms[0].style.bottom = '40px'
  }

  // 创建底部的今日使用时间提示
  timeTipDom.className = 'time-tip'
  document.querySelector('body').appendChild(timeTipDom)
  timeTipDom.innerText = `🕘 今日使用时长: 加载中...`

  // 从数据库中获取数据
  chrome.storage.sync.get(['BM_BID'], function (items) {
    const bid = items['BM_BID']

    if (!bid) return alert('请先点击插件, 设置B站的UID')

    // 加载每天的数据
    req('/dateUseTime/select?bid=' + bid, 'GET').then(async (res) => {
      res = await res.json()
      console.log('get use time', res)

      data.days = res || []

      // 从days从迭代出今天的数据，保存到data中
      const today = getTodayFormatTime()
      for (let i = 0; i < data.days.length; i++) {
        // console.log(getFormatTime(data.days[i].date) , today)

        if (getFormatTime(data.days[i].date) === today) {
          data.sec = data.days[i].sec
          break
        }
      }

      timeTipDom.innerText = `🕘 今日使用时长: ${convertSecond2HourMin(
        data.sec,
      )}`
      chrome.storage.sync.set({ BM_DATA: data }, function () {})
    })

    // 加载每日限额
    req('/user/getByBid?bid=' + bid, 'GET').then(async (res) => {
      res = await res.json()
      console.log('get limit time', res)
      data.limitSec = res.everyDayLimitSec

      chrome.storage.sync.set(
        { BM_LIMIT: res.everyDayLimitSec },
        function () {},
      )

      checkIsTimeOut()
    })
  })

  
}

/**
 * 检查是否超过限制
 */
function checkIsTimeOut() {
  chrome.storage.sync.get(['BM_LIMIT'], function (items) {
    const limitSec = items['BM_LIMIT']
    data.limitSec = limitSec
    // 检查是否超过限制
    if (parseInt(data.limitSec) !== -1 && data.sec > data.limitSec) {
      // 超过限制

      if (isBlock) {
        return
      }

      isBlock = true
      // 拦截用户访问
      document.querySelector('body').innerHTML = `
      <div class="block-page">
        <div>
          <h1>您已经超过了今日的使用时长限制</h1>
          <h2>请明天再来吧</h2>
        </div>
      </div>
    `
    }
  })
}


function renderLocalData() {
  data.sec += 5
  timeTipDom.innerText = `🕘 今日使用时长: ${convertSecond2HourMin(data.sec)}`

  chrome.storage.sync.get(['BM_DATA'], function (storage) {
    const localDataObj = storage['BM_DATA']

    if (localDataObj) {
      // 检测limitSec是否有变化
      if (localDataObj.limitSec !== data.limitSec) {
        data.limitSec = localDataObj.limitSec
      }
    }

    chrome.storage.sync.set({ BM_DATA: data }, function () {
      console.log('Settings saved')
    })

    checkIsTimeOut()
  })

  // 将数据保存到远程数据库

  if (data.sec % 60 !== 0) {
    // 每隔60秒保存一次
    return
  }

  chrome.storage.sync.get('BM_BID', function (items) {
    const bid = items['BM_BID']

    if (bid) {
      // 更新新的使用时间

      const postData = { bid, date: getTodayFormatTime(), sec: data.sec }

      console.log('更新新的使用时间', postData)

      req('/dateUseTime/addAndUpdate', 'POST', postData)
    }
  })
}

// 5秒钟更新一次本地时间
setInterval(renderLocalData, 5000)
