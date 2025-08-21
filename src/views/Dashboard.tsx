import { useEffect, useState, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '../stores/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useTasks } from '../hooks/useTasks';
import { TaskView } from '../components/task/TaskView';
import { TaskList } from '../components/task/TaskList';
import { DraggableCategoryGrid } from '../components/category/DraggableCategoryGrid';
import { PremiumFeature, PremiumOnly } from '../components/premium';
import { PremiumToggle } from '../components/premium/PremiumToggle';
import { isMockMode } from '../lib/config';
import { audioSamples } from '../lib/audioSamples';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const { state, dispatch } = useApp();
  const { signOut } = useAuth();
  const { fetchCategories, categories } = useCategories();
  
  // Debug logging for categories
  console.log('🏠 Dashboard render - categories:', categories.map(c => c.name));
  const { fetchTasks, tasks, createTask } = useTasks();
  const [showAddTask, setShowAddTask] = useState(false);
  
  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timerStatus, setTimerStatus] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [workDuration, setWorkDuration] = useState(25); // Work duration in minutes
  const [breakDuration, setBreakDuration] = useState(5); // Break duration in minutes
  const [bellEnabled, setBellEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('default');
  const [backgroundSound, setBackgroundSound] = useState<string | null>(null);
  const [backgroundVolume, setBackgroundVolume] = useState(30);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTasks();
  }, []); // Empty dependency array - only run on mount

  // Update timer when work duration changes (only if timer is stopped)
  useEffect(() => {
    if (timerStatus === 'stopped' && timerMode === 'work') {
      setTimeRemaining(workDuration * 60);
    }
  }, [workDuration, timerStatus, timerMode]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleViewChange = (view: typeof state.currentView) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };


  const handleTaskReorder = async (reorderedTasks: any[]) => {
    if (reorderedTasks.length > 0) {
      console.log('🔄 Dashboard task reorder, count:', reorderedTasks.length);
      
      // 1. Immediate optimistic UI update
      const tasksWithNewPositions = reorderedTasks.map((task, index) => ({
        ...task,
        position: index + 1,
        updated_at: new Date().toISOString(),
      }));
      
      // Update UI immediately for smooth UX
      dispatch({ type: 'SET_TASKS', payload: tasksWithNewPositions });
      
      // 2. Background database sync (don't await this to avoid UI delays)
      setTimeout(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          for (let i = 0; i < reorderedTasks.length; i++) {
            const task = reorderedTasks[i];
            await supabase
              .from('tasks')
              .update({ 
                position: i + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', task.id)
              .eq('user_id', user.id);
          }
          
          console.log('🎉 Dashboard task positions synced to database');
        } catch (error) {
          console.error('💥 Database sync failed, reverting:', error);
          // On error, refetch to restore correct state
          await fetchTasks();
        }
      }, 0);
    }
  };



  // Play background sound
  const playBackgroundSound = (soundType: string) => {
    try {
      // If clicking the same sound, stop it
      if (backgroundSound === soundType) {
        stopBackgroundSound();
        return;
      }

      // Stop current background sound completely and wait a bit
      stopBackgroundSound();
      
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        // Map sound types to file names and their known extensions
        const soundFiles = {
          'Rain': { file: 'rain', extension: 'mp3' },
          'Forest': { file: 'forest', extension: 'mp3' },
          'Ocean': { file: 'ocean', extension: 'wav' },
          'Coffee Shop': { file: 'coffee', extension: 'wav' }
        };

        const soundConfig = soundFiles[soundType as keyof typeof soundFiles];
        
        if (!soundConfig) {
          console.log(`Unknown sound type: ${soundType}`);
          return;
        }

        const audio = new Audio(`/sounds/${soundConfig.file}.${soundConfig.extension}`);
        audio.loop = true;
        audio.volume = backgroundVolume / 100;
        
        // Set up event listeners before setting the audio ref
        audio.addEventListener('canplaythrough', () => {
          // Double-check that we haven't switched sounds in the meantime
          if (backgroundAudioRef.current === audio) {
            audio.play().catch(error => {
              console.log(`Could not play ${soundType} sound:`, error);
              // Don't show alert for play errors, just log them
            });
          }
        });

        audio.addEventListener('error', (e) => {
          console.log(`Audio load error for ${soundConfig.file}.${soundConfig.extension}:`, e);
          if (backgroundAudioRef.current === audio) {
            setBackgroundSound(null);
            backgroundAudioRef.current = null;
          }
        });

        // Only set the ref and state if no other audio is currently being set up
        if (backgroundAudioRef.current === null) {
          backgroundAudioRef.current = audio;
          setBackgroundSound(soundType);
        }
      }, 100); // 100ms delay to ensure cleanup
      
    } catch (error) {
      console.log('Background sound not available in this browser:', error);
      setBackgroundSound(null);
    }
  };


  // Stop background sound
  const stopBackgroundSound = () => {
    if (backgroundAudioRef.current && backgroundAudioRef.current instanceof HTMLAudioElement) {
      try {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current.currentTime = 0;
        backgroundAudioRef.current.src = '';
        backgroundAudioRef.current.load();
      } catch (error) {
        console.log('Error stopping background sound:', error);
      }
    }
    
    backgroundAudioRef.current = null;
    setBackgroundSound(null);
  };

  // Update background sound volume
  useEffect(() => {
    if (backgroundAudioRef.current && backgroundAudioRef.current instanceof HTMLAudioElement) {
      backgroundAudioRef.current.volume = backgroundVolume / 100;
    }
  }, [backgroundVolume]);

  // Cleanup background sound on unmount
  useEffect(() => {
    return () => {
      stopBackgroundSound();
    };
  }, []);

  // Play timer completion sound
  const playTimerSound = async () => {
    if (!bellEnabled) return;
    
    try {
      // For premium sounds, try to play audio samples first
      if (selectedSound !== 'default' && audioSamples[selectedSound as keyof typeof audioSamples]) {
        try {
          const audio = new Audio(audioSamples[selectedSound as keyof typeof audioSamples]);
          audio.volume = 0.3;
          await audio.play();
          return;
        } catch (sampleError) {
          console.log('Audio sample failed, falling back to generated sound:', sampleError);
        }
      }
      
      // Original simple generated sound for default bell
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequency = 800;
      const duration = 2.0;
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      // Hold at full volume for 1.5s then fade out over 0.5s
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 1.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Could not play timer sound:', error);
    }
  };

  // Pomodoro Timer Functions
  const startTimer = useCallback(() => {
    setTimerStatus('running');
    
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer completed - clear the interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          setTimerStatus('stopped');
          
          if (timerMode === 'work') {
            // Switch to break
            setTimerMode('break');
            const breakTime = breakDuration * 60;
            setTimeout(() => setTimeRemaining(breakTime), 0);
            
            // Play timer completion sound
            playTimerSound();
            
            // Optional: play notification sound
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Work session complete! Time for a break.', {
                body: `${breakDuration}-minute break started.`,
                icon: '/favicon.ico'
              });
            }
            return breakTime;
          } else {
            // Switch back to work
            setTimerMode('work');
            const workTime = workDuration * 60;
            setTimeout(() => setTimeRemaining(workTime), 0);
            
            // Play timer completion sound
            playTimerSound();
            
            // Optional: play notification sound
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Break complete! Ready to work.', {
                body: `${workDuration}-minute work session ready.`,
                icon: '/favicon.ico'
              });
            }
            return workTime;
          }
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerMode]);

  const pauseTimer = useCallback(() => {
    setTimerStatus('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    setTimerStatus('stopped');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerMode('work');
    setTimeRemaining(workDuration * 60);
  }, [workDuration]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Ultra-minimal design with full functionality restored - Mobile responsive
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-white'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-responsive Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <img 
              src="/hibilist-logo.png" 
              alt="Hibilist - Mindful Productivity" 
              className="h-16 sm:h-20 w-auto mb-2 mx-auto sm:mx-0"
            />
            {isMockMode() && (
              <div className={`mt-2 text-xs transition-colors ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Demo Mode: Using local mock data
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <PremiumFeature feature="Custom Themes" showUpgrade={false}>
              <select 
                value={theme === 'light' ? 'Default Theme' : 'Dark Mode'}
                onChange={(e) => {
                  const selectedTheme = e.target.value;
                  if (selectedTheme === 'Dark Mode') {
                    setTheme('dark');
                  } else {
                    setTheme('light');
                  }
                }}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-200 bg-gray-800' 
                    : 'border-gray-200 text-gray-700 bg-white'
                }`}
              >
                <option>Default Theme</option>
                <option>Dark Mode</option>
              </select>
            </PremiumFeature>
            <button 
              onClick={handleSignOut}
              className={`text-sm transition-colors px-4 py-2 rounded-lg min-h-[44px] ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 active:bg-gray-800'
                  : 'text-gray-400 hover:text-gray-600 active:bg-gray-100'
              }`}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Mobile-responsive Navigation Tabs */}
        <nav className="mb-8 sm:mb-12">
          <div className={`flex flex-col sm:flex-row sm:space-x-8 border-b transition-colors ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
          }`}>
            {(['tasks', 'master', 'categories', 'completed'] as const).map((view) => (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 min-h-[44px] flex items-center justify-center sm:justify-start touch-manipulation ${
                  state.currentView === view
                    ? theme === 'dark' 
                      ? 'text-white border-gray-500' 
                      : 'text-gray-900 border-gray-300'
                    : theme === 'dark'
                      ? 'text-gray-400 border-transparent hover:text-gray-200 active:text-gray-100 active:bg-gray-800'
                      : 'text-gray-500 border-transparent hover:text-gray-700 active:text-gray-800 active:bg-gray-50'
                }`}
              >
                {view === 'tasks' ? 'Tasks' : 
                 view === 'master' ? 'Master View' : 
                 view === 'categories' ? 'Categories' : 
                 'Completed'}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        {state.currentView === 'tasks' && (
          <div className="space-y-8">
            {/* Functional Pomodoro Timer */}
            <section className="text-center py-8">
              <div className="relative mb-2">
                <div className={`text-5xl font-light transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
                
                {/* Bell notification toggle - positioned to the right */}
                <button
                  onClick={() => setBellEnabled(!bellEnabled)}
                  className={`absolute top-1/2 -translate-y-1/2 ml-4 p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${
                    bellEnabled 
                      ? theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                      : theme === 'dark'
                        ? 'text-gray-600 hover:bg-gray-800'
                        : 'text-gray-300 hover:bg-gray-50'
                  }`}
                  style={{ left: '50%', marginLeft: '70px' }}
                  title={bellEnabled ? 'Disable timer notifications' : 'Enable timer notifications'}
                >
                  <Bell className="w-5 h-5" />
                </button>
                
                {/* Temporary test button for free tier */}
                <button
                  onClick={playTimerSound}
                  className={`absolute top-1/2 -translate-y-1/2 px-2 py-1 text-xs border rounded transition-colors ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ left: '50%', marginLeft: '120px' }}
                  title="Test bell sound"
                >
                  Test
                </button>
              </div>
              
              <div className={`text-sm mb-6 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {timerMode === 'work' ? 'Focus Session' : 'Break Time'}
                {timerStatus !== 'stopped' && (
                  <span className="ml-2">
                    {timerStatus === 'running' ? '(Running)' : '(Paused)'}
                  </span>
                )}
              </div>
              
              {/* Mobile-responsive Timer Controls */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {timerStatus === 'stopped' && (
                  <button
                    onClick={startTimer}
                    className={`px-6 py-3 transition-colors rounded-lg min-h-[44px] ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-white active:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
                    }`}
                  >
                    Start
                  </button>
                )}
                
                {timerStatus === 'running' && (
                  <button
                    onClick={pauseTimer}
                    className={`px-6 py-3 transition-colors rounded-lg min-h-[44px] ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-white active:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
                    }`}
                  >
                    Pause
                  </button>
                )}
                
                {timerStatus === 'paused' && (
                  <>
                    <button
                      onClick={startTimer}
                      className={`px-6 py-3 transition-colors rounded-lg min-h-[44px] ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:text-white active:bg-gray-800'
                          : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
                      }`}
                    >
                      Resume
                    </button>
                    <button
                      onClick={stopTimer}
                      className={`px-6 py-3 transition-colors rounded-lg min-h-[44px] ${
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-gray-200 active:bg-gray-800'
                          : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                      }`}
                    >
                      Stop
                    </button>
                  </>
                )}
                
                {timerStatus === 'running' && (
                  <button
                    onClick={stopTimer}
                    className={`px-6 py-3 transition-colors rounded-lg min-h-[44px] ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200 active:bg-gray-800'
                        : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                    }`}
                  >
                    Stop
                  </button>
                )}
              </div>
            </section>

            {/* Premium Timer Features - Hidden for free users */}
            <PremiumOnly>
              <section className={`border rounded-2xl p-6 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-light mb-4 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Timer Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className={`block mb-2 transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Work Duration</label>
                    <select 
                      value={workDuration}
                      onChange={(e) => setWorkDuration(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg max-h-48 overflow-y-auto transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-200 bg-gray-700'
                          : 'border-gray-200 text-gray-800 bg-white'
                      }`}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                      <option value={25}>25 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={35}>35 minutes</option>
                      <option value={40}>40 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={50}>50 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={75}>75 minutes</option>
                      <option value={90}>90 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block mb-2 transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Break Duration</label>
                    <select 
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg max-h-48 overflow-y-auto transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-200 bg-gray-700'
                          : 'border-gray-200 text-gray-800 bg-white'
                      }`}
                    >
                      <option value={3}>3 minutes</option>
                      <option value={5}>5 minutes</option>
                      <option value={7}>7 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={`block mb-2 text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Notification Sound</label>
                  <div className="flex gap-2">
                    <select 
                      value={selectedSound}
                      onChange={(e) => setSelectedSound(e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-200 bg-gray-700'
                          : 'border-gray-200 text-gray-800 bg-white'
                      }`}
                    >
                      <option value="default">Default Bell</option>
                      <option value="chime">Soft Marimba</option>
                      <option value="bell">Classic Bell</option>
                      <option value="gentle">Classic Bowls</option>
                    </select>
                    <button
                      onClick={playTimerSound}
                      className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </section>
            </PremiumOnly>

            <PremiumOnly>
              <section className={`border rounded-2xl p-6 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-light mb-4 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Focus Streak</h3>
                <div className="text-center">
                  <div className={`text-3xl font-light mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>7</div>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>days in a row</p>
                  <div className="mt-4 flex justify-center space-x-2">
                    {[1,2,3,4,5,6,7].map((day) => (
                      <div key={day} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                      }`}>
                        <div className={`w-4 h-4 rounded-full transition-colors ${
                          theme === 'dark' ? 'bg-slate-400' : 'bg-slate-300'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </PremiumOnly>

            <PremiumOnly>
              <section className={`border rounded-2xl p-6 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-light mb-4 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Background Sounds</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Rain', 'Forest', 'Ocean', 'Coffee Shop'].map((sound) => (
                    <button
                      key={sound}
                      onClick={() => playBackgroundSound(sound)}
                      className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                        backgroundSound === sound
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {sound} {backgroundSound === sound && '♪'}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={stopBackgroundSound}
                    className={`px-3 py-1 text-xs border rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Stop All Sounds
                  </button>
                  {backgroundSound && (
                    <span className={`px-2 py-1 text-xs rounded transition-colors ${
                      theme === 'dark'
                        ? 'text-gray-300 bg-gray-700'
                        : 'text-gray-500 bg-gray-100'
                    }`}>
                      Playing: {backgroundSound}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={backgroundVolume}
                    onChange={(e) => setBackgroundVolume(Number(e.target.value))}
                    className="w-24 accent-gray-400"
                  />
                </div>
              </section>
            </PremiumOnly>

            {/* Task View Component */}
            <TaskView theme={theme} />

            {/* Single Premium Upgrade Prompt */}
            <PremiumFeature feature="Premium Features">
              <div></div>
            </PremiumFeature>

          </div>
        )}

        {state.currentView === 'master' && (
          <div className="space-y-8">
            {/* Statistics Cards - Minimal Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`border rounded-2xl p-6 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className={`text-2xl font-light mb-1 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {tasks.filter(t => t.status !== 'Complete').length}
                </div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Active Tasks</div>
              </div>
              <div className={`border rounded-2xl p-6 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className={`text-2xl font-light mb-1 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {tasks.filter(t => t.status === 'Complete').length}
                </div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Completed</div>
              </div>
              <div className={`border rounded-2xl p-6 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className={`text-2xl font-light mb-1 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {categories.length}
                </div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Categories</div>
              </div>
            </div>

            {/* All Tasks List */}
            <div className={`border rounded-2xl p-6 transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <h3 className={`text-lg font-medium mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>All Active Tasks</h3>
              <TaskList
                tasks={tasks.filter(t => t.status !== 'Complete')}
                showCategory={true}
                emptyMessage="No active tasks yet"
                onTaskReorder={handleTaskReorder}
                theme={theme}
              />
            </div>

            {/* Quick Overview */}
            {(categories.length > 0 || tasks.length > 0) && (
              <div className={`border rounded-2xl p-4 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <h3 className={`font-light mb-2 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Quick Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Categories:</span>
                    <span className={`font-medium ml-2 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{categories.length}</span>
                  </div>
                  <div>
                    <span className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Active Tasks:</span>
                    <span className={`font-medium ml-2 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{tasks.filter(t => t.status !== 'Complete').length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {state.currentView === 'categories' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-light transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Categories</h2>
            </div>
            <DraggableCategoryGrid theme={theme} />

            {/* Quick Overview */}
            {(categories.length > 0 || tasks.length > 0) && (
              <div className={`border rounded-2xl p-4 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <h3 className={`font-light mb-2 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Quick Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Categories:</span>
                    <span className={`font-medium ml-2 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{categories.length}</span>
                  </div>
                  <div>
                    <span className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Active Tasks:</span>
                    <span className={`font-medium ml-2 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{tasks.filter(t => t.status !== 'Complete').length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {state.currentView === 'completed' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-light transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Completed Tasks</h2>
              <div className={`text-sm transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {tasks.filter(t => t.status === 'Complete').length} completed
              </div>
            </div>
            
            <div className={`border rounded-2xl p-6 transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <TaskList
                tasks={tasks.filter(t => t.status === 'Complete')}
                showCategory={true}
                emptyMessage="No completed tasks yet"
                onTaskReorder={undefined} // No reordering in completed view
                theme={theme}
              />
            </div>

            {/* Quick Overview */}
            {(categories.length > 0 || tasks.length > 0) && (
              <div className={`border rounded-2xl p-4 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <h3 className={`font-light mb-2 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Quick Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Categories:</span>
                    <span className={`font-medium ml-2 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{categories.length}</span>
                  </div>
                  <div>
                    <span className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Completed Tasks:</span>
                    <span className={`font-medium ml-2 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{tasks.filter(t => t.status === 'Complete').length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Add Task Modal - Mobile Responsive */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg transition-colors ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-light mb-4 sm:mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Add Task</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const taskName = formData.get('taskName') as string;
                const categoryId = formData.get('categoryId') as string;
                const priority = formData.get('priority') as string;
                
                if (taskName.trim()) {
                  const result = await createTask({
                    name: taskName.trim(),
                    category_id: categoryId || categories[0]?.id || '',
                    status: 'Not Started',
                    priority: (priority as any) || 'Standard'
                  });
                  
                  if (result && !result.error) {
                    form.reset(); // Reset the form
                    setShowAddTask(false);
                  }
                }
              }}>
                <div className="space-y-4">
                  <input
                    name="taskName"
                    type="text"
                    placeholder="What needs to be done?"
                    className={`w-full px-4 py-3 rounded-xl border text-sm min-h-[44px] transition-colors focus:outline-none ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-gray-500'
                        : 'border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-gray-400'
                    }`}
                    autoFocus
                    required
                  />
                  
                  <select
                    name="categoryId"
                    className={`w-full px-4 py-3 rounded-xl border text-sm min-h-[44px] transition-colors focus:outline-none ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500'
                        : 'border-gray-200 bg-white text-gray-800 focus:border-gray-400'
                    }`}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <select
                    name="priority"
                    className={`w-full px-4 py-3 rounded-xl border text-sm min-h-[44px] transition-colors focus:outline-none ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500'
                        : 'border-gray-200 bg-white text-gray-800 focus:border-gray-400'
                    }`}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className={`flex-1 px-4 py-3 rounded-lg min-h-[44px] transition-colors ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200 active:bg-gray-700'
                        : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-3 rounded-xl min-h-[44px] transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 active:bg-gray-400'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400'
                    }`}
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Development-only premium toggle */}
      <PremiumToggle />
    </div>
  );
}