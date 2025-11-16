# 🎒 Skin Triage in Your Backpack - 개선된 버전

Team G20의 피부 트리아지 AI 웹 서비스 개선 버전입니다.

## 📋 Week 12 피드백 반영 사항

### ✅ 구현된 개선사항

1. **결과 설명 추가** (Fix 1)
   - 각 피부 카테고리별 상세 설명 제공
   - 확률값에 대한 시각적 표현

2. **이미지 가이드** (Fix 2)
   - 업로드 전 촬영 가이드라인 표시
   - "밝고 선명한 사진 사용" 안내 메시지

3. **실시간 밝기 감지** (Fix 6)
   - 업로드된 이미지의 평균 밝기 자동 분석
   - 어두운 사진일 경우 경고 배지 표시

4. **재촬영 유도 UI** (Fix 4)
   - 신뢰도 70% 미만일 때 재촬영 안내
   - 구체적인 개선 방법 제시

5. **첫 사용자 튜토리얼** (Fix 5)
   - 첫 방문 시 3단계 사용 안내
   - 도움말 버튼으로 언제든 다시 확인 가능

6. **모바일 최적화** (Fix 3)
   - 반응형 디자인 적용
   - 큰 글씨와 터치하기 쉬운 버튼

7. **의료 면책 조항**
   - 교육 목적임을 명시
   - 전문의 상담 권장 안내

8. **상위 3개 예측 결과**
   - 시각적 확률 바 차트
   - 각 카테고리별 백분율 표시

## 🚀 설치 및 실행 방법

### 1. 파일 구조
```
skin-triage/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # JavaScript 로직
├── README.md           # 이 파일
└── my_model/           # Teachable Machine 모델 폴더
    ├── model.json
    ├── metadata.json
    └── weights.bin
```

### 2. Teachable Machine 모델 준비

