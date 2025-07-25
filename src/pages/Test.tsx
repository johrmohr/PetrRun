import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, type JSX } from "react";

export default function Test() {
  const ref = useRef();

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <h1>Test Page</h1>
      <p>This is a test page to verify the functionality of the application.</p>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
        <Suspense fallback={null}>
          <Stage
            controls={ref}
            preset="rembrandt"
            intensity={1}
            environment="city"
          >
            false
            <Model />
            false
          </Stage>
        </Suspense>
        <OrbitControls ref={ref} autoRotate />
      </Canvas>
    </div>
  );
}
export function Model(props) {
  const { nodes, materials } = useGLTF("/models/petr/scene.gltf");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_4.geometry}
        material={materials.petr_hd_Merged_Material}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload("/petr/scene.gltf");
