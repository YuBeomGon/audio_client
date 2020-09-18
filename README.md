## ToDo

- [x] mimeType, 녹음 시간, sampleRate 설정, selectBox
- [x] socket url 주소 입력
- [x] socket 주소 입력 받을 수 있는 창
- [ ] 구글 speech to text
- [ ] 네이버 csr

## 오디오 테스트 1

- `mimeType` 설정 가능 : `opus , pcm`
- `녹음 시간` 설정 가능 : `10, 20, 30` 초
- `sampleRate` 설정 가능 : `44.1kHz, 48.0kHz, 20.0kHz`

## 오디오 테스트 2

- 구글 speech to text token 발행 (1시간마다 refresh 필요)
- 구글 speech to text 연동 x

## 사용방법

`mimeType, 녹음 시간, sampleRate` 를 설정하고 `START RECORDING` 버튼 클릭  
해당 시간이 지나면 `자동 녹음 종료`  
`DOWNLOAD 버튼`을 클릭하여 다운 or `소켓 url 주소`를 입력한 후 소켓 통신
