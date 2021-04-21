import * as React from 'react'
import JSZip from 'jszip'
import saveAs from 'file-saver'
import api from './api'


function App() {
  const { useState, useEffect } = React

  const [index, setIndex] = useState(0)

  async function mainFunc() {
    const params = new URLSearchParams(window.location.search)
    const downloadIndex = params.get("index")

    if (!downloadIndex || !Number.isNaN(downloadIndex)) {
      alert("인자값이 주어지지 않았습니다!")
      return
    }
    if (window.confirm("브라우저의 한계로 많은 이미지는 다운로드 할수 없을수도 있습니다. 시도하시겠습니까?")) {
      const zip = new JSZip()
      const imageFolder = zip.folder(downloadIndex)

      const imageInfoResponse = await fetch(api + `hitomi/images/${downloadIndex}`)
      if (imageInfoResponse.status == 404) {
        alert("찾을수 없습니다.")
        return
      }
      const imagesInfo = await imageInfoResponse.json()

      let count = 0

      const downloadImage = imagesInfo.files.map(async (imageInfo, index) => {
        const image = await fetch(api + "proxy/" + imageInfo.image)
        const imgBlob = await image.blob()

        imageFolder.file(imageInfo.name, imgBlob)
        setIndex(count += 1)
      })

      await Promise.all(downloadImage)
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs.saveAs(content, `${downloadIndex}.zip`)
    }
  }

  useEffect(() => {
    mainFunc()
  }, [])

  return (
    <div className='App'>
      <h1>다운로드 중: {index}</h1>
    </div>

  )
}

export default App;
