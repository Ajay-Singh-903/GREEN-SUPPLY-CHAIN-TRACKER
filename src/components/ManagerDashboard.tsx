import { useState } from 'react';
import { User } from '../App';
import { Shipment } from '../types/shipment';
import { Button } from './ui/button';
import { Package, Plus, LogOut, BarChart3, Leaf, MessageSquare } from 'lucide-react';
import { ShipmentForm } from './ShipmentForm';
import { ShipmentsList } from './ShipmentsList';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ManagerFeedbackView } from './ManagerFeedbackView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getAllShipments } from '../data/shipmentsDatabase';

interface ManagerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function ManagerDashboard({ user, onLogout }: ManagerDashboardProps) {
  const [shipments, setShipments] = useState<Shipment[]>(getAllShipments());
  const [showForm, setShowForm] = useState(false);

  const handleAddShipment = (shipment: Shipment) => {
    setShipments([shipment, ...shipments]);
    setShowForm(false);
  };

  const handleUpdateShipment = (updatedShipment: Shipment) => {
    setShipments(
      shipments.map((s) => (s.id === updatedShipment.id ? updatedShipment : s))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-indigo-600/40 rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
                <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-3.5 rounded-2xl shadow-lg ring-2 ring-blue-500/20">
                <Leaf className="size-6 text-white" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Manager Dashboard
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Welcome back, <span className="text-slate-900 font-semibold">{user.name}</span>
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="border-slate-200 bg-white/80 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium"
            >
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="shipments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="shipments">
              <Package className="size-4 mr-2" />
              Shipments
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="size-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="size-4 mr-2" />
              Client Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shipments" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-900">Manage Shipments</h2>
                <p className="text-gray-600">Add and track all your supply chain shipments</p>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="size-4 mr-2" />
                New Shipment
              </Button>
            </div>

            {showForm && (
              <ShipmentForm
                onSubmit={handleAddShipment}
                onCancel={() => setShowForm(false)}
              />
            )}

            <ShipmentsList
              shipments={shipments}
              onUpdateShipment={handleUpdateShipment}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard shipments={shipments} />
          </TabsContent>

          <TabsContent value="feedback">
            <ManagerFeedbackView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}