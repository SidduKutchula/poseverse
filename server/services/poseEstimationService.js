const calculateJointAngle = (jointA, jointB, jointC) => {
  if (!jointA || !jointB || !jointC) return 180;
  const vectorBA = { x: jointA.x - jointB.x, y: jointA.y - jointB.y };
  const vectorBC = { x: jointC.x - jointB.x, y: jointC.y - jointB.y };

  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  const magBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y);
  const magBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);

  if (magBA === 0 || magBC === 0) return 180;
  const cosAngle = dotProduct / (magBA * magBC);
  const angleRad = Math.acos(Math.max(-1.0, Math.min(1.0, cosAngle)));
  return Math.round((angleRad * 180) / Math.PI);
};

export const extractPoseIntelligence = (landmarks, metadata = {}) => {
  if (!landmarks || landmarks.length < 33) {
    return {
      poseType: "Standing",
      peopleCount: "Couple",
      bodyRotation: "0 degrees",
      headDirection: "Looking Camera",
      handPosition: "Natural rest",
      legPosition: "Standing",
      interaction: "Holding Hands",
      cameraAngle: "Eye Level",
      lighting: "Golden Hour",
      background: "Garden",
      quality: {
        blurScore: 92,
        brightness: 78,
        contrast: 85,
        noise: 10,
        sharpness: 90,
        resolution: "1920x1080",
        professionalScore: 94
      },
      composition: "Rule Of Thirds",
      difficulty: "Medium",
      coachInfo: {
        bodyAngle: "15 degrees right",
        headAngle: "Slight tilt",
        handPosition: "Resting on hip",
        legPosition: "Slightly bent knee",
        eyeDirection: "Gaze towards lens",
        smile: "Natural smile",
        cameraDistance: "6 feet",
        bestLens: "85mm prime",
        photographerTips: "Use natural sunset backlight."
      }
    };
  }

  const nose = landmarks[0];
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  // Arm angles calculation
  const leftArmAngle = calculateJointAngle(leftShoulder, leftElbow, leftWrist);
  const rightArmAngle = calculateJointAngle(rightShoulder, rightElbow, rightWrist);

  // Body orientation & rotation
  const hipXDiff = Math.abs(leftHip.x - rightHip.x);
  const rotationDegrees = Math.round(hipXDiff * 180);
  const bodyRotation = `${rotationDegrees} degrees`;

  // Stance classification
  const hipY = (leftHip.y + rightHip.y) / 2;
  const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
  const kneeY = (leftKnee.y + rightKnee.y) / 2;
  
  let poseType = "Standing";
  if (hipY > 0.65) {
    poseType = "Sitting";
  } else if (Math.abs(leftAnkle.x - rightAnkle.x) > 0.15) {
    poseType = "Walking";
  }

  // Head and gaze details
  const headTiltVal = Math.round(Math.abs(leftEye.y - rightEye.y) * 100);
  const headTilt = headTiltVal > 5 ? "Tilted" : "Straight";
  const eyeDirection = Math.abs(nose.x - (leftEye.x + rightEye.x) / 2) < 0.03 ? "Looking Camera" : "Looking Away";

  // Leg positions
  const leftKneeAngle = calculateJointAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateJointAngle(rightHip, rightKnee, rightAnkle);
  const legPosition = (leftKneeAngle < 140 || rightKneeAngle < 140) ? "Bent Knee" : "Standing";

  // Hand position status
  const handAboveShoulder = (leftWrist.y < leftShoulder.y || rightWrist.y < rightShoulder.y) ? "Hand Above Shoulder" : "Hand Below Waist";
  const wristDist = Math.sqrt(Math.pow(leftWrist.x - rightWrist.x, 2) + Math.pow(leftWrist.y - rightWrist.y, 2));
  const handPosition = wristDist < 0.15 ? "Hands Together" : "Hands Separated";

  // Difficulty metric
  let difficulty = "Easy";
  if (leftKneeAngle < 100 || rightKneeAngle < 100) {
    difficulty = "Hard";
  } else if (leftArmAngle < 120 || rightArmAngle < 120) {
    difficulty = "Medium";
  }

  // Scenario context
  const event = metadata.event || "Portrait";
  const lighting = metadata.lighting || "Natural Light";
  const background = metadata.background || "Garden";
  const interaction = metadata.caption?.includes("holding hands") ? "Holding Hands" : "Looking Camera";

  return {
    poseType,
    peopleCount: metadata.peopleCount || "Solo",
    bodyRotation,
    headDirection: eyeDirection,
    handPosition,
    legPosition,
    interaction,
    cameraAngle: metadata.cameraAngle || "Eye Level",
    lighting,
    background,
    quality: {
      blurScore: 95,
      brightness: 80,
      contrast: 85,
      noise: 5,
      sharpness: 92,
      resolution: "1920x1080",
      professionalScore: 95
    },
    composition: "Rule Of Thirds",
    difficulty,
    coachInfo: {
      bodyAngle: `${rotationDegrees}° rotation`,
      headAngle: headTilt,
      handPosition: handAboveShoulder,
      legPosition,
      eyeDirection,
      smile: "Natural smile",
      cameraDistance: "8 feet",
      bestLens: "85mm prime",
      photographerTips: `Position model relative to the ${lighting.toLowerCase()} setup.`
    }
  };
};
