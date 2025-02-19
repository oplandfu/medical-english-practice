import React, { useState, useEffect, useRef } from 'react';

const phrases = [
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [confidenceLevels, setConfidenceLevels] = useState({});  // Will store confidence for each phrase
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);
  const [activeTab, setActiveTab] = useState('practice');
  
  const updateConfidence = (level) => {
    setConfidenceLevels({
      ...confidenceLevels,
      [currentPhrase]: level
    });
  };
  
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsPlaying(false);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
      }
    };
  }, [currentPhrase]);

  const playAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = phrases[currentPhrase].audioPath;
      audioRef.current.playbackRate = speed;
      audioRef.current.play().catch(e => console.error('Error playing audio:', e));
      setIsPlaying(true);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    } else {
      try {
        chunksRef.current = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudio(url);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please ensure microphone permissions are granted.');
      }
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
              onClick={() => {
                if (currentPhrase > 0) {
                  if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                  if (isRecording) {
                    toggleRecording();
                  }
                  setRecordedAudio(null);
                  setCurrentPhrase(currentPhrase - 1);
                }
              }}
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
                if (isPlaying) {
                  audioRef.current.playbackRate = speed === 1 ? 0.75 : 1;
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
              onClick={() => {
                if (currentPhrase < phrases.length - 1) {
                  if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                  if (isRecording) {
                    toggleRecording();
                  }
                  setRecordedAudio(null);
                  setCurrentPhrase(currentPhrase + 1);
                }
              }}
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