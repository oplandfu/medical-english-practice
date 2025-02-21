import { useState, useEffect, useRef } from 'react';

interface Phrase {
  english: string;
  japanese: string;
  pronunciation: string;
  category: string;
  audioPath: string;
}

type ConfidenceLevel = 'need-practice' | 'getting-better' | 'confident';

type ConfidenceLevels = {
  [key: number]: ConfidenceLevel;
};

const phrases: Phrase[] = [
  {
    english: "What brings you to the emergency room today?",
    japanese: "今日は、どうされましたか？",
    pronunciation: "what BRINGS you to the ee-MUR-jun-see ROOM to-DAY",
    category: "Initial Assessment",
    audioPath: "/audio/er-question-1.mp3"
  },
  {
    english: "Are you having trouble breathing?",
    japanese: "呼吸は苦しいですか？",
    pronunciation: "are you HAV-ing TRUH-bul BREE-thing",
    category: "Initial Assessment",
    audioPath: "/audio/breathing-question.mp3"
  }
];

const AudioPractice = () => {
  const [activeTab, setActiveTab] = useState<'practice' | 'progress'>('practice');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [confidenceLevels, setConfidenceLevels] = useState<ConfidenceLevels>({});
  const [showTips, setShowTips] = useState(() => {
    // Check if user has seen tips before
    return !localStorage.getItem('hasSeenRecordingTips');
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const updateConfidence = (level: ConfidenceLevel) => {
    setConfidenceLevels({
      ...confidenceLevels,
      [currentPhrase]: level
    });
  };

  useEffect(() => {
    const audio = new Audio();
    audio.onended = () => {
      setIsPlaying(false);
    };
    audioRef.current = audio;

    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder?.state === 'recording') {
        recorder.stop();
        recorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
      }
    };
  }, []);

  const playAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = phrases[currentPhrase].audioPath;
      audio.playbackRate = speed;
      audio.play().catch((e: Error) => console.error('Error playing audio:', e));
      setIsPlaying(true);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      const recorder = mediaRecorderRef.current;
      if (recorder?.state === 'recording') {
        recorder.stop();
        recorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    } else {
      try {
        chunksRef.current = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudio(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please ensure microphone permissions are granted.');
      }
    }
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    if (isRecording) {
      toggleRecording();
    }
    setRecordedAudio(null);
    if (direction === 'prev' && currentPhrase > 0) {
      setCurrentPhrase(currentPhrase - 1);
    } else if (direction === 'next' && currentPhrase < phrases.length - 1) {
      setCurrentPhrase(currentPhrase + 1);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setActiveTab('practice')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'practice' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'practice' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Practice
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'progress' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'progress' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Progress Report
        </button>
      </div>

      {activeTab === 'practice' && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ marginBottom: '10px', textAlign: 'right' }}>
            {currentPhrase + 1} of {phrases.length}
          </div>
          
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            {phrases[currentPhrase].english}
          </p>
          <p style={{ marginBottom: '10px' }}>
            {phrases[currentPhrase].japanese}
          </p>
          <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>
            {phrases[currentPhrase].pronunciation}
          </p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '100%' }}>
            <button 
              onClick={() => handleNavigation('prev')}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPhrase === 0 ? '#cccccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPhrase === 0 ? 'default' : 'pointer'
              }}
              disabled={currentPhrase === 0}
            >
              Previous
            </button>
            
            <button 
              onClick={playAudio}
              style={{
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <button 
              onClick={() => {
                setSpeed(speed === 1 ? 0.75 : 1);
                const audio = audioRef.current;
                if (audio) {
                  audio.playbackRate = speed === 1 ? 0.75 : 1;
                }
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: speed === 0.75 ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {speed === 0.75 ? 'Normal Speed' : 'Slow Speed'}
            </button>

            <div>
  {showTips && (
    <div style={{ 
      marginBottom: '10px', 
      fontSize: '14px', 
      color: '#666',
      backgroundColor: '#f8f9fa',
      padding: '10px',
      borderRadius: '4px',
      position: 'relative'
    }}>
      <button 
        onClick={() => {
          setShowTips(false);
          localStorage.setItem('hasSeenRecordingTips', 'true');
        }}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ×
      </button>
      <p style={{ marginBottom: '5px' }}>💡 Recording Tips / 録音について:</p>
      <ul style={{ margin: '0', paddingLeft: '20px' }}>
        <li>録音はあなたの端末内に、このアプリ使用中にのみ一時的に保存されます。</li>
        <li>フレーズ、ページを移動したり、アプリを閉じると自動的に消去されます。</li>
        <li>何度でも練習できます！</li>
      </ul>
    </div>
  )}
  {!showTips && (
    <button
      onClick={() => setShowTips(true)}
      style={{
        border: 'none',
        background: 'none',
        color: '#666',
        fontSize: '12px',
        cursor: 'pointer',
        marginBottom: '5px'
      }}
    >
      💡 Show recording tips
    </button>
  )}
  <button 
    onClick={toggleRecording}
    style={{
      padding: '8px 12px',
      backgroundColor: isRecording ? '#dc3545' : '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    {isRecording ? 'Stop Recording' : 'Record'}
  </button>
</div>

            {recordedAudio && (
              <>
                <button 
                  onClick={() => {
                    const audioElement = new Audio(recordedAudio);
                    audioElement.play().catch(e => console.error('Playback failed:', e));
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Play Recording
                </button>

                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => updateConfidence('need-practice')}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: confidenceLevels[currentPhrase] === 'need-practice' ? '#dc3545' : '#f8d7da',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Need Practice
                  </button>
                  <button
                    onClick={() => updateConfidence('getting-better')}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: confidenceLevels[currentPhrase] === 'getting-better' ? '#ffc107' : '#fff3cd',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Getting Better
                  </button>
                  <button
                    onClick={() => updateConfidence('confident')}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: confidenceLevels[currentPhrase] === 'confident' ? '#28a745' : '#d4edda',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Confident
                  </button>
                </div>
              </>
            )}
            
            <button 
              onClick={() => handleNavigation('next')}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPhrase === phrases.length - 1 ? '#cccccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPhrase === phrases.length - 1 ? 'default' : 'pointer'
              }}
              disabled={currentPhrase === phrases.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div>Progress Report Coming Soon</div>
      )}
    </div>
  );
};

export default AudioPractice;