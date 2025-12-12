// ===============================================
// [사용자 설정 영역] 모델 주소 (따옴표 필수!)
// model.json 파일이 있는 위치입니다.
const URL = "https://sihoonan123.github.io/Skin-triage_test/"; 
// ===============================================

let model, webcam, labelContainer, maxPredictions;
let surveyScore = 0; // 설문 점수 저장 변수

// --- 1. 설문 완료 및 시작 함수 ---
function finishSurvey() {
    // 1-1. 설문 값 읽어오기 (HTML 요소 ID 확인)
    const changeSelect = document.getElementById('q-change');
    const symptomSelect = document.getElementById('q-symptom');

    // 요소가 없을 경우를 대비한 안전 장치
    const changeVal = changeSelect ? parseInt(changeSelect.value) : 0;
    const symptomVal = symptomSelect ? parseInt(symptomSelect.value) : 0;

    // 1-2. 설문 점수 합산
    surveyScore = changeVal + symptomVal;
    console.log("설문 점수:", surveyScore);

    // 1-3. 화면 전환 (설문 숨기기 -> 메인 보이기)
    document.getElementById('survey-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';

    // 1-4. Teachable Machine 시작
    init();
}

// --- 2. Teachable Machine 초기화 (Init) ---
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        // 모델 로드
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    } catch (e) {
        alert("모델을 불러오는데 실패했습니다! URL을 확인해주세요.\n" + modelURL);
        return;
    }

    // 웹캠 설정
    const flip = true; 
    webcam = new tmImage.Webcam(200, 200, flip); 
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    // 웹캠 화면을 HTML에 붙이기
    const webcamContainer = document.getElementById("webcam-container");
    // 기존에 캔버스가 있다면 제거 (중복 방지)
    if (webcamContainer.hasChildNodes()) {
        webcamContainer.innerHTML = '';
        // 고스트 이미지가 지워지지 않도록 다시 추가해야 할 수도 있음
        // 하지만 여기선 appendChild로 canvas를 뒤에 붙이는 방식을 씀
        const ghostImg = document.createElement('img');
        ghostImg.id = 'ghost-image';
        ghostImg.src = '';
        ghostImg.style.display = 'none';
        // (CSS 스타일은 style.css에서 처리됨)
        webcamContainer.appendChild(ghostImg);
    }
    webcamContainer.appendChild(webcam.canvas);

    // [핵심] 고스트 이미지 불러오기 (이전 기록 확인)
    loadGhostImage();

    // 라벨 컨테이너(확률 표시) 생성
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // 초기화
    for (let i = 0; i < maxPredictions; i++) { 
        labelContainer.appendChild(document.createElement("div"));
    }
}

// --- 3. 반복 실행 (Loop) ---
async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

// --- 4. 예측 및 멀티모달 진단 (Predict) ---
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    // AI가 가장 높게 본 클래스 찾기
    let highestProb = 0;
    let bestClassName = "";

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = 
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        if (prediction[i].probability > highestProb) {
            highestProb = prediction[i].probability;
            bestClassName = prediction[i].className;
        }
    }

    // [멀티모달 통합 진단 로직]
    const resultDiv = document.getElementById('final-result');
    let message = "";
    let color = "black";
    let borderStyle = "1px solid #ddd";

    // A. AI 판단 
    // [주의] "Malignant" 부분은 실제 티처블 머신에 적은 클래스 이름(예: Class 1, Melanoma 등)으로 바꿔야 정확합니다.
    // 여기서는 확률이 60% 이상인 경우를 기준으로 삼았습니다.
    if (highestProb > 0.7) { 
        // 확률이 70% 이상이면 해당 클래스 이름을 보여줌
        message = `🤖 AI 분석: <b>${bestClassName}</b> (${(highestProb*100).toFixed(0)}%)`;
        if (bestClassName.toLowerCase().includes("malignant") || bestClassName.includes("위험")) {
             message = `🤖 AI 분석: <span style='color:red'>위험 의심 (${bestClassName})</span>`;
        }
    } else {
        message = "🤖 AI 분석: 판단 중...";
    }

    // B. 설문(Context) 반영 Fusion
    if (surveyScore >= 2) {
        message += "<br><br>🚨 <b>설문 경고:</b><br>급격한 변화나 증상이 있습니다.<br>AI 결과와 무관하게 <u>정밀 진단을 권장</u>합니다.";
        color = "#d9534f"; // 빨간색 계열
        borderStyle = "3px solid red";
    }

    resultDiv.innerHTML = message;
    resultDiv.style.color = color;
    resultDiv.style.border = borderStyle;
}

// --- 5. 현재 상태 저장 (시계열 데이터 구축) ---
function saveCurrentStatus() {
    // 현재 웹캠 화면을 이미지 데이터(Base64)로 변환
    const dataURL = webcam.canvas.toDataURL();
    
    // 브라우저 저장소(Local Storage)에 저장
    localStorage.setItem('myGhostImage', dataURL);
    
    alert("✅ 현재 상태가 저장되었습니다.\n다음에 접속하면 이 사진이 가이드로 뜹니다!");
}

// --- 6. 고스트 이미지 불러오기 ---
function loadGhostImage() {
    // 저장된 이미지가 있는지 확인
    const savedImage = localStorage.getItem('myGhostImage');
    
    if (savedImage) {
        // 이미지가 있다면 img 태그를 찾아서 src에 넣음
        // (init 함수에서 동적으로 생성하지 않고 HTML에 있는 것을 쓴다면 아래 방식 사용)
        let imgTag = document.getElementById('ghost-image');
        
        // 만약 HTML에 없고 JS에서 동적으로 처리했다면 다시 찾기
        if (!imgTag) {
            imgTag = document.querySelector('#webcam-container img');
        }

        const msgTag = document.getElementById('ghost-message');
        
        if (imgTag) {
            imgTag.src = savedImage;
            imgTag.style.display = 'block'; // 이미지 보이기
            if(msgTag) msgTag.style.display = 'block'; // 메시지 보이기
        }
    }
}