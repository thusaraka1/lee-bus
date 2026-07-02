import { useBuses } from '../hooks/useBuses';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { ShieldAlert, Users, Bus, Activity } from 'lucide-react';
import AlertsPanel from '../components/AlertsPanel';

const mockComplaintsData = [
  { name: 'Mon', count: 4 },
  { name: 'Tue', count: 7 },
  { name: 'Wed', count: 2 },
  { name: 'Thu', count: 9 },
  { name: 'Fri', count: 15 },
  { name: 'Sat', count: 11 },
  { name: 'Sun', count: 5 },
];

const mockSafetyData = [
  { time: '08:00', avgSpeed: 45, events: 2 },
  { time: '10:00', avgSpeed: 52, events: 1 },
  { time: '12:00', avgSpeed: 38, events: 5 },
  { time: '14:00', avgSpeed: 41, events: 3 },
  { time: '16:00', avgSpeed: 58, events: 8 },
  { time: '18:00', avgSpeed: 35, events: 4 },
];

const Dashboard = () => {
  const { buses } = useBuses();

  const metrics = [
    { title: 'Total Registered Buses', value: buses.length, icon: Bus, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Reports', value: '12', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Avg Driver Safety', value: '84%', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Passengers', value: '1,240', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-slate-800">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bg}`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Passenger Complaints (This Week)</h3>
            <p className="text-sm text-slate-500">Number of QR reports submitted per day</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockComplaintsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safety Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">IoT Safety Events (Today)</h3>
            <p className="text-sm text-slate-500">Sudden braking/acceleration vs avg speed</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSafetyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line yAxisId="left" type="monotone" name="Avg Speed (km/h)" dataKey="avgSpeed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Unsafe Events" dataKey="events" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real Alerts Panel — replaces mock data */}
      <AlertsPanel />
    </div>
  );
};

export default Dashboard;
