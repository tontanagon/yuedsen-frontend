
"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { apiClient } from "@/lib/api-client";
import { getAccuracyMode, type AccuracyMode } from './home/SettingsModal';

type CameraType = any;
type ResultsType = any;

interface PoseConditionRule {
    name: string;
    points: [number, number, number];
    min: number;
    max: number;
    weight?: number;
}

interface PoseLandmarkData {
    landmark_index: number;
    x: number;
    y: number;
    z: number;
    visibility: number;
}

interface PoseData {
    id: number;
    pose_name: string;
    pose_image?: string;
    pose_description: string;
    pose_condition: string;
    pose_point?: string;
    pose_min?: number;
    pose_max?: number;
    conditions?: PoseConditionRule[];
    pose_accuracy?: number;
    landmarks?: PoseLandmarkData[];
}

const MOCK_POSE: PoseData = {
    id: 1,
    pose_name: "Neck Side Stretch Left",
    pose_description: "เอียงศีรษะไปทางซ้าย ให้หูซ้ายชิดไหล่ซ้าย รูสึกตึงที่คอด้านขวา",
    pose_condition: "Keep your shoulders down.",
    pose_point: "[11, 13, 15]",
    pose_min: 160,
    pose_max: 180,
    conditions: [
        { name: "Left Elbow Extension",  points: [11, 13, 15], min: 160, max: 180, weight: 1 },
        { name: "Right Elbow Extension", points: [12, 14, 16], min: 160, max: 180, weight: 1 }
    ]
};

const TOTAL_SETS = 3;

