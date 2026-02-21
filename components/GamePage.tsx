
"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { apiClient } from "@/lib/api-client";

// Types for dynamically loaded modules
type CameraType = any;
type PoseType = any;
type ResultsType = any;

interface PoseConditionRule {
    name: string;
    points: [number, number, number]; // A, B (angle point), C
    min: number;
    max: number;
    weight?: number;
}

interface PoseData {
    id: number;
    pose_name: string;
    pose_description: string;
    pose_condition: string;
    
    // For Rule-based accuracy
    pose_point?: string; // JSON: [11, 13, 15]
    pose_min?: number;
    pose_max?: number;

    // We can also have multiple conditions parsed from JSON
    conditions?: PoseConditionRule[];
    
    // Target accuracy from Plan
    pose_accuracy?: number;
}

const MOCK_POSE: PoseData = {
    id: 1,
    pose_name: "Neck Side Stretch Left",
    pose_description: "เอียงศีรษะไปทางซ้าย ให้หูซ้ายชิดไหล่ซ้าย รูสึกตึงที่คอด้านขวา",
    pose_condition: "Keep your shoulders down.",
    // Parse this logic: Angle at Neck/Shoulder? 
    // Let's assume we want to measure angle between Nose(0), MidShoulders(calc), LeftShoulder(11).
    // Or simpler: Angle between Vertical Axis and (Nose-MidShoulder).
    // For simplicity in this demo, let's use: Nose(0), Left Shoulder(11), Right Shoulder(12).
    // If head tilts left, angle 0-11-12 might change? No, that's not quite right.
    // Let's use Angle: Nose(0) - Neck(Midpoint 11,12) - Left Shoulder (11) is hard.
    
    // Simplest proxy for "Neck Tilt Left": Angle between Left Ear(7), Neck(approx), Left Shoulder(11).
    // But MediaPipe doesn't have neck.
    
    // Using the example I gave earlier:
    // Angle at Left Shoulder (11): Point 0 (Nose) -> 11 -> 12.
    // T-Pose check is easier. Let's stick to the Mock Data structure we agreed on but implement logic generic enough.
    
    // Let's Mock "Left Elbow Angle" for testing logic first (like T-Pose but dynamic)
    pose_point: "[11, 13, 15]", // Shoulder, Elbow, Wrist
    pose_min: 160,
    pose_max: 180, 
    
    conditions: [
         {
            name: "Left Elbow Extension",
            points: [11, 13, 15], 
            min: 160,
            max: 180,
            weight: 1
         },
         {
            name: "Right Elbow Extension",
            points: [12, 14, 16], 
            min: 160,
            max: 180,
            weight: 1
         }
    ]
};

