import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function EstateScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(6.5, 7.5, 8.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xd4af37, 0.7);
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(5, 9, 5);
    key.castShadow = true;
    const emerald = new THREE.PointLight(0x10b981, 4, 14);
    emerald.position.set(-4, 3, 4);
    const crimson = new THREE.PointLight(0xdc2626, 3.5, 12);
    crimson.position.set(4, 2, -3);
    scene.add(ambient, key, emerald, crimson);

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d0d0d,
      roughness: 0.22,
      metalness: 0.68
    });
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0x6f5413,
      roughness: 0.2,
      metalness: 0.9
    });
    const greenMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x083b2d,
      roughness: 0.35,
      metalness: 0.3
    });
    const redMaterial = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0x500707,
      roughness: 0.4,
      metalness: 0.15
    });

    const platform = new THREE.Mesh(new THREE.BoxGeometry(9, 0.28, 6), baseMaterial);
    platform.receiveShadow = true;
    scene.add(platform);

    const grid = new THREE.Group();
    const parcels = [
      [-3.2, -1.8, 1.2, 0.8, 0.65, goldMaterial],
      [-1.6, -1.8, 1.1, 1.1, 1.6, greenMaterial],
      [0.1, -1.8, 1.5, 0.9, 1.0, goldMaterial],
      [2.1, -1.8, 1.7, 1.2, 0.8, redMaterial],
      [-2.9, 0, 1.6, 1.5, 2.0, greenMaterial],
      [-0.5, 0, 1.2, 1.2, 0.85, goldMaterial],
      [1.3, 0, 1.5, 1.6, 1.35, goldMaterial],
      [3.2, 0, 0.9, 1.4, 0.55, redMaterial],
      [-2.4, 1.9, 2.1, 1.2, 1.4, goldMaterial],
      [0.3, 1.9, 1.7, 1.2, 0.75, greenMaterial],
      [2.6, 1.9, 1.6, 1.1, 1.1, goldMaterial]
    ];

    parcels.forEach(([x, z, w, d, h, material]) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, h / 2 + 0.16, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      grid.add(mesh);

      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: 0xf5d76e, transparent: true, opacity: 0.45 })
      );
      wire.position.copy(mesh.position);
      grid.add(wire);
    });
    scene.add(grid);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.8, 0.012, 12, 160),
      new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.65 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.22;
    scene.add(ring);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      grid.rotation.y += 0.0025;
      ring.rotation.z += 0.006;
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="estate-scene" ref={mountRef} />;
}
