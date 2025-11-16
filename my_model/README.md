# 📦 Teachable Machine 모델 폴더

이 폴더에는 TensorFlow.js 형식의 Teachable Machine 모델 파일이 들어갑니다.

## 필요한 파일

```
my_model/
├── model.json          # 모델 아키텍처
├── metadata.json       # 클래스 레이블 및 메타데이터
└── weights.bin         # 모델 가중치 (또는 여러 개의 group 파일)
```

## 모델 준비 방법

### 1. Teachable Machine에서 모델 생성

1. https://teachablemachine.withgoogle.com/ 접속
2. "Image Project" 선택
3. "Standard image model" 선택

### 2. 데이터 수집 및 훈련

#### 권장 클래스:
- **Normal**: 정상 피부
- **Acne**: 여드름
- **Eczema**: 습진
- **Rash**: 발진
- **Mole**: 점/색소침착

#### 각 클래스당 권장 이미지 수:
- 최소: 50장
- 권장: 100-200장
- 최적: 500장 이상

#### 데이터 다양성:
- 다양한 조명 조건
- 다양한 각도
- 다양한 피부톤
- 다양한 중증도

### 3. 모델 훈련

- Epochs: 50-100 (권장)
- Batch size: 16 또는 32
- Learning rate: 0.001 (기본값)

### 4. 모델 내보내기

1. "Export Model" 클릭
2. "TensorFlow.js" 탭 선택
3. "Download my model" 클릭
4. 다운로드한 파일을 이 폴더(`my_model/`)에 배치

## 데모 모드

모델 파일이 없어도 웹사이트는 **데모 모드**로 작동합니다:
- 랜덤 예측 결과 생성
- UI 및 기능 테스트 가능
- 실제 AI 예측은 불가능

## 모델 성능 개선 팁

### 1. 데이터 증강
- 회전 (±15도)
- 밝기 조절 (±20%)
- 대비 조절
- 수평 뒤집기

### 2. 품질 관리
- 흐릿한 이미지 제거
- 너무 어두운 이미지 제거
- 관련 없는 배경 제거
- 일관된 크기 유지

### 3. 밸런싱
- 각 클래스당 비슷한 이미지 수
- 언더샘플링 또는 오버샘플링

### 4. 검증
- Train/Test 분할: 80/20
- 교차 검증
- 혼동 행렬(Confusion Matrix) 확인

## 성능 벤치마크

### 목표 성능:
- 정확도: 80% 이상
- 각 클래스별 Precision: 75% 이상
- 각 클래스별 Recall: 75% 이상

### 실시간 예측 속도:
- 데스크톱: < 1초
- 모바일: < 3초

## 문제 해결

### Q: "Failed to load model" 에러
**A**: 
- 파일 경로 확인 (`my_model/model.json`)
- 로컬 서버로 실행 (file:// 프로토콜 사용 금지)
- CORS 설정 확인

### Q: 예측 정확도가 낮음
**A**:
- 더 많은 훈련 데이터 수집
- 데이터 품질 개선
- Epochs 증가
- 다양한 조명/각도 데이터 추가

### Q: 모바일에서 느림
**A**:
- 이미지 리사이징 (최대 224x224)
- 더 작은 모델 사용
- 웹 워커(Web Worker) 사용 고려

## 대체 모델 소스

Teachable Machine 외에도 다음 옵션을 고려할 수 있습니다:

1. **TensorFlow Lite**: 모바일 최적화
2. **ONNX.js**: 크로스 플랫폼
3. **Custom TensorFlow.js 모델**: 완전한 제어

## 법적 고지

⚠️ **중요**: 의료용 AI 모델 개발 시 주의사항
- 의료 기기 규제 확인 (FDA, CE 마크 등)
- 데이터 프라이버시 규정 준수 (HIPAA, GDPR)
- 임상 검증 필요
- 전문의 감독 필수

이 프로젝트는 **교육 목적**으로만 사용되어야 합니다.

---

**팁**: 모델을 업데이트할 때마다 버전 관리를 하세요!
- `my_model_v1/`, `my_model_v2/` 형식으로 폴더 구분
- Git LFS 사용 권장 (파일 크기가 큰 경우)