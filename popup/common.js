const baseURL = 'https://fctest.appletest.cn'

export async function req(url, method, data) {
  return await fetch(baseURL + url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response && response.status === 200) {
        return response.json()
      }
    })
    .catch((error) => {
      console.error('Error:', error)
      return error
    })
}
