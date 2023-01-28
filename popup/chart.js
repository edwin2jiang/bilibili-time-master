// import isBetween from './dayjs/plugin/isBetween';
const isBetween = window.dayjs_plugin_isBetween
dayjs.extend(isBetween)


document.addEventListener('DOMContentLoaded', function () {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
      (function () {
          var ln = links[i];
          var location = ln.href;
          ln.onclick = function () {
              chrome.tabs.create({active: true, url: location});
          };
      })();
  }
});

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

function changeData(arr) {
  columnChart.data.datasets[0].data = arr
  columnChart.update()
}

function numberToChinese(num) {
  const arr = ['日', '一', '二', '三', '四', '五', '六']
  return arr[num]
}

function renderData(todayDate) {
  // 1. 获取本地数据
  chrome.storage.sync.get(['BM_DATA'], function (items) {
    console.log('items', items['BM_DATA']['days'])

    const days = items['BM_DATA']['days']

    const boxDom = document.querySelector('.time-box')

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

      if (date.isBetween(start, end)) {
        arr[date.format('d')] = element.secs / 3600
      }
    })

    document.querySelector('#today-dom').innerHTML = `${dayjs(todayDate).format(
      'YYYY-MM-DD',
    )}, 星期${numberToChinese(week)}`


    function countAverage(arr){
      let sum = 0
      let count = 0
      arr.forEach(element => {
        if(element){
          sum += element
          count++
        }
      });
      return isNaN(sum / count) ? 0 : sum / count
       
    }
      
      
    document.querySelector('#average').innerHTML = `本周平均时长: ${countAverage(arr).toFixed(1)}小时`

    // 更新数据
    changeData(arr)
  })
}

let myRenderDate = dayjs().format('YYYY-MM-DD')

renderData(myRenderDate)

function handleClickPreviousDate(){
  myRenderDate = dayjs(myRenderDate).subtract(7, 'day')
  renderData(myRenderDate)
}

function handleClickNextDate(){
  myRenderDate = dayjs(myRenderDate).add(7, 'day')
  renderData(myRenderDate)
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'previous') {
    handleClickPreviousDate()
  } else if (e.target.id === 'next') {
    handleClickNextDate()
    console.log('next')
  }
})

function handleSetEverydayLimit(){
  
  const limit = document.querySelector('#limit').value
  console.log('limit', limit)

  chrome.storage.sync.get(['BM_DATA'], function (items) {
    // message('Settings retrieved', items);
    console.log('Settings retrieved', items['BM_DATA'])
    const localData = items['BM_DATA']

    // 将时间转化成秒数
    const time = limit.split(':')
    localData.limitSec = time[0] * 3600 + time[1] * 60


    console.log('localData',localData)
    chrome.storage.sync.set({ BM_DATA: localData }, function () {
      console.log('设置成功')
    })

  });

}


document.querySelector('#set-limit').addEventListener('click', handleSetEverydayLimit)

