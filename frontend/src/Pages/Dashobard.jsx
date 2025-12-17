import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useMemo } from 'react'

// Sample task data (replace with your API data)
const tasks = [
  { id: 1, title: 'Complete Report', status: 'pending', color: 'red' },
  { id: 2, title: 'Design UI', status: 'in-progress', color: 'yellow' },
  { id: 3, title: 'Review Code', status: 'completed', color: 'green' },
  { id: 4, title: 'Meet Client', status: 'pending', color: 'red' },
  { id: 5, title: 'Test Features', status: 'in-progress', color: 'yellow' },
  { id: 6, title: 'Deploy App', status: 'completed', color: 'green' },
]

const TaskCube = ({ position, title, color, status }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {title}
        {'\n'}{status}
      </Text>
    </group>
  )
}

const Task3DViewer = () => {
  const taskPositions = useMemo(() => [
    [-2, 0, 0],
    [2, 0, 0],
    [0, 2, 0],
    [0, -2, 0],
    [-2, 2, -2],
    [2, -2, 2],
  ], [])

  return (
    <div className="h-96 w-full bg-white rounded-lg shadow-lg border border-gray-200">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ height: '100%', width: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Render tasks as 3D cubes */}
        {tasks.map((task, index) => (
          <TaskCube
            key={task.id}
            position={taskPositions[index]}
            title={task.title}
            color={task.color}
            status={task.status}
          />
        ))}
        
        {/* Controls for orbiting/zooming */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      {/* Overlay info */}
      <div className="absolute top-4 left-4 text-sm text-gray-600">
        Drag to rotate | Scroll to zoom | Green = Completed, Red = Pending
      </div>
    </div>
  )
}

export default Task3DViewer
