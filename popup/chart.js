import { req } from './common.js'

const isBetween = window.dayjs_plugin_isBetween
dayjs.extend(isBetween)

/**
 * 让所有的 a 标签在新标签页打开
 */
document.addEventListener('DOMContentLoaded', function () {
  var links = document.getElementsByTagName('a')
  for (var i = 0; i < links.length; i++) {
    ;(function () {
      var ln = links[i]
      var location = ln.href
      ln.onclick = function () {
        chrome.tabs.create({ active: true, url: location })
      }
    })()
  }
})

const ctx = document.getElementById('myChart')

const columnChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['日', '一', '二', '三', '四', '五', '六'],
    datasets: [
      {
        label: '使用时长（小时）',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
})

/**
 * 切换展示的时间
 * @param {*} arr
 */
function changeData(arr) {
  columnChart.data.datasets[0].data = arr
  columnChart.update()
}

/**
 * 日期转成中文
 * @param {*} num
 * @returns
 */
function numberToChinese(num) {
  const arr = ['日', '一', '二', '三', '四', '五', '六']
  return arr[num]
}

/**
 * 渲染图表数据
 * @param {} todayDate
 */
function renderData(todayDate) {
  // 1. 获取本地数据
  chrome.storage.sync.get(['BM_DATA'], function (items) {

    // 如果不存在数据，直接返回
    if (!items['BM_DATA']) {
      return
    }

    const days = items['BM_DATA']['days']

    console.log('查询到了该用户的数据: ', days)

    // 2. 更新图表
    const arr = []
    // 获取今天的日期和星期
    // const today = new Date().toLocaleDateString()
    const week = dayjs(todayDate).format('d')

    // 查询本周的数据
    const start = dayjs(todayDate).subtract(week, 'day')
    const end = dayjs(todayDate).add(7 - week, 'day')

    days.forEach((element) => {
      const date = dayjs(element.date)

      console.log('date',date.format("YYYY-MM-DD"), date.isBetween(start, end))

      if (date.isBetween(start, end)) {
        arr[date.format('d')] = element.sec / 3600
      }
    })

    document.querySelector('#today-dom').innerHTML = `${dayjs(todayDate).format(
      'YYYY-MM-DD',
    )}, 星期${numberToChinese(week)}`

    function countAverage(arr) {
      let sum = 0
      let count = 0
      arr.forEach((element) => {
        if (element) {
          sum += element
          count++
        }
      })
      return isNaN(sum / count) ? 0 : sum / count
    }

    document.querySelector(
      '#average',
    ).innerHTML = `本周平均时长: ${countAverage(arr).toFixed(1)}小时`

    // 更新数据
    changeData(arr)
  })
}

let myRenderDate = dayjs().format('YYYY-MM-DD')

renderData(myRenderDate)

function handleClickPreviousDate() {
  myRenderDate = dayjs(myRenderDate).subtract(7, 'day')
  renderData(myRenderDate)
}

function handleClickNextDate() {
  myRenderDate = dayjs(myRenderDate).add(7, 'day')
  renderData(myRenderDate)
}

/**
 * 点击上一个和下一个事件
 */
document.addEventListener('click', (e) => {
  if (e.target.id === 'previous') {
    handleClickPreviousDate()
  } else if (e.target.id === 'next') {
    handleClickNextDate()
    console.log('next')
  }
})


