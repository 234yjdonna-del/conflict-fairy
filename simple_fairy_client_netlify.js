// Netlify Functions 사용 버전
// simple_fairy_client_netlify.js

async function analyzeEnding(userEnding) {
  document.querySelector('.feedback-loading').style.display = 'block';

  try {
    // Netlify Function 호출 (API 키 노출 안됨!)
    const response = await fetch('/.netlify/functions/analyze-ending', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userEnding })
    });

    const feedback = await response.json();

    displayFeedback(feedback);
    saveToFirestore(userEnding, feedback);

  } catch (error) {
    console.error('분석 실패:', error);
    alert('요정이 잠시 쉬고 있어요. 다시 시도해주세요!');
  }

  document.querySelector('.feedback-loading').style.display = 'none';
}

// 나머지 함수는 이전과 동일
function displayFeedback(feedback) {
  document.querySelector('.praise-content').innerHTML = 
    feedback.praise.replace(/\n/g, '<br>');

  document.querySelector('.feedback-content').innerHTML = 
    feedback.feedback.replace(/\n/g, '<br>');

  showFragmentAnimation(feedback.fragmentType);
  document.querySelector('.fairy-feedback').style.display = 'block';
}

function showFragmentAnimation(fragmentType) {
  const fragmentDiv = document.querySelector('.fragment-reward');
  fragmentDiv.innerHTML = `
    <div class="fragment-animation">
      <div class="fragment-icon">✨</div>
      <div class="fragment-name">${fragmentType}의 조각</div>
    </div>
  `;

  setTimeout(() => {
    fragmentDiv.querySelector('.fragment-animation').classList.add('show');
  }, 100);
}

async function saveToFirestore(userEnding, feedback) {
  const db = firebase.firestore();
  const userId = firebase.auth().currentUser?.uid;

  if (!userId) return;

  await db.collection('endings').add({
    userId: userId,
    content: userEnding,
    feedback: feedback,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  await db.collection('users').doc(userId).collection('fragments').add({
    type: feedback.fragmentType,
    awardedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

document.querySelector('.submit-ending-btn').addEventListener('click', () => {
  const userEnding = document.querySelector('.ending-textarea').value;

  if (!userEnding.trim()) {
    alert('결말을 작성해주세요!');
    return;
  }

  analyzeEnding(userEnding);
});
