import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ShipWireframe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const material = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.86
    });
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(1.2, 3.8, 8, 18), material);
    hull.rotation.z = Math.PI / 2;
    scene.add(hull);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.55 });
    [-1.8, 0, 1.8].forEach((x) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.035, 8, 72), ringMaterial);
      ring.position.x = x;
      ring.rotation.y = Math.PI / 2;
      scene.add(ring);
    });

    const wingMaterial = new THREE.MeshBasicMaterial({ color: 0xf43f5e, wireframe: true, transparent: true, opacity: 0.6 });
    const wingGeometry = new THREE.ConeGeometry(0.7, 2.4, 4);
    const upperWing = new THREE.Mesh(wingGeometry, wingMaterial);
    upperWing.position.set(0.2, 1.45, 0);
    upperWing.rotation.z = Math.PI / 4;
    scene.add(upperWing);
    const lowerWing = upperWing.clone();
    lowerWing.position.y = -1.45;
    lowerWing.rotation.z = -Math.PI / 4;
    scene.add(lowerWing);

    let frame = 0;
    let raf = 0;
    const animate = () => {
      frame += 0.01;
      hull.rotation.x = Math.sin(frame) * 0.14;
      hull.rotation.y += 0.006;
      scene.children.forEach((child, index) => {
        child.rotation.z += index % 2 === 0 ? 0.003 : -0.004;
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("[COSMIC-REPAIR] WebGL context lost. Recovery intentionally not implemented.");
    };

    window.addEventListener("resize", onResize);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="ship-wireframe" ref={mountRef} aria-label="3D spaceship wireframe" />;
}
