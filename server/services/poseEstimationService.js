// Step-by-Step MediaPipe Pose Estimation & Joint Analytics Simulator

// MediaPipe 33 Landmark Names
const LANDMARK_NAMES = [
  "nose", "left_eye_inner", "left_eye", "left_eye_outer",
  "right_eye_inner", "right_eye", "right_eye_outer",
  "left_ear", "right_ear", "mouth_left", "mouth_right",
  "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_pinky", "right_pinky",
  "left_index", "right_index", "left_thumb", "right_thumb",
  "left_hip", "right_hip", "left_knee", "right_knee",
  "left_ankle", "right_ankle", "left_heel", "right_heel",
  "left_foot_index", "right_foot_index"
];

export const analyzePoseLandmarks = (photo, queryStr) => {
  const idNum = parseInt(photo.id) || Date.now();
  const isSitting = queryStr.toLowerCase().includes("sitting");
  
  // 1. Generate 33 landmarks coordinates (X, Y, Z, Visibility)
  // Coordinates are relative to image dimensions (0.0 to 1.0)
  const landmarks = LANDMARK_NAMES.map((name, index) => {
    // Generate deterministic coordinate patterns based on index and ID
    let x = 0.5 + Math.sin(index + idNum) * 0.15;
    let y = 0.2 + (index * 0.02) + Math.cos(index - idNum) * 0.08;
    let z = Math.sin(index - idNum) * 0.1;
    let visibility = 0.85 + (index % 15) * 0.01;

    // Adjust Y coordinate thresholds for lower body if sitting
    if (isSitting && index >= 23) {
      y += 0.2; // knees and ankles bent higher
    }

    return {
      name,
      x: parseFloat(x.toFixed(4)),
      y: parseFloat(y.toFixed(4)),
      z: parseFloat(z.toFixed(4)),
      visibility: parseFloat(visibility.toFixed(4))
    };
  });

  // 2. Perform Trigonometric & Vector calculations to estimate joint angles and postures
  // Calculate Arm angles (Shoulder-Elbow-Wrist vectors)
  const calculateJointAngle = (jointA, jointB, jointC) => {
    const vectorBA = { x: jointA.x - jointB.x, y: jointA.y - jointB.y };
    const vectorBC = { x: jointC.x - jointB.x, y: jointC.y - jointB.y };

    const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
    const magBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y);
    const magBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);

    if (magBA === 0 || magBC === 0) return 180;
    const cosAngle = dotProduct / (magBA * magBC);
    // Clamp to prevent floating-point precision domain errors
    const angleRad = Math.acos(Math.max(-1.0, Math.min(1.0, cosAngle)));
    return Math.round((angleRad * 180) / Math.PI);
  };

  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  const rightShoulder = landmarks[12];
  const rightElbow = landmarks[14];
  const rightWrist = landmarks[16];

  const leftArmAngle = calculateJointAngle(leftShoulder, leftElbow, leftWrist);
  const rightArmAngle = calculateJointAngle(rightShoulder, rightElbow, rightWrist);

  // Estimate Body Rotation (Hip-Shoulder depth difference)
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const hipXDiff = Math.abs(leftHip.x - rightHip.x);
  const bodyRotation = Math.round(hipXDiff * 180); // angle of rotation relative to face-on position

  // Estimate Pose Symmetry (Bilateral joint distance variance)
  const poseSymmetry = Math.round(100 - (Math.abs(leftShoulder.y - rightShoulder.y) * 100));

  return {
    landmarks,
    calculations: {
      standingOrSitting: isSitting ? "Sitting" : "Standing",
      bodyRotation: `${bodyRotation} degrees`,
      armAngles: {
        left: `${leftArmAngle}°`,
        right: `${rightArmAngle}°`
      },
      poseSymmetry: `${Math.min(100, Math.max(0, poseSymmetry))}%`,
      distanceBetweenPeople: queryStr.toLowerCase().includes("solo") ? "N/A" : "3.2 feet"
    }
  };
};
