const data = {
  sec: 0,
  days: [],
  limitSec: -1, // -1 代表不设置限制
}

let isBlock = false

class EveryDayTime {
  constructor(date, secs) {
    this.date = date // 日期（yyyy/MM/dd）
    this.secs = secs // 使用秒数
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

  // 创建一个新的元素
  timeTipDom.className = 'time-tip'
  document.querySelector('body').appendChild(timeTipDom)

  timeTipDom.innerText = `🕘 今日使用时长: 加载中...`

  // const analysisBtn = createButton('数据统计', () => {
  //   // window.open(chrome.runtime.getURL('index.html'))
  //   chrome.tabs.create({url: chrome.extension.getURL('index.html')});
  // })

  // timeTipDom.appendChild(analysisBtn)

  // 从本地存储中获取数据
  let localData = null

  chrome.storage.sync.get(['BM_DATA'], function (items) {
    // message('Settings retrieved', items);
    console.log('Settings retrieved', items['BM_DATA'])
    localData = items['BM_DATA']

    console.log('this localData', localData)

    if (localData) {
      const localDataObj = localData

      data.sec = localDataObj.sec
      data.days = localDataObj.days

      const today = new Date().toLocaleDateString()

      if (!isHaveToday(data.days, today)) {
        data.days.push(new EveryDayTime(today, 0))
        data.sec = 0

        console.log('没有今天数据')

        chrome.storage.sync.set({ BM_DATA: data }, function () {
          console.log('Settings saved')
        })
      } else {
        console.log('有今天数据')

        // 已经有了今天的数据，更新今天的数据
        for (let i = 0; i < data.days.length; i++) {
          if (data.days[i].date === today) {
            data.sec = data.days[i].secs
          }
        }
      }

      timeTipDom.innerText = `🕘 今日使用时长: ${convertSecond2HourMin(
        data.sec,
      )}`

      // 检查是否超过时间限制

      if (localDataObj.limitSec !== data.limitSec) {
        data.limitSec = localDataObj.limitSec
      }

      checkIsTimeOut()
    }

    timeTipDom.style = ''
  })
}

function checkIsTimeOut() {
  // 检查是否超过限制
  if (parseInt(data.limitSec) !== -1 && data.sec > data.limitSec) {
    // 超过限制
    // timeTipDom.style = 'color: red'

    if(isBlock){
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
}

// 5秒钟更新一次本地时间
setInterval(() => {
  // data.sec += 5
  // console.log(data.sec)

  const today = new Date().toLocaleDateString()
  if (!isHaveToday(data.days, today)) {
    data.days.push(new EveryDayTime(today, 0))
    data.sec = 0
  } else {
    // 已经有了今天的数据，更新今天的数据
    for (let i = 0; i < data.days.length; i++) {
      if (data.days[i].date === today) {
        data.days[i].secs += 5
        data.sec = data.days[i].secs
      }
    }
  }

  console.log('data', data)

  // localStorage.setItem('BM_DATA', JSON.stringify(data))

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

  timeTipDom.innerText = `🕘 今日使用时长: ${convertSecond2HourMin(data.sec)}`
}, 5000)
