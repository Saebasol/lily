import React, { useState, useEffect } from 'react'
import JSZip from 'jszip'
import saveAs from 'file-saver';


function App() {

  const [data, setData] = useState(0)
  // const headers = { 'Authorization': '' }

  // TODO: Change the user to selectively download using the url path, and change the folder and compressed file name
  async function mainFunc() {
    let zip = new JSZip()
    let imageFolder = zip.folder('1')

    const imageInfoResponse = await fetch('https://doujinshiman.ga/v3/api/hitomi/images/1', { headers })
    const imagesInfo = await imageInfoResponse.json()

    const downloadImage = imagesInfo.images.map(async (imageInfo, index) => {
      const image = await fetch(imageInfo.url)
      const imgBlob = await image.blob()

      // TODO: Get filename
      imageFolder.file(`${index}.png`, imgBlob)
      setData(index + 1)
    })

    Promise.all(downloadImage).then(() =>
      zip.generateAsync({ type: 'blob' })
        .then(content => {
          saveAs.saveAs(content, '1.zip')
        }))
  }

  useEffect(() => {
    mainFunc()
  }, [])

  return (
    <div className='App'>
      <h1>다운로드 중: {data}</h1>
    </div>

  )
}

export default App;
