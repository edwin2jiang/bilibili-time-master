console.log('popup')

chrome.storage.sync.get(['BM_DATA'], function(items) {
  console.log('items',items['BM_DATA']['days'])
  
  const days = items['BM_DATA']['days']

  const boxDom = document.querySelector('.time-box')

  // 添加序列
  days.forEach(element => {
    const liDom = document.createElement('li')
    liDom.innerText = element.date + "  " + element.secs
    boxDom.append(liDom)
  });
});