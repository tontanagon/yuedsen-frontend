
"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

// Types for dynamically loaded modules
type CameraType = any;
type PoseType = any;
type ResultsType = any;

const GamePage = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [accuracy, setAccuracy] = useState<number>(0);
    const [poseName, setPoseName] = useState<string>("ท่า T-Pose"); // Default to T-Pose
    const [isRunning, setIsRunning] = useState<boolean>(true);
    
    // We don't strictly need to store camera in ref if we don't access it outside useEffect,
    // but good for cleanup.
    const cameraRef = useRef<CameraType | null>(null);

    // Function to calculate angle between three points (A, B, C)
    const calculateAngle = (a: any, b: any, c: any) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    // Calculate pose accuracy logic
    const calculateAccuracy = useCallback((landmarks: any[]) => {
        if (!landmarks || landmarks.length === 0) return 0;

        // Example: T-Pose Check (Shoulders and Elbows alignment)
        // Landmarks: 11=Left Shoulder, 12=Right Shoulder, 13=Left Elbow, 14=Right Elbow, 15=Left Wrist, 16=Right Wrist
        
        const leftShoulder = landmarks[11];
        const leftElbow = landmarks[13];
        const leftWrist = landmarks[15];
        const leftHip = landmarks[23];

        const rightShoulder = landmarks[12];
        const rightElbow = landmarks[14];
        const rightWrist = landmarks[16];
        const rightHip = landmarks[24];

        // 1. Straight Arms (Elbow Angle ~ 180)
        const leftArmStraight = calculateAngle(leftShoulder, leftElbow, leftWrist);
        const rightArmStraight = calculateAngle(rightShoulder, rightElbow, rightWrist);

        // 2. Arms Horizontal (Shoulder-Hip-Elbow ~ 90)
        const leftArmLift = calculateAngle(leftHip, leftShoulder, leftElbow);
        const rightArmLift = calculateAngle(rightHip, rightShoulder, rightElbow);

        // Ideal T-Pose: Straight=180, Lift=90.
        const deviation = 
            Math.abs(180 - leftArmStraight) + 
            Math.abs(180 - rightArmStraight) + 
            Math.abs(90 - leftArmLift) + 
            Math.abs(90 - rightArmLift);
        
        // Normalize to a 0-100 score.
        let score = 100 - (deviation / 1.5);
        return Math.max(0, Math.min(100, score));
    }, []);

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

                    // Calculate accuracy
                    const currentAccuracy = calculateAccuracy(results.poseLandmarks);
                    setAccuracy(Math.round(currentAccuracy));
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
             // Cleanup logic
             if (cameraRef.current) {
                 // Try to stop if possible to free resources
                 try {
                    // cameraRef.current.stop(); 
                 } catch(e) {
                     console.error("Error stopping camera", e);
                 }
             }
        }
    }, [calculateAccuracy, isRunning]);
    
    // Handlers
    const handleStop = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(true);
        setAccuracy(0);
    };

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center">
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
                     <h1 className="text-xl md:text-2xl font-bold text-gray-800">ชื่อท่า: {poseName}</h1>
                     <p className="text-gray-600 font-medium">ทำได้: <span className="text-3xl font-bold text-blue-600">{accuracy}%</span></p>
                </div>

                {/* Placeholder for layout balance */}
                <div className="w-32"></div>
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
                </div>

                {/* Right Side: Reference Model */}
                <div className="relative w-full md:w-1/2 aspect-video bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-white flex items-center justify-center">
                    {/* Placeholder for Reference Image/Model */}
                    <div className="flex flex-col items-center animate-pulse">
                         <div className="text-9xl mb-4">👷</div>
                         <p className="text-gray-400 font-bold text-xl">ตัวอย่างท่า (Reference)</p>
                    </div>
                    {/* You can replace the above div with an actual <img src="..." /> */}
                </div>

            </div>
        </div>
    );
};

export default GamePage;
