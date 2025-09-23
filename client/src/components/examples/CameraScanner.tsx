import CameraScanner from '../CameraScanner';

export default function CameraScannerExample() {
  const handleScanComplete = (data: any) => {
    console.log('Scan completed:', data);
  };

  return <CameraScanner onScanComplete={handleScanComplete} />;
}