#### 옵션 A: 본인의 모델 사용 (권장)
1. [Teachable Machine](https://teachablemachine.withgoogle.com/)에서 이미지 모델 훈련
2. "Export Model" 클릭
3. "TensorFlow.js" 탭 선택
4. "Download" 클릭하여 모델 파일 다운로드
5. `my_model/` 폴더를 생성하고 파일 배치:
   ```
   my_model/
   ├── model.json
   ├── metadata.json
   └── weights.bin (또는 여러 개의 group 파일)
   ```

#### 옵션 B: 데모 모드 사용
- 모델 파일이 없어도 데모 모드로 작동합니다
- 랜덤 예측 결과를 생성하여 UI 테스트 가능
- `script.js`의 `isModelLoaded` 플래그가 자동으로 처리

### 3. 로컬 서버 실행

#### Python 사용
```bash
# Python 3
cd skin-triage
python -m http.server 8000

# 브라우저에서 http://localhost:8000 접속
```

#### Node.js 사용
```bash
# http-server 설치 (처음 한 번만)
npm install -g http-server

# 서버 실행
cd skin-triage
http-server -p 8000

# 브라우저에서 http://localhost:8000 접속
```

#### VS Code Live Server 사용
1. VS Code에서 "Live Server" 확장 설치
2. `index.html` 파일에서 우클릭
3. "Open with Live Server" 선택

### 4. GitHub Pages 배포

1. GitHub 저장소 생성
2. 파일 업로드:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```

3. GitHub 저장소 설정:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / root
   - Save 클릭

4. 배포 완료 후 URL 확인:
   - `https://USERNAME.github.io/REPO_NAME/`

## 🎨 커스터마이징

### 피부 카테고리 수정

`script.js`의 `categoryDescriptions` 객체를 수정하세요:

```javascript
const categoryDescriptions = {
    "카테고리명": {
        description: "상세 설명",
        recommendation: [
            "권장사항 1",
            "권장사항 2"
        ]
    }
};
```

### 색상 테마 변경

`style.css`의 CSS 변수를 수정하세요:

```css
:root {
    --primary-color: #4A90E2;      /* 메인 색상 */
    --secondary-color: #50C878;    /* 보조 색상 */
    --warning-color: #FF9800;      /* 경고 색상 */
    --error-color: #E74C3C;        /* 에러 색상 */
}
```

### 신뢰도 임계값 조정

`script.js`의 `displayResults` 함수에서:

```javascript
// 현재: 70% 미만일 때 재촬영 안내
if (confidence < 70) {
    retryPrompt.style.display = 'block';
}

// 더 엄격하게: 80% 미만
if (confidence < 80) {
    retryPrompt.style.display = 'block';
}
```

## 📱 지원 브라우저

- ✅ Chrome 90+ (권장)
- ✅ Safari 14+ (iOS 포함)
- ✅ Firefox 88+
- ✅ Edge 90+
- ⚠️ IE 11 미지원

## 🐛 알려진 이슈 및 해결 방법

### 1. 모델 로드 실패
**증상**: "AI 모델을 불러오는데 실패했습니다" 에러

**해결방법**:
- `file://` 프로토콜 사용 금지 → 반드시 로컬 서버 사용
- `my_model/` 폴더 경로 확인
- 브라우저 콘솔(F12)에서 CORS 에러 확인

### 2. iOS Safari에서 업로드 버튼 작동 안 함
**해결방법**:
- `accept="image/*"` 속성 확인
- iOS 13 이상 권장

### 3. 예측 속도가 느림
**원인**: 
- 대용량 이미지 (5MB 이상)
- 느린 네트워크

**해결방법**:
- 이미지 리사이징 추가 (canvas API 사용)
- 모델 최적화 (Teachable Machine에서 작은 모델 사용)

## 🔒 보안 및 프라이버시

### 데이터 처리
- ✅ **모든 이미지 처리는 브라우저에서 로컬 실행**
- ✅ 서버로 이미지가 전송되지 않음
- ✅ 개인정보 수집 없음
- ⚠️ 브라우저 캐시에 임시 저장될 수 있음

### 권장사항
- 민감한 의료 정보를 포함한 이미지 사용 주의
- 프로덕션 환경에서는 HTTPS 사용 필수

## 📊 사용성 테스트 결과

### Week 12 테스트 (6명)
- **성공률**: T1(업로드) 83%, T2(저품질 테스트) 33%, T3(확률 해석) 50%
- **평균 소요 시간**: T1 45초, T2 30초, T3 90초
- **주요 문제**: 어두운 사진, 신뢰도 해석 어려움, 고령 사용자 UI 이해 지연

### 개선 효과 (Week 13 예상)
- 밝기 경고로 저품질 업로드 50% 감소 예상
- 튜토리얼로 초기 이해도 30% 향상 예상
- 재촬영 UI로 최종 성공률 90% 이상 달성 예상

## 📈 향후 개선 계획

### Week 13 우선순위
1. ✅ 고령 사용자 온보딩 개선 (완료)
2. ⏳ 접근성 기능 (스크린 리더)
3. ⏳ 다국어 지원 (영어)
4. ⏳ 이미지 자동 리사이징

### Week 14 계획
1. 결과 히스토리 저장 (localStorage)
2. PDF 리포트 다운로드
3. 의료기관 연결 링크
4. PWA 변환 (오프라인 지원)

## 🤝 기여자

**Team G20**
- Sihoon An
- Woohyeong Park
- Yeonjong Kim
- Kawoo Park
- Juwon Son

## 📄 라이선스

이 프로젝트는 교육 목적으로만 사용되며, 실제 의료 진단 용도로 사용해서는 안 됩니다.

## 📞 지원

문제가 발생하면:
1. [Issues](https://github.com/yeon-jong/skin-page/issues)에 문의
2. Week 12 리포트의 Known Issues 섹션 참고
3. 브라우저 콘솔(F12)에서 에러 메시지 확인

---

**마지막 업데이트**: 2024 Week 13  
**버전**: v2.0 (개선 버전)