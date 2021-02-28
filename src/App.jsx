import React, { useState, useEffect } from 'react'
import JSZip from 'jszip'
import saveAs from 'file-saver'
import api from './api'


function App() {

  const [index, setIndex] = useState(0)
  const downloadIndex = window.location.pathname.replace("/", "")

  async function mainFunc() {
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
