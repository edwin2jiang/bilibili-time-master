const data = {
  sec: 0,
  days: [],
}

class EveryDayTime {
  constructor(date, secs) {
    this.date = date // 日期（yyyy-MM-dd）
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
function convertSecond2HourMin(sec){
  let hour = Math.floor(sec / 3600)
  let min = Math.ceil((sec - hour * 3600) / 60)
  return `${hour}小时${min}分钟`
}

const timeTipDom = document.createElement('div')

// 去除插件修改提示
window.onload =async () => {
  // 创建一个新的元素
  timeTipDom.className = 'time-tip'
  document.querySelector('.adblock-tips').style.display = 'none'

  document.querySelector('.adblock-tips').parentElement.appendChild(timeTipDom)
  
  timeTipDom.innerText = `🕘 今日使用时长: 加载中...`
  timeTipDom.style = 'width: 100%; height: 30px; line-height: 30px; padding: 0 30px; background: #fff0e3; font-size: 13px; z-index: 9999; display: flex; justify-content: center; align-items: center; color: #e58900; position: fixed; bottom: 0;'
}

// 5秒钟更新一次本地时间
setInterval(() => {
  data.sec += 5
  console.log(data.sec)
  localStorage.setItem('BM_DATA', JSON.stringify(data))
  timeTipDom.innerText = `🕘 今日使用时长: ${convertSecond2HourMin(data.sec)}`
}, 5000)
