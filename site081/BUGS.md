# BUGS - site081 (비디오 스트리밍 취약점)

이 프로젝트는 동영상 스트리밍 및 부분 데이터 요청 처리에 대한 백엔드 로직 결함을 탐지하기 위한 테스트베드입니다.

### site081-bug01
- **유형**: range-offset-miscalculation (Range 오프셋 계산 오류)
- **API**: `GET /api/video/stream`
- **증상**: 클라이언트가 요청한 `Range: bytes=start-end` 구간과 실제 반환되는 바이트 구간이 일치하지 않음.

### site081-bug02
- **유형**: chunk-boundary-loss (청크 경계 손실)
- **API**: `GET /api/video/stream`
- **증상**: 데이터를 청크 단위로 스트리밍하는 과정에서 특정 구간의 바이트가 유실되어 수신 데이터의 연속성이 깨짐.

### site081-bug03
- **유형**: partial-length-mismatch (부분 응답 길이 불일치)
- **API**: `GET /api/video/stream`
- **증상**: 응답 헤더의 `Content-Length` 값과 실제 전송되는 응답 본문(Body)의 바이트 길이가 일치하지 않음.

### site081-bug04
- **유형**: premature-stream-termination (스트림 조기 종료)
- **API**: `GET /api/video/stream`
- **증상**: 전체 데이터를 모두 전송하기 전에 서버 측에서 강제로 연결을 종료하여 스트리밍이 중단됨.
