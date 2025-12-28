import { useState } from 'react';
import { LogOut, Package, Leaf, Award, MapPin, Calendar, Truck, Ship, Plane, Train, FileText, TrendingDown, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Shipment } from '../types/shipment';
import { User } from '../App';
import { getShipmentsByClientId } from '../data/shipmentsDatabase';
import { getUserClientId } from '../utils/auth';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
}

const vehicleIcons = {
  truck: Truck,
  van: Package,
  train: Train,
  ship: Ship,
  plane: Plane,
};

const statusColors = {
  pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  'in-transit': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  delivered: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
};

const statusIcons = {
  pending: <Clock className="size-4" />,
  'in-transit': <TrendingDown className="size-4" />,
  delivered: <CheckCircle className="size-4" />,
  cancelled: <AlertCircle className="size-4" />,
};

function ShipmentCard({ shipment, onViewDetails }: { shipment: Shipment; onViewDetails: (s: Shipment) => void }) {
  const VehicleIcon = vehicleIcons[shipment.vehicleType];
  const colors = statusColors[shipment.status];

  return (
    <Card className={`border-l-4 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group`} onClick={() => onViewDetails(shipment)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
              <VehicleIcon className={`size-6 ${colors.text}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-slate-900 text-lg">{shipment.goodsDescription}</h3>
                <Badge className={colors.badge}>{shipment.status.replace('-', ' ').toUpperCase()}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <MapPin className="size-4 text-slate-400" />
                  <span>{shipment.origin}</span>
                </div>
                <ArrowRight className="size-4 text-slate-300" />
                <div className="flex items-center gap-1">
                  <MapPin className="size-4 text-slate-400" />
                  <span>{shipment.destination}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white/60 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Weight</p>
            <p className="text-sm font-bold text-slate-900">{shipment.weight} kg</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Distance</p>
            <p className="text-sm font-bold text-slate-900">{shipment.distance} km</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Vehicle</p>
            <p className="text-sm font-bold text-slate-900 capitalize">{shipment.vehicleType}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">CO₂</p>
            <p className="text-sm font-bold text-slate-900">{shipment.emissionsCO2.toFixed(2)} kg</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">EcoPoints</p>
            <p className="text-sm font-bold text-amber-600">{shipment.ecoPoints}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShipmentDetailModal({ shipment, onClose }: { shipment: Shipment | null; onClose: () => void }) {
  if (!shipment) return null;

  return (
    <Dialog open={!!shipment} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{shipment.goodsDescription}</DialogTitle>
          <DialogDescription>Full shipment details and environmental impact</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600">Origin</label>
              <p className="text-lg font-bold text-slate-900">{shipment.origin}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Destination</label>
              <p className="text-lg font-bold text-slate-900">{shipment.destination}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Weight</label>
              <p className="text-lg font-bold text-slate-900">{shipment.weight} kg</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Distance</label>
              <p className="text-lg font-bold text-slate-900">{shipment.distance} km</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">Transport Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Vehicle Type:</span>
                <p className="font-bold text-slate-900 capitalize">{shipment.vehicleType}</p>
              </div>
              <div>
                <span className="text-slate-600">Fuel Type:</span>
                <p className="font-bold text-slate-900 capitalize">{shipment.fuelType}</p>
              </div>
              <div>
                <span className="text-slate-600">Status:</span>
                <Badge className="mt-1">{shipment.status}</Badge>
              </div>
              <div>
                <span className="text-slate-600">Created:</span>
                <p className="font-bold text-slate-900">{shipment.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Leaf className="size-5" />
              Environmental Impact
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">CO₂ Emissions:</span>
                <p className="text-2xl font-bold text-green-900">{shipment.emissionsCO2.toFixed(2)} kg</p>
              </div>
              <div>
                <span className="text-green-700">EcoPoints Earned:</span>
                <p className="text-2xl font-bold text-green-900">{shipment.ecoPoints}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const clientId = getUserClientId(user.id);
  const [shipments] = useState<Shipment[]>(getShipmentsByClientId(clientId));
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const totalEmissions = shipments.reduce((sum, s) => sum + s.emissionsCO2, 0);
  const totalEcoPoints = shipments.reduce((sum, s) => sum + s.ecoPoints, 0);
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
  const inTransitCount = shipments.filter(s => s.status === 'in-transit').length;
  const pendingCount = shipments.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/10">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 to-teal-500/40 rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-3 rounded-2xl shadow-lg ring-2 ring-emerald-500/20">
                  <Leaf className="size-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Client Dashboard</h1>
                <p className="text-sm text-slate-600">Welcome, <span className="font-semibold text-slate-900">{user.name}</span></p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" className="border-slate-200 hover:bg-slate-50">
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-slate-900">{shipments.length}</p>
                </div>
                <Package className="size-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Delivered</p>
                  <p className="text-3xl font-bold text-emerald-600">{deliveredCount}</p>
                </div>
                <CheckCircle className="size-8 text-emerald-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">In Transit</p>
                  <p className="text-3xl font-bold text-blue-600">{inTransitCount}</p>
                </div>
                <TrendingDown className="size-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">CO₂ Emissions</p>
                  <p className="text-3xl font-bold text-red-600">{totalEmissions.toFixed(0)}</p>
                  <p className="text-xs text-slate-500 mt-1">kg CO₂</p>
                </div>
                <Leaf className="size-8 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">EcoPoints</p>
                  <p className="text-3xl font-bold text-amber-600">{totalEcoPoints}</p>
                </div>
                <Award className="size-8 text-amber-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipments */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Shipments</h2>
            <p className="text-slate-600">Track and manage all your logistics and emissions</p>
          </div>

          {shipments.length === 0 ? (
            <Card className="border-dashed border-slate-300">
              <CardContent className="pt-12 pb-12 text-center">
                <Package className="size-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Shipments Found</h3>
                <p className="text-slate-500">You don't have any active shipments yet. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="bg-white/80 border border-slate-200 p-1">
                <TabsTrigger value="all">All ({shipments.length})</TabsTrigger>
                <TabsTrigger value="in-transit">In Transit ({inTransitCount})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({deliveredCount})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {shipments.map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} onViewDetails={setSelectedShipment} />
                ))}
              </TabsContent>

              <TabsContent value="in-transit" className="space-y-4">
                {shipments.filter(s => s.status === 'in-transit').map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} onViewDetails={setSelectedShipment} />
                ))}
              </TabsContent>

              <TabsContent value="delivered" className="space-y-4">
                {shipments.filter(s => s.status === 'delivered').map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} onViewDetails={setSelectedShipment} />
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {shipments.filter(s => s.status === 'pending').map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} onViewDetails={setSelectedShipment} />
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <ShipmentDetailModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />
    </div>
  );
}
