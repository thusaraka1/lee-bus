import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bus, AlertTriangle, Send } from 'lucide-react';

const PassengerReport = () => {
  const [searchParams] = useSearchParams();
  const busId = searchParams.get('busId') || '';
  
  const [reportType, setReportType] = useState('reckless_driving');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In the future: Send this to the backend API
    console.log({ busId, reportType, description });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Submitted</h2>
          <p className="text-slate-500 mb-6">
            Thank you for helping us keep the roads safe. The administration has been notified.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Submit another report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-600 rounded-full mb-4 shadow-lg shadow-blue-200">
          <Bus className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Smart Passenger Report</h1>
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">
          Anonymously report unsafe driving or poor bus conditions instantly.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 max-w-md w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-4">
              <Bus className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bus ID</p>
              <p className="text-lg font-bold text-slate-800">{busId || 'Unknown Bus'}</p>
            </div>
            {!busId && (
              <p className="text-xs text-amber-600 ml-auto flex items-center bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1" /> No QR context
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">What is the issue?</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700 appearance-none font-medium"
            >
              <option value="reckless_driving">Reckless Driving</option>
              <option value="overspeeding">Overspeeding</option>
              <option value="rudeness">Driver Behavior / Rudeness</option>
              <option value="overcrowding">Overcrowding</option>
              <option value="cleanliness">Poor Cleanliness</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Details</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional context..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-slate-700"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 flex items-center justify-center text-lg"
          >
            <Send className="h-5 w-5 mr-2" />
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default PassengerReport;
