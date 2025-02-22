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
    },
    {
      english: "Can you rate your pain from 1 to 10?",
      japanese: "痛みを1から10までの段階で表すと、どのくらいですか？",
      pronunciation: "can you RATE your PAIN from ONE to TEN",
      category: "Pain Assessment",
      audioPath: "/audio/pain-rating.mp3"
    },
    {
      english: "Where is the pain? Can you point to it?",
      japanese: "痛みはどこですか？指さしていただけますか？",
      pronunciation: "WHERE is the PAIN? can you POINT to it?",
      category: "Pain Assessment",
      audioPath: "/audio/pain-location.mp3"
    },
    {
      english: "When did the pain start?",
      japanese: "いつから痛みが始まりましたか？",
      pronunciation: "WHEN did the PAIN START?",
      category: "Pain Assessment",
      audioPath: "/audio/pain-onset.mp3"
    },
    {
      english: "Have you felt fever or chills?",
      japanese: "熱や寒気を感じましたか？",
      pronunciation: "have you FELT FEE-ver or CHILLS?",
      category: "Vital Signs/General Condition",
      audioPath: "/audio/fever-chills.mp3"
    },
    {
      english: "How is your breathing? Any difficulty?",
      japanese: "呼吸の状態はいかがですか？何か困難はありますか？",
      pronunciation: "HOW is your BREE-thing? ANY diff-i-CUL-ty?",
      category: "Vital Signs/General Condition",
      audioPath: "/audio/breathing-difficulty.mp3"
    },
    {
      english: "Have you felt dizzy or lightheaded?",
      japanese: "めまいやふらつきを感じましたか？",
      pronunciation: "have you felt DIZ-zy or light-HEAD-ed?",
      category: "Vital Signs/General Condition",
      audioPath: "/audio/dizziness.mp3"
    },
    {
      english: "Do you have any allergies to medications?",
      japanese: "薬に対するアレルギーはありますか？",
      pronunciation: "do you have ANY AL-ler-gies to med-i-CA-tions?",
      category: "Medical History",
      audioPath: "/audio/medication-allergies.mp3"
    },
    {
      english: "Are you currently taking any medications?",
      japanese: "現在、何か薬を服用していますか？",
      pronunciation: "are you CUR-rent-ly TAK-ing ANY med-i-CA-tions?",
      category: "Medical History",
      audioPath: "/audio/current-medications.mp3"
    },
    {
      english: "Have you had any similar symptoms before?",
      japanese: "以前にも同じような症状がありましたか？",
      pronunciation: "have you HAD any SIM-i-lar SYMP-toms be-FORE?",
      category: "Medical History",
      audioPath: "/audio/previous-symptoms.mp3"
    },
    {
      english: "When was the last time you ate or drank anything?",
      japanese: "最後に食べたり飲んだりしたのはいつですか？",
      pronunciation: "WHEN was the LAST TIME you ATE or DRANK ANY-thing?",
      category: "Current Status",
      audioPath: "/audio/last-meal.mp3"
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
  <div style={{ 
    backgroundColor: 'white', 
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    {/* Progress Graph */}
    <div style={{ 
      marginBottom: '30px',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px'
    }}>
      <h3 style={{ marginBottom: '15px', color: '#444' }}>Progress Distribution</h3>
      <div style={{ 
        display: 'flex',
        height: '24px',
        backgroundColor: 'white',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        <div style={{
          width: `${(Object.values(confidenceLevels).filter(level => level === 'confident').length / phrases.length) * 100}%`,
          backgroundColor: '#28a745',
          borderRight: '2px solid white'
        }}/>
        <div style={{
          width: `${(Object.values(confidenceLevels).filter(level => level === 'getting-better').length / phrases.length) * 100}%`,
          backgroundColor: '#ffc107',
          borderRight: '2px solid white'
        }}/>
        <div style={{
          width: `${(Object.values(confidenceLevels).filter(level => level === 'need-practice').length / phrases.length) * 100}%`,
          backgroundColor: '#dc3545'
        }}/>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#666'
      }}>
        <div>
          <span style={{ color: '#28a745' }}>■</span> Confident
        </div>
        <div>
          <span style={{ color: '#ffc107' }}>■</span> Getting Better
        </div>
        <div>
          <span style={{ color: '#dc3545' }}>■</span> Need Practice
        </div>
      </div>
    </div>

    {/* Phrases by Confidence Level */}
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '15px', color: '#444' }}>Phrases by Confidence Level</h3>
      
      <div style={{ 
        backgroundColor: '#f8d7da',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <h4 style={{ color: '#dc3545', marginBottom: '10px' }}>
          Need Practice ({Object.values(confidenceLevels).filter(level => level === 'need-practice').length})
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          {phrases.filter((_, index) => confidenceLevels[index] === 'need-practice')
            .map(phrase => (
              <li key={phrase.english}>{phrase.english}</li>
            ))}
        </ul>
      </div>
      
      <div style={{ 
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <h4 style={{ color: '#ffc107', marginBottom: '10px' }}>
          Getting Better ({Object.values(confidenceLevels).filter(level => level === 'getting-better').length})
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          {phrases.filter((_, index) => confidenceLevels[index] === 'getting-better')
            .map(phrase => (
              <li key={phrase.english}>{phrase.english}</li>
            ))}
        </ul>
      </div>
      
      <div style={{ 
        backgroundColor: '#d4edda',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <h4 style={{ color: '#28a745', marginBottom: '10px' }}>
          Confident ({Object.values(confidenceLevels).filter(level => level === 'confident').length})
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          {phrases.filter((_, index) => confidenceLevels[index] === 'confident')
            .map(phrase => (
              <li key={phrase.english}>{phrase.english}</li>
            ))}
        </ul>
      </div>
    </div>

    {/* Category Progress */}
    <div>
      <h3 style={{ marginBottom: '15px', color: '#444' }}>Progress by Category</h3>
      {Array.from(new Set(phrases.map(p => p.category))).map(category => {
        const phrasesInCategory = phrases.filter(p => p.category === category);
        const confidentInCategory = phrasesInCategory.filter((_, idx) => 
          confidenceLevels[phrases.findIndex(p => p === phrasesInCategory[idx])] === 'confident'
        ).length;
        
        return (
          <div key={category} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>{category} ({phrasesInCategory.length} phrases)</span>
              <span>{confidentInCategory} confident</span>
            </div>
            <div style={{ 
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(confidentInCategory / phrasesInCategory.length) * 100}%`,
                height: '100%',
                backgroundColor: '#28a745',
                borderRadius: '4px'
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
    </div>
  );
};

export default AudioPractice;