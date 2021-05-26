import * as React from 'react'
import JSZip from 'jszip'
import saveAs from 'file-saver'
import api from './api'

import {
  ChakraProvider,
  extendTheme,
  Progress,
  Flex,
  Heading,
  Text
} from '@chakra-ui/react'


const theme = extendTheme({
  fonts: {
    heading: 'Inter, Noto Sans KR',
    body: 'Inter, Noto Sans KR'
  },
  initialColorMode: 'dark'
})

function getProgress(now, total){
  return now / total * 100
}

function App() {
  const { useState, useEffect } = React
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(0)
  const [tries, setTries] = useState(0)
  const [isCompress, setIsCompress] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  async function mainFunc() {
    const params = new URLSearchParams(window.location.search)
    const downloadIndex = params.get("index")

    if (!downloadIndex || Number.isNaN(downloadIndex)) {
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
      const imagesInfo = imageInfoResponse.json()
  
      let count = 0
      let failedCount = 0
      let tries = 0
      let total = 0

      let failedList = []

      async function getImage(url, filename) {
        let image
        try{
          image = await fetch(url)
        } catch (e){
          failedList.push({"url":url, "filename":filename})
          failedCount++
          setFailed(failedCount)
        }
        if(image){
          const imgBlob = await image.blob()
          imageFolder.file(filename, imgBlob)
          count++
          setProgress(getProgress(count, total))
        }
      }

      const downloadImage = imagesInfo.files.map(async (imageInfo, index) => {
        total = imagesInfo.files.length
        await getImage(api + "proxy/" + imageInfo.image, imageInfo.name)
    })
      await Promise.all(downloadImage)
      while(failedList.length > 0){
        tries++
        setTries(tries)
        count = 0
        failedCount = 0
        total = failedList.length

        const tryFailed = failedList.map(async (failedDict) =>{
          failedList = failedList.filter(value =>{
            return value["url"] !== failedDict["url"] && value["filename"] !== failedDict["filename"]
          })
          return await getImage(failedDict["url"], failedDict["filename"], failedList.length)
        })
        await Promise.all(tryFailed)
      }
      
      setFailed(0)
      setIsCompress(true)
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs.saveAs(content, `${downloadIndex}.zip`)
      setIsComplete(true)
    }
  }

  useEffect(() => {
    mainFunc()
  }, [])

  return (
    <ChakraProvider theme={theme}>
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Flex direction="column" p={12} rounded={6}>
        {isComplete ? <Heading textAlign="center" mb={7}>다운로드 완료</Heading> : isCompress? <Heading textAlign="center" mb={7}>압축 중... (시간이 좀 걸릴수 도 있어요)</Heading> : <Heading textAlign="center" mb={7}>다운로드중... {Number((progress).toFixed(1))}%</Heading>}
        <Heading textAlign="center" mb={7}>재시도한 횟수{tries}회</Heading>
        <Heading textAlign="center" mb={7}>실패한 항목 수: {failed}개</Heading>
        <Text fontSize="3xl">실패할경우 실패한 항목만 다시 시도합니다.</Text>
        <Progress hasStripe value={progress}/>
        </Flex>
      </Flex>
    </ChakraProvider >
  );
}

export default App;
