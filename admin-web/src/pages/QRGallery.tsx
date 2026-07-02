import { QRCodeSVG } from 'qrcode.react';
import { useBuses } from '../hooks/useBuses';
import { Download, Bus, Clock } from 'lucide-react';

const QRGallery = () => {
  const { buses, removeBus } = useBuses();

  const getQRUrl = (busId: string) => {
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

  const downloadAll = () => {
    buses.forEach((bus, index) => {
      setTimeout(() => {
        downloadQR(bus.id);
      }, index * 300);
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[500px]">
      <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Bus QR Codes</h3>
          <p className="text-sm text-slate-500 mt-1">Manage and download QR codes for all registered fleet vehicles.</p>
        </div>
        <button 
          onClick={downloadAll}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors text-sm flex items-center disabled:opacity-50"
          disabled={buses.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Download All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {buses.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <Bus className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium mb-1">No buses registered yet.</p>
            <p className="text-sm text-slate-400">Register a bus to generate its QR code here.</p>
          </div>
        ) : (
          buses.map((bus) => (
            <div key={bus.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors group bg-slate-50">
              <div className="p-4 bg-white border-b border-slate-100 flex flex-col items-center pt-8">
                <div className="p-2 border-2 border-slate-800 rounded-lg shadow-sm mb-4">
                  <QRCodeSVG id={`qr-${bus.id}`} value={getQRUrl(bus.id)} size={140} level="H" />
                </div>
                <h4 className="font-bold text-lg text-slate-800">{bus.id}</h4>
                <p className="text-sm text-slate-500 line-clamp-1">{bus.route}</p>
              </div>
              
              <div className="p-4 flex flex-col gap-3">
                {bus.driverName && (
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-400">Driver</span>
                    <span>{bus.driverName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium text-slate-400">Created</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(bus.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-200">
                  <button 
                    onClick={() => removeBus(bus.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => downloadQR(bus.id)}
                    className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <Download className="h-3 w-3 mr-1" /> Save
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QRGallery;
