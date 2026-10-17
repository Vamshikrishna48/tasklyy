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

  // Waypoints for smooth 3D spline flight path
  private waypoints = [
    { z: 36, y: 2.2, x: 0, rotY: 0, rotX: -0.02 },       // Stage 1: Hero (Task Card & Workflow Gyroscope)
    { z: 12, y: 1.8, x: -1.2, rotY: 0.08, rotX: 0 },     // Stage 2: Services (Floating Workflow Cards)
    { z: -28, y: 2.4, x: 1.2, rotY: -0.06, rotX: -0.03 }, // Stage 3: Process (4-Step Timeline Rail)
    { z: -75, y: 1.6, x: -0.8, rotY: 0.05, rotX: 0.02 },  // Stage 4: Results (Metric Counters & Data Bars)
    { z: -125, y: 2.0, x: 0.8, rotY: -0.04, rotX: -0.02 },// Stage 5: Pricing / Engagement Models
    { z: -175, y: 1.8, x: 0, rotY: 0, rotX: 0 },          // Stage 6: Testimonials (Carousel Ring)
    { z: -220, y: 2.2, x: 0, rotY: 0, rotX: 0.02 },       // Stage 7: Final CTA & Booking Gateway
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

    // Apply positions
    this.camera.position.z = targetZ;
    this.camera.position.y = targetY + Math.sin(this.currentProgress * Math.PI * 6) * 0.25;
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