const GamePage = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [accuracy, setAccuracy] = useState<number>(0);
    const [currentPose, setCurrentPose] = useState<PoseData | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(true);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [processData, setProcessData] = useState<any>(null);
    const [feedbackUI, setFeedbackUI] = useState<string>("");
    
    // Multiple plan states
    const [allPlans, setAllPlans] = useState<any[]>([]);
    const [currentPlanIndex, setCurrentPlanIndex] = useState<number>(0);
    const [showTransition, setShowTransition] = useState<boolean>(false);
    const [transitionCountdown, setTransitionCountdown] = useState<number>(5);
    const [isDayCompleted, setIsDayCompleted] = useState<boolean>(false);
    const [isBlockedToday, setIsBlockedToday] = useState<boolean>(false);
    
    const cameraRef = useRef<CameraType | null>(null);
    const feedbackRef = useRef<string>("");
    const accuracyRef = useRef<number>(0);

    const loadPlan = useCallback((plan: any) => {
        const dbPose = plan.pose;
        setCurrentPose({
            id: dbPose.id,
            pose_name: dbPose.pose_name,
            pose_description: dbPose.pose_description,
            pose_condition: dbPose.pose_condition,
            pose_point: dbPose.pose_point,
            pose_min: plan.pose_min,
            pose_max: plan.pose_max,
            pose_accuracy: plan.pose_accuracy,
        });
        setTimeLeft(plan.duration);
        setAccuracy(0);
        accuracyRef.current = 0;
        setFeedbackUI("");
        feedbackRef.current = "";
    }, []);

    const updateFeedbackUI = useCallback((text: string) => {
        // อัปเดต UI ให้ตรงกับ text ถ้ามันเปลี่ยนไป
        if (text !== feedbackRef.current) {
            feedbackRef.current = text;
            setFeedbackUI(text);
        }
    }, []);

    // Function to calculate angle between three points (A, B, C)
    const calculateAngle = (a: any, b: any, c: any) => {
        if(!a || !b || !c) return 0;
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    // Calculate pose accuracy logic
    const calculateAccuracy = useCallback((landmarks: any[]) => {
        if (!landmarks || landmarks.length === 0 || !currentPose) return { score: 0, feedback: "" };

        // 1. Dynamic Check based on `conditions` if available
        if (currentPose.conditions && currentPose.conditions.length > 0) {
            let totalScore = 0;
            let totalWeight = 0;
            let currentFeedback = "";

            currentPose.conditions.forEach(rule => {
                const p1 = landmarks[rule.points[0]];
                const p2 = landmarks[rule.points[1]];
                const p3 = landmarks[rule.points[2]];

                if (p1 && p2 && p3) {
                    const angle = calculateAngle(p1, p2, p3);
                    let score = 0;
                    
                    if (angle >= rule.min && angle <= rule.max) {
                        score = 100;
                    } else {
                        // Calculate deviation range
                        const distMin = Math.abs(angle - rule.min);
                        const distMax = Math.abs(angle - rule.max);
                        const deviation = Math.min(distMin, distMax);
                        
                        score = Math.max(0, 100 - (deviation * 2));

                        // ให้คำแนะนำจากจุดแรกที่ผิดพลาด
                        if (!currentFeedback) { 
                            if (angle < rule.min) {
                                currentFeedback = `กรุณากางขยับหรือเพิ่มมุม ${rule.name} ขึ้นอีกนิดค่ะ`;
                            } else {
                                currentFeedback = `กรุณาหดหรือปรับมุม ${rule.name} ลงอีกนิดค่ะ`;
                            }
                        }
                    }

                    const weight = rule.weight || 1;
                    totalScore += score * weight;
                    totalWeight += weight;
                }
            });

            const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
            const threshold = currentPose.pose_accuracy || 80;
            return { score: finalScore, feedback: finalScore < threshold ? currentFeedback : "" };
        }

        // 2. Fallback to Simple Single Point Check (from DB columns)
        if (currentPose.pose_point) {
            try {
                const points = JSON.parse(currentPose.pose_point);
                if (Array.isArray(points) && points.length === 3) {
                     const p1 = landmarks[points[0]];
                     const p2 = landmarks[points[1]];
                     const p3 = landmarks[points[2]];
                     
                     if (p1 && p2 && p3) {
                         const angle = calculateAngle(p1, p2, p3);
                         const min = currentPose.pose_min || 0;
                         const max = currentPose.pose_max || 180;
                         
                         if (angle >= min && angle <= max) return { score: 100, feedback: "" };
                         
                         const deviation = Math.min(Math.abs(angle - min), Math.abs(angle - max));
                         const score = Math.max(0, 100 - (deviation * 2));
                         
                         let feedback = "";
                         if (angle < min) feedback = "กรุณากางข้อต่อ หรือเพิ่มองศาขึ้นอีกนิดนะคะ";
                         if (angle > max) feedback = "กรุณาหุบข้อต่อ หรือลดองศาลงอีกนิดนะคะ";
                         
                         const threshold = currentPose.pose_accuracy || 80;
                         return { score, feedback: score < threshold ? feedback : "" };
                     }
                }
            } catch (e) {
                console.error("Error parsing pose_point", e);
            }
        }

        return { score: 0, feedback: "ไม่พบจุดระบุตำแหน่งในพื้นที่กล้อง" };
    }, [currentPose]);

    // Fetch Game Plan from Database
    useEffect(() => {
        let isMounted = true;
        const fetchGamePlan = async () => {
            try {
                const data = await apiClient.get('/game/plan');
                if (isMounted && data) {
                    setProcessData(data.process);
                    
                    if (data.is_blocked) {
                        setIsBlockedToday(true);
                        return; // Stop loading if they are blocked
                    }
                    
                    if (data.plans && data.plans.length > 0) {
                        setAllPlans(data.plans);
                        setCurrentPlanIndex(0);
                        loadPlan(data.plans[0]);
                    } else {
                        // Fallback to MOCK_POSE if no plans found
                        setCurrentPose(MOCK_POSE);
                        setTimeLeft(60); 
                    }
                }
            } catch (error) {
                console.error("Failed to fetch game plan:", error);
                if (isMounted) {
                    setCurrentPose(MOCK_POSE); // Fallback
                    setTimeLeft(60);
                }
            }
        };

        fetchGamePlan();

        return () => { isMounted = false; };
    }, [loadPlan]);

    // Timer Logic
    useEffect(() => {
        if (!isRunning || !currentPose || showTransition || isDayCompleted) return;
        
        const threshold = currentPose.pose_accuracy || 80;
        
        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) return 0;
                if (accuracyRef.current >= threshold) {
                    return prev - 1;
                }
                return prev;
            });
        }, 1000);
        
        return () => clearInterval(timerId);
    }, [isRunning, currentPose, showTransition, isDayCompleted]);

    // Track Time reaching 0 -> Transition
    useEffect(() => {
        if (timeLeft === 0 && isRunning && currentPose && !showTransition && !isDayCompleted) {
            // หมดเวลา ท่าปัจจุบันสำเร็จ
            const nextIndex = currentPlanIndex + 1;
            if (nextIndex < allPlans.length) {
                setShowTransition(true);
                setTransitionCountdown(5); // วินาทีนับถอยหลังไปท่าต่อไป
            } else {
                setIsDayCompleted(true);
                // Call API to complete the day and update userprogress
                apiClient.post('/game/complete', {}).catch(e => console.error("Failed to complete day", e));
            }
        }
    }, [timeLeft, isRunning, showTransition, isDayCompleted, currentPose, currentPlanIndex, allPlans]);

    // Handle Transition Countdown
    useEffect(() => {
        if (showTransition && transitionCountdown > 0) {
            const timerId = setInterval(() => {
                setTransitionCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else if (showTransition && transitionCountdown === 0) {
            // นับครบแล้ว เปลี่ยนไปท่าถัดไป
            setShowTransition(false);
            const nextIndex = currentPlanIndex + 1;
            setCurrentPlanIndex(nextIndex);
            loadPlan(allPlans[nextIndex]);
        }
    }, [showTransition, transitionCountdown, currentPlanIndex, allPlans, loadPlan]);

    useEffect(() => {
        let camera: CameraType | null = null;
        let isMounted = true;

        const loadMediaPipe = async () => {
            const poseModule = await import('@mediapipe/pose');
            const cameraUtils = await import('@mediapipe/camera_utils');
            const drawingUtils = await import('@mediapipe/drawing_utils');
            
            const Pose = poseModule.Pose;
            const Camera = cameraUtils.Camera;
            const drawConnectors = drawingUtils.drawConnectors;
            const drawLandmarks = drawingUtils.drawLandmarks;
            const POSE_CONNECTIONS = poseModule.POSE_CONNECTIONS;

            const pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            pose.onResults((results: ResultsType) => {
                 if (!isMounted || !canvasRef.current || !webcamRef.current?.video || !isRunning) return;

                const videoWidth = webcamRef.current.video.videoWidth;
                const videoHeight = webcamRef.current.video.videoHeight;

                canvasRef.current.width = videoWidth;
                canvasRef.current.height = videoHeight;

                const canvasCtx = canvasRef.current.getContext('2d');
                if (!canvasCtx) return;

                canvasCtx.save();
                canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
                
                // Draw the pose on the canvas
                if (results.poseLandmarks) {
                    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                        { color: '#00FF00', lineWidth: 4 });
                    drawLandmarks(canvasCtx, results.poseLandmarks,
                        { color: '#FF0000', lineWidth: 2 });

                    // Calculate accuracy and feedback
                    const { score, feedback } = calculateAccuracy(results.poseLandmarks);
                    const roundedScore = Math.round(score);
                    setAccuracy(roundedScore);
                    accuracyRef.current = roundedScore;
                    updateFeedbackUI(feedback);
                }
                canvasCtx.restore();
            });

            if (webcamRef.current?.video) {
                camera = new Camera(webcamRef.current.video, {
                    onFrame: async () => {
                        if (webcamRef.current?.video) {
                            await pose.send({ image: webcamRef.current.video });
                        }
                    },
                    width: 640,
                    height: 480
                });
                camera.start();
                cameraRef.current = camera;
            }
        };

        loadMediaPipe();

        return () => {
             isMounted = false;
             if (cameraRef.current) {
                 // cameraRef.current.stop(); 
             }
        }
    }, [calculateAccuracy, isRunning]);
    
    // Handlers
    const handleStop = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(true);
        setAccuracy(0);
        // Reset timer depending on logic, optionally refetch
    };

    if (isBlockedToday) {
        return (
            <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute top-10 left-10 text-9xl opacity-20 transform -rotate-12">🧘</div>
                <div className="absolute bottom-10 right-10 text-9xl opacity-20 transform rotate-12">☀️</div>
                <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl z-10 max-w-lg border-2 border-white/50">
                    <div className="text-8xl mb-6">✅</div>
                    <h1 className="text-3xl font-extrabold text-blue-800 mb-4">เยี่ยมมาก! สำหรับวันนี้</h1>
                    <p className="text-xl text-gray-700 font-medium mb-8 leading-relaxed">
                        คุณได้ทำภารกิจฝึกฝนของวันนี้เสร็จสิ้นเป็นที่เรียบร้อยแล้ว ร่างกายต้องการการพักผ่อน 
                        กลับมาฝึกต่อใหม่อีกครั้งในวันพรุ่งนี้นะครับ!
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105"
                    >
                        กลับสู่หน้าหลัก
                    </button>
                </div>
            </div>
        );
    }

    if (!currentPose && !isDayCompleted) {
        return <div className="min-h-screen bg-blue-100 flex items-center justify-center font-bold text-xl text-blue-800">กำลังเตรียมข้อมูลการฝึก... (Loading...)</div>;
    }

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center relative">
            
            {/* Day Completed Popup */}
            {isDayCompleted && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl text-center">
                        <div className="text-8xl mb-4">🎉</div>
                        <h2 className="text-3xl font-extrabold text-green-600 mb-2">ยินดีด้วย!</h2>
                        <p className="text-xl text-gray-700 font-bold">คุณออกกำลังกายทั้งหมดของวันนี้เสร็จสิ้นแล้ว</p>
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg"
                        >
                            กลับไปหน้าหลัก
                        </button>
                    </div>
                </div>
            )}
            
            {/* Transition Popup */}
            {showTransition && !isDayCompleted && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm">
                        <h2 className="text-3xl font-extrabold text-blue-600 mb-4">เยี่ยมมาก! ท่าสำเร็จ ✅</h2>
                        <p className="text-gray-600 text-lg mb-6">เตรียมตัวท่าถัดไปในอีก...</p>
                        <div className="text-7xl font-bold font-mono text-orange-500">
                            {transitionCountdown}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Top Bar with Controls and Stats */}
            <div className="w-full bg-white shadow p-4 flex justify-between items-center z-20">
                <div className="flex gap-4">
                     <button 
                        onClick={handleReset}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow transition-colors"
                     >
                        Reset
                     </button>
                     <button 
                        onClick={handleStop}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow transition-colors"
                     >
                        Stop
                     </button>
                </div>
                
                <div className="text-center">
                     <h1 className="text-xl md:text-2xl font-bold text-gray-800">ชื่อท่า: {currentPose.pose_name}</h1>
                     <p className="text-gray-600 font-medium">ความถูกต้อง: <span className="text-3xl font-bold text-blue-600">{accuracy}%</span></p>
                </div>

                {/* Right text: Timer & Progress */}
                <div className="text-right text-gray-800 min-w-[120px]">
                     <div className="text-lg font-bold text-orange-600">เวลา: {timeLeft} วิ</div>
                     {processData && <div className="text-sm font-semibold">วันที่ {processData.progress} / 30</div>}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center p-4 gap-4 md:gap-8">
                
                {/* Left Side: Player Camera */}
                <div className="relative w-full md:w-1/2 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        mirrored={true}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        style={{ transform: "scaleX(-1)" }}
                    />
                    {/* Label */}
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        ผู้เล่น (Player)
                    </div>
                     {/* Feedback Overlay based on Accuracy */}
                    {accuracy >= (currentPose?.pose_accuracy || 80) && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full font-bold animate-bounce shadow-lg">
                            เยี่ยมมาก! ถูกต้อง ✅
                        </div>
                    )}
                    {accuracy < (currentPose?.pose_accuracy || 80) && feedbackUI && (
                         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg whitespace-nowrap">
                             ⚠️ {feedbackUI}
                         </div>
                    )}
                </div>

                {/* Right Side: Reference Model / Description */}
                <div className="relative w-full md:w-1/2 aspect-video bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-white flex flex-col items-center justify-center p-6 text-center">
                    {/* Placeholder for Reference Image/Model */}
                    <div className="flex flex-col items-center mb-6">
                         <div className="text-9xl mb-4">🧘</div>
                         <p className="text-gray-400 font-bold text-xl">ตัวอย่างท่า (Reference)</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-bold text-blue-800 mb-2">คำอธิบาย:</h3>
                        <p className="text-gray-700">{currentPose.pose_description}</p>
                        <div className="mt-2 text-sm text-red-500 font-semibold">
                            ⚠️ ข้อควรระวัง: {currentPose.pose_condition}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GamePage;
