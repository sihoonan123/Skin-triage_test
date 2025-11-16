// 전역 변수
let model;
let maxPredictions;
let isModelLoaded = false;

// Teachable Machine 모델 URL (실제 프로젝트에서는 여기에 본인의 모델 URL을 넣으세요)
const MODEL_URL = "./my_model/";

// 피부 카테고리별 설명 (실제 모델의 클래스에 맞게 수정하세요)
const categoryDescriptions = {
    "Normal": {
        description: "정상적인 피부 상태입니다. 현재 특별한 문제가 발견되지 않았습니다.",
        recommendation: [
            "규칙적인 보습과 자외선 차단을 유지하세요",
            "건강한 생활 습관을 계속 유지하세요",
            "정기적으로 피부 상태를 확인하세요"
        ]
    },
    "Acne": {
        description: "여드름 또는 뾰루지가 의심됩니다. 피지 분비와 모공 막힘이 원인일 수 있습니다.",
        recommendation: [
            "피부과 전문의 상담을 권장합니다",
            "얼굴을 자주 만지지 않도록 주의하세요",
            "자극적인 화장품 사용을 피하세요",
            "충분한 수분 섭취와 균형 잡힌 식사를 하세요"
        ]
    },
    "Eczema": {
        description: "습진 또는 피부염이 의심됩니다. 가려움증과 염증이 동반될 수 있습니다.",
        recommendation: [
            "피부과 전문의 진료가 필요합니다",
            "자극적인 세제나 비누 사용을 피하세요",
            "보습제를 자주 발라주세요",
            "긁지 않도록 주의하세요"
        ]
    },
    "Rash": {
        description: "피부 발진이 의심됩니다. 알레르기 반응이나 자극이 원인일 수 있습니다.",
        recommendation: [
            "증상이 지속되면 피부과 진료를 받으세요",
            "새로운 화장품이나 세제 사용을 중단하세요",
            "차갑고 습한 찜질이 도움이 될 수 있습니다",
            "항히스타민제 복용을 고려해보세요 (의사 상담 후)"
        ]
    },
    "Mole": {
        description: "점 또는 색소 침착이 관찰됩니다. 대부분 양성이지만 변화를 주시해야 합니다.",
        recommendation: [
            "크기, 색상, 모양의 변화가 있다면 즉시 피부과 진료를 받으세요",
            "자외선 노출을 최소화하고 자외선 차단제를 사용하세요",
            "정기적으로 전신 피부 검사를 받으세요"
        ]
    }
};

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    // 첫 방문 확인
    if (!localStorage.getItem('tutorialShown')) {
        showTutorial();
        localStorage.setItem('tutorialShown', 'true');
    } else {
        document.getElementById('tutorialOverlay').style.display = 'none';
    }

    // 모델 로드
    loadModel();
});

// 튜토리얼 표시
function showTutorial() {
    document.getElementById('tutorialOverlay').style.display = 'flex';
}

// 튜토리얼 닫기
function closeTutorial() {
    document.getElementById('tutorialOverlay').style.display = 'none';
}

// Teachable Machine 모델 로드
async function loadModel() {
    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        // 모델 로드
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        isModelLoaded = true;
        
        console.log("모델 로드 완료. 클래스 수:", maxPredictions);
    } catch (error) {
        console.error("모델 로드 실패:", error);
        showError("AI 모델을 불러오는데 실패했습니다. 인터넷 연결을 확인하고 페이지를 새로고침해주세요.");
        
        // 데모 모드로 전환 (모델 없이 테스트)
        isModelLoaded = false;
    }
}

// 이미지 업로드 처리
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const img = document.getElementById('uploadedImage');
        img.src = e.target.result;

        // 이미지 미리보기 표시
        document.getElementById('imagePreview').style.display = 'block';
        
        // 결과 섹션 숨기기
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';

        // 이미지 로드 후 밝기 체크 및 예측
        img.onload = async function() {
            // 밝기 체크
            const isDark = await checkImageBrightness(img);
            const warningBadge = document.getElementById('brightnessWarning');
            
            if (isDark) {
                warningBadge.style.display = 'block';
            } else {
                warningBadge.style.display = 'none';
            }

            // AI 예측 실행
            await predictImage(img);
        };
    };
    reader.readAsDataURL(file);
}

