import { Shipment } from '../types/shipment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Leaf, TrendingDown, Package, Award } from 'lucide-react';
import { EfficiencyAnalysis } from './EfficiencyAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AnalyticsDashboardProps {
  shipments: Shipment[];
}

export function AnalyticsDashboard({ shipments }: AnalyticsDashboardProps) {
  // Calculate total emissions
  const totalEmissions = shipments.reduce((sum, s) => sum + s.emissionsCO2, 0);
  const totalDistance = shipments.reduce((sum, s) => sum + s.distance, 0);
  const totalShipments = shipments.length;
  const avgEmissionsPerKm = totalDistance > 0 ? totalEmissions / totalDistance : 0;

  // Emissions by vehicle type
  const emissionsByVehicle = shipments.reduce((acc, s) => {
    const existing = acc.find(item => item.vehicle === s.vehicleType);
    if (existing) {
      existing.emissions += s.emissionsCO2;
    } else {
      acc.push({ vehicle: s.vehicleType, emissions: s.emissionsCO2 });
    }
    return acc;
  }, [] as { vehicle: string; emissions: number }[]);

  // Emissions by fuel type
  const emissionsByFuel = shipments.reduce((acc, s) => {
    const existing = acc.find(item => item.fuel === s.fuelType);
    if (existing) {
      existing.emissions += s.emissionsCO2;
      existing.count += 1;
    } else {
      acc.push({ fuel: s.fuelType, emissions: s.emissionsCO2, count: 1 });
    }
    return acc;
  }, [] as { fuel: string; emissions: number; count: number }[]);

  // Top clients by emissions (leaderboard - lower is better)
  const clientEmissions = shipments.reduce((acc, s) => {
    const existing = acc.find(item => item.name === s.clientName);
    if (existing) {
      existing.emissions += s.emissionsCO2;
      existing.ecoPoints += s.ecoPoints;
      existing.shipments += 1;
    } else {
      acc.push({
        name: s.clientName,
        emissions: s.emissionsCO2,
        ecoPoints: s.ecoPoints,
        shipments: 1,
      });
    }
    return acc;
  }, [] as { name: string; emissions: number; ecoPoints: number; shipments: number }[]);

  // Sort by eco points (highest first)
  const sortedClients = [...clientEmissions].sort((a, b) => b.ecoPoints - a.ecoPoints);

  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="efficiency">Efficiency Analysis</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="flex items-center gap-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
              <div className="p-2.5 bg-blue-50 rounded-xl ring-2 ring-blue-100">
              <Package className="size-5 text-blue-600" />
              </div>
              Total Shipments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-slate-900 mb-2">{totalShipments}</div>
            <p className="text-sm text-slate-500 font-medium">Active shipments</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="flex items-center gap-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
              <div className="p-2.5 bg-emerald-50 rounded-xl ring-2 ring-emerald-100">
                <Leaf className="size-5 text-emerald-600" />
              </div>
              Total CO₂
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-slate-900 mb-2">{totalEmissions.toFixed(2)}</div>
            <p className="text-sm text-slate-500 font-medium">kg CO₂ emitted</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="flex items-center gap-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
              <div className="p-2.5 bg-amber-50 rounded-xl ring-2 ring-amber-100">
              <TrendingDown className="size-5 text-amber-600" />
              </div>
              Avg CO₂/km
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-slate-900 mb-2">{avgEmissionsPerKm.toFixed(3)}</div>
            <p className="text-sm text-slate-500 font-medium">kg per kilometer</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="flex items-center gap-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
              <div className="p-2.5 bg-purple-50 rounded-xl ring-2 ring-purple-100">
              <Award className="size-5 text-purple-600" />
              </div>
              Total EcoPoints
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {shipments.reduce((sum, s) => sum + s.ecoPoints, 0)}
            </div>
            <p className="text-sm text-slate-500 font-medium">Points earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions by Vehicle Type */}
        <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Emissions by Vehicle Type</CardTitle>
            <CardDescription className="text-slate-600 font-medium">CO₂ emissions breakdown by transport mode</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emissionsByVehicle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="vehicle" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="emissions" fill="#16a34a" name="CO₂ (kg)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emissions by Fuel Type */}
        <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Emissions Distribution by Fuel</CardTitle>
            <CardDescription className="text-slate-600 font-medium">Total CO₂ emissions by fuel type</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emissionsByFuel}
                  dataKey="emissions"
                  nameKey="fuel"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.fuel}: ${entry.emissions.toFixed(1)} kg`}
                >
                  {emissionsByFuel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Client Leaderboard */}
      <Card className="border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-md">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Eco-Friendly Client Leaderboard</CardTitle>
          <CardDescription className="text-slate-600 font-medium">Clients ranked by EcoPoints (higher = greener choices)</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {sortedClients.map((client, index) => (
              <div
                key={client.name}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`flex items-center justify-center size-12 rounded-xl font-bold text-base shadow-sm ${
                      index === 0
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-900 ring-2 ring-amber-200'
                        : index === 1
                        ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 ring-2 ring-slate-200'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-orange-900 ring-2 ring-orange-200'
                        : 'bg-slate-100 text-slate-700 ring-2 ring-slate-200'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold text-base mb-1">{client.name}</div>
                    <div className="text-slate-600 text-sm font-medium">
                      {client.shipments} shipment{client.shipments > 1 ? 's' : ''} • {client.emissions.toFixed(2)} kg CO₂
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200/60">
                  <Award className="size-5 text-amber-600" />
                  <span className="text-amber-700 font-bold">{client.ecoPoints} points</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 border border-emerald-200/60 shadow-md">
        <CardHeader className="border-b border-emerald-200/40">
          <CardTitle className="flex items-center gap-3 text-emerald-900">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Leaf className="size-5 text-emerald-700" />
            </div>
            <span className="text-lg font-bold">Sustainability Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <div className="mt-1.5 size-1.5 rounded-full bg-emerald-600"></div>
              <span className="font-medium">Consider switching to electric or hybrid vehicles for short-distance deliveries</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1.5 size-1.5 rounded-full bg-emerald-600"></div>
              <span className="font-medium">Rail and ship transport have significantly lower emissions for long distances</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1.5 size-1.5 rounded-full bg-emerald-600"></div>
              <span className="font-medium">Consolidate shipments to reduce the number of trips and overall emissions</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1.5 size-1.5 rounded-full bg-emerald-600"></div>
              <span className="font-medium">Implement route optimization to minimize travel distance</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1.5 size-1.5 rounded-full bg-emerald-600"></div>
              <span className="font-medium">Offer carbon offset programs for high-emission shipments</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="efficiency">
        <EfficiencyAnalysis shipments={shipments} />
      </TabsContent>
    </Tabs>
  );
}
