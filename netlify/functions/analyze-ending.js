const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    const { userEnding } = JSON.parse(event.body);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `당신은 중학생의 사회성 발달을 돕는 따뜻한 갈등 해결 요정입니다.

학생이 작성한 갈등 상황의 결말을 읽고 다음을 JSON 형식으로 제공하세요:

1. praise: 학생 답변의 전체 맥락을 파악하여 긍정적 측면을 2줄 이상 구체적으로 칭찬
2. feedback: 성장 방향을 제시하는 건설적 피드백 2줄 이상
3. fragmentType: 공감, 소통, 용기, 이해, 성찰, 노력 중 하나
4. needsRethink: 폭력적이거나 분열적이거나 극단적 분노 표현이면 true, 아니면 false

중요: 키워드가 아닌 전체 맥락 파악. 미숙해도 시도를 인정. 터무니없는 폭력/분열만 needsRethink.

JSON만 답변하세요.`
          },
          {
            role: 'user',
            content: `[갈등 상황]
단톡방에서 나만 나가져 있었다. 친구들은 어색하게 반응하고, 뒤에서 "걔 때문에 그런 거 아니야?"라는 소리가 들렸다.

[학생이 작성한 결말]
${userEnding}

위 결말을 분석해주세요.`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });
    
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    if (result.needsRethink) {
      result.fragmentType = '노력';
      result.feedback += '\n\n✨ 우리 다시 생각해 볼까요?';
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '요정이 잠시 쉬고 있어요. 다시 시도해주세요!' })
    };
  }
};