const GamePage = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [accuracy, setAccuracy] = useState<number>(0);
    const [currentPose, setCurrentPose] = useState<PoseData | null>(null);
    const [isRunning] = useState<boolean>(true);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [processData, setProcessData] = useState<any>(null);
    const [feedbackUI, setFeedbackUI] = useState<string>("");
    const [accuracyMode, setAccuracyModeState] = useState<AccuracyMode>('angle');

    const [allPlans, setAllPlans] = useState<any[]>([]);
    const [currentPlanIndex, setCurrentPlanIndex] = useState<number>(0);
    const [currentSet, setCurrentSet] = useState<number>(1);         // ← Set ปัจจุบัน (1–3)
    const [showTransition, setShowTransition] = useState<boolean>(false);
    const [transitionType, setTransitionType] = useState<'pose' | 'set'>('pose'); // ← ประเภท overlay
    const [transitionCountdown, setTransitionCountdown] = useState<number>(3);
    const [isDayCompleted, setIsDayCompleted] = useState<boolean>(false);
    const [isBlockedToday, setIsBlockedToday] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const cameraRef = useRef<CameraType | null>(null);
    const feedbackRef = useRef<string>("");
    const accuracyRef = useRef<number>(0);

    // ── helpers ──────────────────────────────────────────────
    const loadPlan = useCallback((plan: any) => {
        const dbPose = plan.pose;
        setCurrentPose({
            id: dbPose.id,
            pose_name: dbPose.pose_name,
            pose_image: dbPose.pose_image,
            pose_description: dbPose.pose_description,
            pose_condition: dbPose.pose_condition,
            pose_point: dbPose.pose_point,
            pose_min: plan.pose_min,
            pose_max: plan.pose_max,
            pose_accuracy: plan.pose_accuracy,
            landmarks: dbPose.landmarks || [],
        });
        setTimeLeft(plan.duration);
        setAccuracy(0);
        accuracyRef.current = 0;
        setFeedbackUI("");
        feedbackRef.current = "";
    }, []);

    const updateFeedbackUI = useCallback((text: string) => {
        if (text !== feedbackRef.current) {
            feedbackRef.current = text;
            setFeedbackUI(text);
        }
    }, []);

    const calculateAngle = (a: any, b: any, c: any) => {
        if (!a || !b || !c) return 0;
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    // ── Landmark-based comparison (position mode) ──────────
    const calculateLandmarkAccuracy = useCallback((detectedLandmarks: any[]) => {
        if (!currentPose || !currentPose.landmarks || currentPose.landmarks.length === 0) {
            return { score: 0, feedback: "ไม่มีข้อมูล landmark สำหรับท่านี้" };
        }

        const refLandmarks = currentPose.landmarks;

        // ── Build normalization anchors (flexible) ──
        // Try shoulders (11,12) → hips (23,24) → centroid of all ref landmarks
        // Reference data is stored in raw camera (mirrored) coordinates.
        let anchorIndices: number[] = [];

        const findAnchorPair = (
            refList: PoseLandmarkData[],
            detList: any[],
            idxA: number,
            idxB: number
        ): { refCX: number; refCY: number; refS: number; detCX: number; detCY: number; detS: number } | null => {
            const rA = refList.find(l => l.landmark_index === idxA);
            const rB = refList.find(l => l.landmark_index === idxB);
            const dA = detList[idxA];
            const dB = detList[idxB];
            if (!rA || !rB) return null;
            if (!dA || !dB) return null;
            if ((dA.visibility && dA.visibility < 0.5) || (dB.visibility && dB.visibility < 0.5)) return null;
            const refS = Math.sqrt(Math.pow(rA.x - rB.x, 2) + Math.pow(rA.y - rB.y, 2));
            const detS = Math.sqrt(Math.pow(dA.x - dB.x, 2) + Math.pow(dA.y - dB.y, 2));
            if (refS < 0.01 || detS < 0.01) return null;
            anchorIndices = [idxA, idxB];
            return {
                refCX: (rA.x + rB.x) / 2, refCY: (rA.y + rB.y) / 2, refS,
                detCX: (dA.x + dB.x) / 2, detCY: (dA.y + dB.y) / 2, detS,
            };
        };

        // Try anchor pairs in order of preference
        let anchor = findAnchorPair(refLandmarks, detectedLandmarks, 11, 12); // shoulders
        if (!anchor) anchor = findAnchorPair(refLandmarks, detectedLandmarks, 23, 24); // hips

        // Fallback: use centroid & spread of all matched landmarks
        if (!anchor) {
            let rSumX = 0, rSumY = 0, dSumX = 0, dSumY = 0, cnt = 0;
            for (const ref of refLandmarks) {
                const det = detectedLandmarks[ref.landmark_index];
                if (!det || (det.visibility && det.visibility < 0.5)) continue;
                rSumX += ref.x; rSumY += ref.y;
                dSumX += det.x; dSumY += det.y;
                cnt++;
            }
            if (cnt < 2) return { score: 0, feedback: "⚠️ ไม่พบจุดอ้างอิงเพียงพอ กรุณาขยับให้เห็นลำตัวในกล้องค่ะ" };
            const refCX = rSumX / cnt, refCY = rSumY / cnt;
            const detCX = dSumX / cnt, detCY = dSumY / cnt;
            let rSpread = 0, dSpread = 0;
            for (const ref of refLandmarks) {
                const det = detectedLandmarks[ref.landmark_index];
                if (!det || (det.visibility && det.visibility < 0.5)) continue;
                rSpread += Math.sqrt(Math.pow(ref.x - refCX, 2) + Math.pow(ref.y - refCY, 2));
                dSpread += Math.sqrt(Math.pow(det.x - detCX, 2) + Math.pow(det.y - detCY, 2));
            }
            const refS = rSpread / cnt || 0.1;
            const detS = dSpread / cnt || 0.1;
            anchor = { refCX, refCY, refS, detCX, detCY, detS };
        }

        const { refCX, refCY, refS, detCX, detCY, detS } = anchor;

        // Compare each reference landmark against detected
        // Skip anchor landmarks (they always normalize to origin → 100% free score)
        let totalScore = 0;
        let matchedCount = 0;
        const tolerance = 0.35;

        for (const ref of refLandmarks) {
            // Skip anchor indices — they always match perfectly after normalization
            if (anchorIndices.includes(ref.landmark_index)) continue;

            const det = detectedLandmarks[ref.landmark_index];
            if (!det) continue;
            if (det.visibility && det.visibility < 0.5) continue;

            // Normalize positions relative to anchor center & scale
            const refNormX = (ref.x - refCX) / refS;
            const refNormY = (ref.y - refCY) / refS;
            const detNormX = (det.x - detCX) / detS;
            const detNormY = (det.y - detCY) / detS;

            const dist = Math.sqrt(Math.pow(refNormX - detNormX, 2) + Math.pow(refNormY - detNormY, 2));

            let pointScore: number;
            if (dist <= tolerance * 0.5) {
                pointScore = 100;
            } else if (dist <= tolerance) {
                pointScore = 100 - ((dist - tolerance * 0.5) / (tolerance * 0.5)) * 50;
            } else {
                pointScore = Math.max(0, 50 - ((dist - tolerance) / tolerance) * 100);
            }

            totalScore += pointScore;
            matchedCount++;
        }

        if (matchedCount === 0) return { score: 0, feedback: "⚠️ ไม่พบจุดที่ตรงกัน กรุณาปรับตำแหน่งค่ะ" };

        const finalScore = totalScore / matchedCount;
        const threshold = currentPose.pose_accuracy || 80;
        let feedback = "";
        if (finalScore < threshold) {
            feedback = finalScore < 40
                ? "กรุณาปรับท่าให้ตรงกับตัวอย่างค่ะ"
                : "เกือบถูกแล้ว ปรับอีกนิดค่ะ";
        }

        return { score: finalScore, feedback };
    }, [currentPose]);

    const calculateAccuracy = useCallback((landmarks: any[]) => {
        if (!landmarks || landmarks.length === 0 || !currentPose) return { score: 0, feedback: "" };

        // ── Landmark Mode ──
        if (accuracyMode === 'landmark' && currentPose.landmarks && currentPose.landmarks.length > 0) {
            return calculateLandmarkAccuracy(landmarks);
        }

        // ── Angle Mode (original) ──
        if (currentPose.conditions && currentPose.conditions.length > 0) {
            let totalScore = 0, totalWeight = 0, currentFeedback = "";
            currentPose.conditions.forEach(rule => {
                const p1 = landmarks[rule.points[0]];
                const p2 = landmarks[rule.points[1]];
                const p3 = landmarks[rule.points[2]];
                if (p1 && p2 && p3) {
                    let score = 0;
                    const minVis = 0.6;
                    if ((p1.visibility && p1.visibility < minVis) || (p2.visibility && p2.visibility < minVis) || (p3.visibility && p3.visibility < minVis)) {
                        currentFeedback = "⚠️ กรุณาขยับให้เห็นข้อต่อในกล้องชัดๆ ค่ะ";
                        score = 0;
                    } else {
                        const angle = calculateAngle(p1, p2, p3);
                        if (angle >= rule.min && angle <= rule.max) {
                            score = 100;
                        } else {
                            const deviation = Math.min(Math.abs(angle - rule.min), Math.abs(angle - rule.max));
                            score = Math.max(0, 100 - (deviation * 2));
                            if (!currentFeedback) {
                                currentFeedback = angle < rule.min
                                    ? `กรุณากางหรือเพิ่มมุม ${rule.name} ขึ้นอีกนิดค่ะ`
                                    : `กรุณาหดหรือปรับมุม ${rule.name} ลงอีกนิดค่ะ`;
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

        if (currentPose.pose_point) {
            try {
                const points = JSON.parse(currentPose.pose_point);
                if (Array.isArray(points) && points.length === 3) {
                    const p1 = landmarks[points[0]], p2 = landmarks[points[1]], p3 = landmarks[points[2]];
                    if (p1 && p2 && p3) {
                        const minVis = 0.6;
                        if ((p1.visibility && p1.visibility < minVis) || (p2.visibility && p2.visibility < minVis) || (p3.visibility && p3.visibility < minVis)) {
                            return { score: 0, feedback: "⚠️ จัดตำแหน่งให้เห็นแขน/ข้อต่อในกล้องให้ชัดขึ้นค่ะ" };
                        }
                        const angle = calculateAngle(p1, p2, p3);
                        let min = currentPose.pose_min || 0, max = currentPose.pose_max || 0;
                        if (min === 0 && max === 0) { min = 150; max = 180; } else if (max === 0) { max = 180; }
                        if (angle >= min && angle <= max) return { score: 100, feedback: "" };
                        const deviation = Math.min(Math.abs(angle - min), Math.abs(angle - max));
                        const score = Math.max(0, 100 - (deviation * 2));
                        const threshold = currentPose.pose_accuracy || 80;
                        return { score, feedback: score < threshold ? (angle < min ? "กรุณากางข้อต่อ / เพิ่มองศาขึ้นอีกนิดนะคะ" : "กรุณาหุบข้อต่อ / ลดองศาลงอีกนิดนะคะ") : "" };
                    }
                }
            } catch (e) { console.error("Error parsing pose_point", e); }
        }
        return { score: 0, feedback: "ไม่พบจุดระบุตำแหน่งในพื้นที่กล้อง" };
    }, [currentPose, accuracyMode, calculateLandmarkAccuracy]);

    // ── Read accuracy mode from localStorage ──────────────────
    useEffect(() => {
        setAccuracyModeState(getAccuracyMode());
    }, []);

    // ── Fetch plan ────────────────────────────────────────────
    useEffect(() => {
        let isMounted = true;
        const fetchGamePlan = async () => {
            try {
                const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
                const categoryId = searchParams.get('category_id') || '1';
                const data = await apiClient.get(`/game/plan?category_id=${categoryId}`);
                if (isMounted && data) {
                    setProcessData(data.process);
                    if (data.is_blocked) { setIsBlockedToday(true); return; }
                    if (data.plans && data.plans.length > 0) {
                        setAllPlans(data.plans);
                        setCurrentPlanIndex(0);
                        loadPlan(data.plans[0]);
                    } else {
                        setCurrentPose(MOCK_POSE);
                        setTimeLeft(60);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch game plan:", error);
                if (isMounted) { setCurrentPose(MOCK_POSE); setTimeLeft(60); }
            }
        };
        fetchGamePlan();
        return () => { isMounted = false; };
    }, [loadPlan]);

    // ── Sound: Web Audio API ding ────────────────────────────
    const playDing = useCallback((type: 'pose' | 'day' = 'pose') => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            const play = (freq: number, startAt: number, duration: number, gain: number) => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
                gainNode.gain.setValueAtTime(0, ctx.currentTime + startAt);
                gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startAt + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
                osc.start(ctx.currentTime + startAt);
                osc.stop(ctx.currentTime + startAt + duration + 0.05);
            };

            if (type === 'pose') {
                // เสียง "ติ๊ง" 2 โน้ต สั้น
                play(880, 0,    0.35, 0.4);  // A5
                play(1174, 0.2, 0.45, 0.3); // D6
            } else {
                // เสียง "ติ๊งติ๊งติ๊ง" 3 โน้ต ยาวกว่า (จบวัน)
                play(880,  0,   0.3, 0.4);
                play(1047, 0.2, 0.3, 0.35);
                play(1319, 0.4, 0.6, 0.45);
            }

            // ปิด context หลังเสียงเล่นจบ
            setTimeout(() => ctx.close(), 1500);
        } catch (e) {
            console.warn('Web Audio not supported', e);
        }
    }, []);

    // ── Timer ─────────────────────────────────────────────────
    useEffect(() => {
        if (!isRunning || !currentPose || showTransition || isDayCompleted) return;
        const threshold = currentPose.pose_accuracy || 80;
        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) return 0;
                return accuracyRef.current >= threshold ? prev - 1 : prev;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [isRunning, currentPose, showTransition, isDayCompleted]);

    useEffect(() => {
        if (timeLeft === 0 && isRunning && currentPose && !showTransition && !isDayCompleted) {
            const nextIndex = currentPlanIndex + 1;
            if (nextIndex < allPlans.length) {
                // ยังมีท่าถัดไปใน set นี้
                playDing('pose');
                setTransitionType('pose');
                setShowTransition(true);
                setTransitionCountdown(3);
            } else {
                // ท่าสุดท้ายของ set — เช็กว่าครบ 3 set หรือยัง
                const nextSet = currentSet + 1;
                if (nextSet <= TOTAL_SETS) {
                    // ยังไม่ครบ 3 set → เริ่ม set ใหม่
                    playDing('pose');
                    setTransitionType('set');
                    setCurrentSet(nextSet);
                    setShowTransition(true);
                    setTransitionCountdown(5); // พัก 5 วิ ระหว่าง set
                } else {
                    // ครบ 3 set → จบวัน!
                    playDing('day');
                    setIsDayCompleted(true);
                    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
                    const categoryId = parseInt(searchParams.get('category_id') || '1', 10);
                    apiClient.post('/game/complete', { category_id: categoryId }).catch(e => console.error("Failed to complete day", e));
                }
            }
        }
    }, [timeLeft, isRunning, showTransition, isDayCompleted, currentPose, currentPlanIndex, allPlans, currentSet, playDing]);

    useEffect(() => {
        if (showTransition && transitionCountdown > 0) {
            const timerId = setInterval(() => setTransitionCountdown(prev => prev - 1), 1000);
            return () => clearInterval(timerId);
        } else if (showTransition && transitionCountdown === 0) {
            setShowTransition(false);
            if (transitionType === 'set') {
                // เริ่ม set ใหม่ → กลับท่าแรก
                setCurrentPlanIndex(0);
                loadPlan(allPlans[0]);
            } else {
                // ท่าถัดไปใน set เดิม
                const nextIndex = currentPlanIndex + 1;
                setCurrentPlanIndex(nextIndex);
                loadPlan(allPlans[nextIndex]);
            }
        }
    }, [showTransition, transitionCountdown, transitionType, currentPlanIndex, allPlans, loadPlan]);

    // ── MediaPipe ─────────────────────────────────────────────
    useEffect(() => {
        let isMounted = true;
        const loadMediaPipe = async () => {
            try {
                const poseModule = await import('@mediapipe/pose');
                const cameraUtils = await import('@mediapipe/camera_utils');
                const drawingUtils = await import('@mediapipe/drawing_utils');
                const Pose = poseModule.Pose;
                const Camera = cameraUtils.Camera;
                const drawConnectors = drawingUtils.drawConnectors;
                const drawLandmarks = drawingUtils.drawLandmarks;
                const POSE_CONNECTIONS = poseModule.POSE_CONNECTIONS;

                const pose = new Pose({ locateFile: (file) => `/mediapipe/pose/${file}` });
                pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, smoothSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

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
                    if (results.poseLandmarks) {
                        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#22c55e', lineWidth: 4 });
                        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#ffffff', lineWidth: 2, radius: 4 });
                        const { score, feedback } = calculateAccuracy(results.poseLandmarks);
                        const roundedScore = Math.round(score);
                        setAccuracy(roundedScore);
                        accuracyRef.current = roundedScore;
                        updateFeedbackUI(feedback);
                    }
                    canvasCtx.restore();
                });

                if (webcamRef.current?.video) {
                    const camera = new Camera(webcamRef.current.video, {
                        onFrame: async () => { if (webcamRef.current?.video) await pose.send({ image: webcamRef.current.video }); },
                        width: 640, height: 480
                    });
                    try {
                        await camera.start();
                        if (isMounted) setCameraError(null);
                        cameraRef.current = camera;
                    } catch (camErr: any) {
                        if (!isMounted) return;
                        const name = camErr?.name || '';
                        if (name === 'NotReadableError' || name === 'TrackStartError') {
                            setCameraError('camera_busy');
                        } else if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
                            setCameraError('camera_denied');
                        } else {
                            setCameraError('camera_error');
                        }
                    }
                }
            } catch (err: any) {
                if (isMounted) setCameraError('camera_error');
                console.error('MediaPipe load error', err);
            }
        };
        loadMediaPipe();
        return () => { isMounted = false; };
    }, [calculateAccuracy, isRunning]);


    const threshold = currentPose?.pose_accuracy || 80;
    const accuracyColor = accuracy >= threshold ? "#22c55e" : accuracy >= threshold * 0.7 ? "#f59e0b" : "#ef4444";
    const poseImageSrc = currentPose?.pose_image
        ? (currentPose.pose_image.startsWith('http')
            ? currentPose.pose_image
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${currentPose.pose_image.replace(/^\/+/, '')}`)
        : null;


    // ── Blocked screen ────────────────────────────────────────
    if (isBlockedToday) {
        return (
            <div className="min-h-screen flex flex-col font-sans overflow-hidden relative bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/background_home_heal.png')" }}>
                <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px] pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3 px-5 pt-10 pb-4">
                    <button onClick={() => window.location.href = '/'}
                        className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-full shadow-md flex items-center justify-center border border-white/80 hover:bg-white/90 transition-all duration-200 active:scale-95">
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 pb-10 relative z-10">
                    <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/70 p-10 flex flex-col items-center gap-4 text-center">
                        <div className="text-7xl">✅</div>
                        <h1 className="text-2xl font-extrabold text-gray-800">เยี่ยมมาก!</h1>
                        <p className="text-gray-500 leading-relaxed">คุณทำภารกิจของวันนี้เสร็จสิ้นแล้ว กลับมาฝึกต่อในวันพรุ่งนี้นะคะ</p>
                        <button onClick={() => window.location.href = '/'}
                            className="mt-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all">
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentPose && !isDayCompleted) {
        return (
            <div className="min-h-screen flex flex-col font-sans overflow-hidden relative bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/background_home_heal.png')" }}>
                <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px] pointer-events-none" />
                <div className="relative z-10 flex-1 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl px-10 py-8 shadow-xl border border-white/70 text-center">
                        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="font-bold text-gray-600">กำลังเตรียมข้อมูลการฝึก...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans overflow-hidden relative bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/background_home_heal.png')" }}>
            <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px] pointer-events-none" />

            {/* ── Day Completed Overlay ── */}
            {isDayCompleted && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
                    <div className="bg-white/95 backdrop-blur-md px-14 py-14 rounded-3xl shadow-2xl text-center w-full max-w-lg mx-6 border border-white/80"
                        style={{ animation: "modalAppear 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}>
                        <div className="text-9xl mb-6">🎉</div>
                        <h2 className="text-4xl font-extrabold text-emerald-700 mb-3">ยินดีด้วย!</h2>
                        <p className="text-xl text-gray-600 font-medium mb-8 leading-relaxed">คุณออกกำลังกายทั้งหมดของวันนี้<br/>เสร็จสิ้นเรียบร้อยแล้ว 💪</p>
                        <button onClick={() => window.location.href = '/'}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-lg py-4 px-12 rounded-full shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all">
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            )}

            {/* ── Transition Overlay ── */}
            {showTransition && !isDayCompleted && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md">
                    <div className="bg-white/95 backdrop-blur-md px-14 py-14 rounded-3xl shadow-2xl text-center w-full max-w-lg mx-6 border border-white/80"
                        style={{ animation: "modalAppear 0.4s cubic-bezier(0.16,1,0.3,1) forwards" }}>
                        {transitionType === 'set' ? (
                            <>
                                <div className="text-8xl mb-5">💪</div>
                                <h2 className="text-4xl font-extrabold text-emerald-700 mb-2">Set {currentSet - 1} สำเร็จ!</h2>
                                <p className="text-lg text-gray-500 mb-1">เหลืออีก {TOTAL_SETS - (currentSet - 1)} set</p>
                                <div className="flex justify-center gap-2 mb-6">
                                    {Array.from({ length: TOTAL_SETS }).map((_, i) => (
                                        <div key={i} className={`w-4 h-4 rounded-full ${
                                            i < currentSet - 1 ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`} />
                                    ))}
                                </div>
                                <p className="text-xl text-gray-500 mb-6">พักสักครู่ เริ่ม Set {currentSet} ในอีก...</p>
                                <div className="text-8xl font-bold font-mono text-emerald-600 leading-none">{transitionCountdown}</div>
                            </>
                        ) : (
                            <>
                                <div className="text-8xl mb-5">✅</div>
                                <h2 className="text-4xl font-extrabold text-emerald-700 mb-3">ท่าสำเร็จ!</h2>
                                <p className="text-xl text-gray-500 mb-6">เตรียมตัวท่าถัดไปในอีก...</p>
                                <div className="text-8xl font-bold font-mono text-emerald-600 leading-none">{transitionCountdown}</div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Top Bar ── */}
            <div className="relative z-10 w-full">
                <div className="flex items-center gap-3 px-5 pt-8 pb-3">
                    {/* Back button */}
                    <button onClick={() => window.history.back()}
                        className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-full shadow-md flex items-center justify-center border border-white/80 hover:bg-white/90 transition-all duration-200 active:scale-95 flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Pose name */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#2A6546] to-[#3B9E6E] bg-clip-text text-transparent truncate">
                            {currentPose?.pose_name || "กำลังโหลด..."}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">
                            {processData && `วันที่ ${processData.progress} / 30 · `}
                            Set {currentSet}/{TOTAL_SETS} · ท่าที่ {currentPlanIndex + 1}/{allPlans.length || 1}
                        </p>
                    </div>

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Timer */}
                        <div className="bg-white/70 backdrop-blur-md rounded-full border border-white/80 px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-bold text-gray-700">{timeLeft}s</span>
                        </div>
                        {/* Accuracy */}
                        <div className="bg-white/70 backdrop-blur-md rounded-full border border-white/80 px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                            <div className="w-2 h-2 rounded-full" style={{ background: accuracyColor }} />
                            <span className="text-sm font-bold" style={{ color: accuracyColor }}>{accuracy}%</span>
                        </div>
                    </div>
                </div>

                {/* Accuracy progress bar */}
                <div className="mx-5 h-2 bg-white/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${accuracy}%`, background: accuracyColor }} />
                </div>

                {/* Feedback Banner — ใหญ่ ชัด อยู่บนหัว */}
                <div className="mx-4 mt-2 mb-1 min-h-[52px] flex items-center justify-center">
                    {accuracy >= threshold ? (
                        <div className="w-full flex items-center justify-center gap-3 bg-emerald-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg">
                            <span className="text-2xl">✅</span>
                            <span className="text-xl font-extrabold tracking-wide">ท่าถูกต้อง เยี่ยมมาก!</span>
                        </div>
                    ) : feedbackUI ? (
                        <div className="w-full flex items-center justify-center gap-3 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg">
                            <span className="text-2xl">⚠️</span>
                            <span className="text-xl font-extrabold text-center leading-snug">{feedbackUI}</span>
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-center gap-2 bg-white/50 backdrop-blur-sm text-gray-500 px-6 py-3 rounded-2xl border border-white/60">
                            <span className="text-lg">🎯</span>
                            <span className="text-base font-semibold">ทำท่าตามตัวอย่างด้านขวา</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Content: split 50/50 ── */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-3 p-4 md:p-5 min-h-0">

                {/* LEFT 50%: Webcam */}
                <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden shadow-xl border-2 border-white/70 bg-black"
                    style={{ minHeight: '300px' }}>
                    <Webcam ref={webcamRef} audio={false} mirrored={true}
                        className="absolute inset-0 w-full h-full object-cover" />
                    <canvas ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        style={{ transform: "scaleX(-1)" }} />

                    {/* Camera label */}
                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full z-20">
                        📷 กล้องของคุณ
                    </div>
                </div>

                {/* RIGHT 50%: Reference image — ใหญ่เต็มพื้นที่ */}
                <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden shadow-xl border-2 border-white/70 bg-white/80 backdrop-blur-md flex flex-col"
                    style={{ minHeight: '300px' }}>

                    {/* Header bar */}
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 px-4 py-3 flex items-center gap-2 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white/80" />
                        <span className="text-white text-sm font-bold tracking-wide">🎯 ท่าตัวอย่าง</span>
                        <span className="ml-auto text-white/70 text-xs font-medium">{currentPose?.pose_name}</span>
                    </div>

                    {/* Image — เต็มพื้นที่ ไม่มีขอบเสีย */}
                    <div className="flex-1 flex items-center justify-center p-4 relative">
                        {poseImageSrc ? (
                            <img
                                src={poseImageSrc}
                                alt={currentPose?.pose_name}
                                className="w-full h-full object-contain drop-shadow-lg"
                                style={{ maxHeight: '100%' }}
                                onError={(e) => {
                                    const fb = currentPose?.pose_image;
                                    if (fb) (e.target as HTMLImageElement).src = fb.startsWith('/') ? fb : `/${fb}`;
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="text-[120px] leading-none">🧘</div>
                                <p className="text-gray-400 text-sm font-medium">ไม่มีรูปตัวอย่าง</p>
                            </div>
                        )}
                    </div>

                    {/* Description strip ล่าง — compact */}
                    <div className="flex-shrink-0 border-t border-gray-100 bg-white/60 px-4 py-3 flex flex-col gap-1.5">
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                            {currentPose?.pose_description || "—"}
                        </p>
                        {currentPose?.pose_condition && (
                            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                                <span>⚠️</span>
                                <span>{currentPose.pose_condition}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes modalAppear {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
            `}</style>

        </div>
    );
};

export default GamePage;
