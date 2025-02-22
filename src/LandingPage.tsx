import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => (
  <div style={{
    maxWidth: '800px',
    margin: '20px auto',
    padding: '40px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
   <h1 style={{ 
  textAlign: 'center', 
  color: '#1a365d',  // Darker blue color
  marginBottom: '30px',
  fontSize: '2.2em',  // Increased from default
  fontWeight: '600'   // Made it semi-bold
}}>
  Welcome to Medical English Practice
</h1>

    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <p style={{ 
        textAlign: 'center',
        color: '#666',
        marginBottom: '30px'
      }}>
        Practice essential English phrases for emergency room settings
        <br />
        <span style={{ fontSize: '0.9em' }}>救急外来で使用する重要な英語フレーズを練習しましょう</span>
      </p>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{ 
          color: '#007bff',
          marginBottom: '15px',
          fontSize: '1.2em'
        }}>
          How to Use
          <span style={{ fontSize: '0.9em', color: '#666', marginLeft: '10px' }}>使い方</span>
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            color: '#28a745',
            marginBottom: '10px',
            fontSize: '1.1em'
          }}>
            1. Practice Mode
            <span style={{ fontSize: '0.9em', color: '#666', marginLeft: '10px' }}>練習モード</span>
          </h3>
          <ul style={{ 
            paddingLeft: '20px',
            color: '#666',
            marginBottom: '15px'
          }}>
            <li>
              Listen to the example phrase
              <br />
              <span style={{ fontSize: '0.9em' }}>モデル音声を聞く</span>
            </li>
            <li>
              Adjust speed if needed
              <br />
              <span style={{ fontSize: '0.9em' }}>必要に応じて速度を調整する</span>
            </li>
            <li>
              Record your voice and compare
              <br />
              <span style={{ fontSize: '0.9em' }}>自分の声を録音して比較する</span>
            </li>
            <li>
              Rate your confidence level
              <br />
              <span style={{ fontSize: '0.9em' }}>自己評価する</span>
            </li>
          </ul>

          <h3 style={{ 
            color: '#28a745',
            marginBottom: '10px',
            fontSize: '1.1em'
          }}>
            2. Progress Tracking
            <span style={{ fontSize: '0.9em', color: '#666', marginLeft: '10px' }}>進歩確認</span>
          </h3>
          <ul style={{ 
            paddingLeft: '20px',
            color: '#666',
            marginBottom: '15px'
          }}>
            <li>
              See your confidence distribution
              <br />
              <span style={{ fontSize: '0.9em' }}>自信度の分布を確認する</span>
            </li>
            <li>
              Review phrases by confidence level
              <br />
              <span style={{ fontSize: '0.9em' }}>自信度別にフレーズを確認する</span>
            </li>
            <li>
              Track progress by category
              <br />
              <span style={{ fontSize: '0.9em' }}>カテゴリー別の進歩を確認する</span>
            </li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#e8f4ff',
          padding: '15px',
          borderRadius: '6px'
        }}>
          <h3 style={{ 
            color: '#0056b3',
            marginBottom: '10px',
            fontSize: '1.1em'
          }}>
            💡 Tips
          </h3>
          <ul style={{ 
            paddingLeft: '20px',
            color: '#666'
          }}>
            <li style={{ marginBottom: '15px' }}>
              Recordings temporarily stay on your device, and they are automatically deleted when you rerecord phrases, refresh the page, or close the App.
              <br />
              <span style={{ fontSize: '0.9em' }}>録音はあなたの端末内に、このアプリ使用中にのみ一時的に保存され、再録音、ページ移動、アプリを閉じる際に自動的に消去されます。</span>
            </li>
            <li>
              Record multiple times to improve
              <br />
              <span style={{ fontSize: '0.9em' }}>納得のいくまで、何度でも練習してください。</span>
            </li>
            <li>
              Update your confidence level after each practice
              <br />
              <span style={{ fontSize: '0.9em' }}>自己評価は毎回更新してください。</span>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
      <button 
  onClick={onStart}
  style={{
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1.1em',
    cursor: 'pointer'
  }}
>
  Get Started → はじめましょう！
</button>
      </div>
    </div>
  </div>
);

export default LandingPage;