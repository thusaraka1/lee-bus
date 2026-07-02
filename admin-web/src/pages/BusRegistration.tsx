import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useBuses } from '../hooks/useBuses';

const BusRegistration = () => {
  const { addBus } = useBuses();
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [route, setRoute] = useState('');
  const [driverName, setDriverName] = useState('');
  
  const [generatedBusId, setGeneratedBusId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !route) return;
    
    addBus({ id, route, driverName });
    setGeneratedBusId(id);
    
    // Clear form
    setId('');
    setRoute('');
    setDriverName('');
  };

  const getQRUrl = (busId: string) => {
    // In production, this would be the actual domain, e.g., https://leebus.com/report?busId=...
    return `${window.location.origin}/report?busId=${encodeURIComponent(busId)}`;
  };

  const downloadQR = (id: string) => {
    const svgElement = document.getElementById(`qr-${id}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
      }

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Bus-${id}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 h-fit">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Register New Bus</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bus ID / License Plate</label>
            <input 
              type="text" 
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. B-1024"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Route</label>
            <input 
              type="text" 
              required
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="e.g. Route 45 (City Center - Suburbs)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Driver Name (Optional)</label>
            <input 
              type="text" 
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors mt-4"
          >
            Register & Generate QR Code
          </button>
        </form>
      </div>

      {/* Result Section */}
      {generatedBusId ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 h-fit">
          <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold mb-6">
            Successfully Registered!
          </div>
          
          <h4 className="text-xl font-bold text-slate-800 mb-2">Bus {generatedBusId}</h4>
          <p className="text-sm text-slate-500 mb-8 max-w-sm">
            Print this QR code and place it inside the bus. Passengers can scan it to instantly report unsafe driving.
          </p>
          
          <div className="p-4 bg-white border-4 border-slate-800 rounded-xl mb-6 shadow-md">
            <QRCodeSVG id={`qr-${generatedBusId}`} value={getQRUrl(generatedBusId)} size={200} level="H" />
          </div>

          <div className="flex gap-4">
            <button 
              className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors"
              onClick={() => downloadQR(generatedBusId)}
            >
              Download PNG
            </button>
            <button 
              onClick={() => navigate('/qr-codes')}
              className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-lg transition-colors"
            >
              View Gallery
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 p-8 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 h-fit min-h-[400px]">
          Fill out the form to generate a QR code.
        </div>
      )}
    </div>
  );
};

export default BusRegistration;