// 이미지 밝기 체크
async function checkImageBrightness(img) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let totalBrightness = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;
        }

        const avgBrightness = totalBrightness / pixelCount;
        
        // 평균 밝기가 80 이하면 어두운 것으로 판단
        resolve(avgBrightness < 80);
    });
}

// 이미지 AI 예측
async function predictImage(img) {
    // 로딩 표시
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';

    try {
        let predictions;

        if (isModelLoaded && model) {
            // 실제 모델 예측
            predictions = await model.predict(img);
        } else {
            // 데모 모드: 랜덤 예측 생성
            console.log("데모 모드로 실행 중 (모델 없음)");
            predictions = generateDemoPredictions();
        }

        // 로딩 숨기기
        document.getElementById('loadingSection').style.display = 'none';

        // 예측 결과를 확률 순으로 정렬
        predictions.sort((a, b) => b.probability - a.probability);

        // 결과 표시
        displayResults(predictions);

    } catch (error) {
        console.error("예측 실패:", error);
        document.getElementById('loadingSection').style.display = 'none';
        showError("이미지 분석에 실패했습니다. 다른 이미지를 시도해주세요.");
    }
}

// 데모 예측 생성 (모델이 없을 때)
function generateDemoPredictions() {
    const categories = Object.keys(categoryDescriptions);
    const predictions = [];
    
    // 랜덤 확률 생성
    let total = 0;
    const randomValues = categories.map(() => {
        const val = Math.random();
        total += val;
        return val;
    });

    // 정규화하여 합이 1이 되도록
    categories.forEach((category, index) => {
        predictions.push({
            className: category,
            probability: randomValues[index] / total
        });
    });

    return predictions;
}

// 결과 표시
function displayResults(predictions) {
    const resultSection = document.getElementById('resultSection');
    const topPrediction = predictions[0];
    const confidence = (topPrediction.probability * 100).toFixed(1);

    // 최상위 예측 표시
    const topPredictionDiv = document.getElementById('topPrediction');
    const categoryInfo = categoryDescriptions[topPrediction.className] || {
        description: "분석 결과입니다.",
        recommendation: ["전문의와 상담하시기 바랍니다."]
    };

    topPredictionDiv.innerHTML = `
        <h3>🎯 예측 결과: ${topPrediction.className}</h3>
        <div class="confidence-score">${confidence}%</div>
        <p class="prediction-description">${categoryInfo.description}</p>
    `;

    // 신뢰도가 낮을 때 재촬영 안내 표시
    const retryPrompt = document.getElementById('retryPrompt');
    if (confidence < 70) {
        retryPrompt.style.display = 'block';
    } else {
        retryPrompt.style.display = 'none';
    }

    // 상위 3개 예측 결과 표시
    const allPredictionsDiv = document.getElementById('allPredictions');
    const topThree = predictions.slice(0, 3);
    
    allPredictionsDiv.innerHTML = topThree.map((pred, index) => {
        const percentage = (pred.probability * 100).toFixed(1);
        return `
            <div class="prediction-item">
                <span class="prediction-label">${index + 1}. ${pred.className}</span>
                <div class="prediction-bar-container">
                    <div class="prediction-bar" style="width: ${percentage}%">
                        ${percentage}%
                    </div>
                </div>
                <span class="prediction-percentage">${percentage}%</span>
            </div>
        `;
    }).join('');

    // 다음 단계 안내
    const recommendationDiv = document.getElementById('recommendationText');
    recommendationDiv.innerHTML = `
        <ul>
            ${categoryInfo.recommendation.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;

    // 결과 섹션 표시
    resultSection.style.display = 'block';
    
    // 결과 섹션으로 스크롤
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 에러 표시
function showError(message) {
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

// 업로드 초기화
function resetUpload() {
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 키보드 접근성 개선
document.addEventListener('keydown', (e) => {
    // ESC 키로 튜토리얼 닫기
    if (e.key === 'Escape') {
        const overlay = document.getElementById('tutorialOverlay');
        if (overlay.style.display !== 'none') {
            closeTutorial();
        }
    }
});