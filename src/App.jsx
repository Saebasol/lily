import * as React from 'react'
import JSZip from 'jszip'
import saveAs from 'file-saver'
import api from './api'


function App() {
  const { useState, useEffect } = React

  const [index, setIndex] = useState(0)
  const params = new URLSearchParams(window.location.search)
  const downloadIndex = params.get("index")


  async function mainFunc() {
    if (!downloadIndex || Number.isInteger(parseInt(downloadIndex))) {
      alert("인자값이 주어지지 않았습니다!")
    }
    if (window.confirm("언어의 한계로 많은 이미지는 다운로드 할수 없을수도 있습니다. 시도하시겠습니까?")) {
      const zip = new JSZip()
      const imageFolder = zip.folder(downloadIndex)

      const imageInfoResponse = await fetch(api + `api/hitomi/images/${downloadIndex}`)
      if (imageInfoResponse.status == 404) {
        alert("찾을수 없습니다.")
        return
      }
      const imagesInfo = await imageInfoResponse.json()

      let count = 0

      const downloadImage = imagesInfo.images.map(async (imageInfo, index) => {
        const image = await fetch(imageInfo.url)
        const imgBlob = await image.blob()

        imageFolder.file(imageInfo.filename, imgBlob)
        setIndex(count += 1)
      })

      await Promise.all(downloadImage).then(() =>
        zip.generateAsync({ type: 'blob' })
          .then(content => {
            saveAs.saveAs(content, `${downloadIndex}.zip`)
          }))
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
