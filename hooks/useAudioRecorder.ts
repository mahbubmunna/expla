import { useState } from 'react';
import { Audio } from 'expo-av';
export function useAudioRecorder() {
  const [recording, setRecording] = useState(null);
  const startRecording = async () => { /* basic */ };
  return { startRecording, recording };
}