import * as THREE from "three";

export interface CameraRigState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

export class CameraRig {
  private camera: THREE.PerspectiveCamera;
  private currentProgress: number = 0;
  private targetProgress: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  // 9 Waypoints for the stylized 3D Campus Journey:
  // 1. Main Gate (Hero)
  // 2. Campus Quad (Who We Help)
  // 3. Central Library (Services)
  // 4. Academic Path (Our Process)
  // 5. Research & Project Lab (Results)
  // 6. Innovation & Clubs Center (Engagement Plans)
  // 7. Alumni Amphitheater (Student & College Stories)
  // 8. Partners Boulevard (Partner Colleges)
  // 9. Graduation Stage & Convocation Hall (Final CTA & Booking)
  private waypoints = [
    { z: 40,   y: 2.2, x: 0,    rotY: 0,     rotX: -0.02 }, // Stop 1: Main Gate (Hero)
    { z: 18,   y: 1.8, x: -1.2, rotY: 0.08,  rotX: 0     }, // Stop 2: Campus Quad (Who we help)
    { z: -18,  y: 2.4, x: 1.4,  rotY: -0.07, rotX: -0.02 }, // Stop 3: Central Library (Services)
    { z: -58,  y: 1.9, x: -1.0, rotY: 0.06,  rotX: 0.02  }, // Stop 4: Academic Path (Process)
    { z: -105, y: 2.3, x: 1.1,  rotY: -0.05, rotX: -0.02 }, // Stop 5: Research Lab (Results)
    { z: -155, y: 1.7, x: -0.9, rotY: 0.05,  rotX: 0.01  }, // Stop 6: Innovation Center (Plans)
    { z: -205, y: 2.0, x: 0.8,  rotY: -0.04, rotX: 0     }, // Stop 7: Alumni Amphitheater (Stories)
    { z: -250, y: 1.8, x: -0.6, rotY: 0.03,  rotX: 0.01  }, // Stop 8: Partners Boulevard
    { z: -295, y: 2.2, x: 0,    rotY: 0,     rotX: 0.02  }, // Stop 9: Graduation Stage (Final CTA)
  ];

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public updateMouse(normX: number, normY: number) {
    this.mouseX = normX;
    this.mouseY = normY;
  }

  public setProgress(progress: number) {
    this.targetProgress = Math.min(Math.max(progress, 0), 1);
  }

  public update(): void {
    // Smooth lerp scroll progress
    this.currentProgress += (this.targetProgress - this.currentProgress) * 0.085;

    // Smooth lerp mouse parallax
    this.targetMouseX += (this.mouseX - this.targetMouseX) * 0.05;
    this.targetMouseY += (this.mouseY - this.targetMouseY) * 0.05;

    // Calculate spline segment interpolation
    const totalSegments = this.waypoints.length - 1;
    const scaledProgress = this.currentProgress * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const localT = scaledProgress - segmentIndex;

    const startWP = this.waypoints[segmentIndex];
    const endWP = this.waypoints[Math.min(segmentIndex + 1, totalSegments)];

    // Smooth cubic Hermite interpolation for camera flight
    const smoothT = localT * localT * (3 - 2 * localT);

    const targetZ = THREE.MathUtils.lerp(startWP.z, endWP.z, smoothT);
    const targetY = THREE.MathUtils.lerp(startWP.y, endWP.y, smoothT);
    const targetX = THREE.MathUtils.lerp(startWP.x, endWP.x, smoothT);

    // Apply positions with subtle bobbing
    this.camera.position.z = targetZ;
    this.camera.position.y = targetY + Math.sin(this.currentProgress * Math.PI * 8) * 0.2;
    this.camera.position.x = targetX + this.targetMouseX * 0.45;

    // Apply rotations with mouse parallax
    const baseRotY = THREE.MathUtils.lerp(startWP.rotY, endWP.rotY, smoothT);
    const baseRotX = THREE.MathUtils.lerp(startWP.rotX, endWP.rotX, smoothT);

    this.camera.rotation.y = baseRotY - this.targetMouseX * 0.12;
    this.camera.rotation.x = baseRotX - this.targetMouseY * 0.08;
  }

  public getProgress(): number {
    return this.currentProgress;
  }
}
