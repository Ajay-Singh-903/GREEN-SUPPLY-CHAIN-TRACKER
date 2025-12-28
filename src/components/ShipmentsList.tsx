import { useState } from 'react';
import { Shipment } from '../types/shipment';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Truck, Ship, Plane, Train, Package, Leaf, Award, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LeafletMap } from './LeafletMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface ShipmentsListProps {
  shipments: Shipment[];
  onUpdateShipment: (shipment: Shipment) => void;
}

const vehicleIcons = {
  truck: Truck,
  van: Package,
  train: Train,
  ship: Ship,
  plane: Plane,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in-transit': 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export function ShipmentsList({ shipments, onUpdateShipment }: ShipmentsListProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const handleStatusChange = (shipment: Shipment, newStatus: string) => {
    const updatedShipment = {
      ...shipment,
      status: newStatus as Shipment['status'],
      deliveredAt: newStatus === 'delivered' ? new Date() : shipment.deliveredAt,
    };
    onUpdateShipment(updatedShipment);
  };

  return (
    <>
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-blue-100/50">
          <CardTitle className="text-xl font-bold text-gray-900">All Shipments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Goods</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>CO₂ Emissions</TableHead>
                  <TableHead>EcoPoints</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => {
                  const VehicleIcon = vehicleIcons[shipment.vehicleType];
                  return (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <div>
                          <div>{shipment.clientName}</div>
                          <div className="text-gray-500">
                            {shipment.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{shipment.goodsDescription}</TableCell>
                      <TableCell>
                        <div>
                          <div>{shipment.origin}</div>
                          <div className="text-gray-500">↓</div>
                          <div>{shipment.destination}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <VehicleIcon className="size-4 text-gray-600" />
                          <div>
                            <div className="capitalize">{shipment.vehicleType}</div>
                            <div className="text-gray-500 capitalize">{shipment.fuelType}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{shipment.weight} kg</TableCell>
                      <TableCell>{shipment.distance} km</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Leaf className="size-4 text-green-600" />
                          <span>{shipment.emissionsCO2.toFixed(2)} kg</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Award className="size-4 text-amber-600" />
                          <span>{shipment.ecoPoints}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={shipment.status}
                          onValueChange={(value) => handleStatusChange(shipment, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedShipment(shipment)}
                        >
                          <MapPin className="size-4 mr-1" />
                          Track
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Modal */}
      <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              Live Tracking: {selectedShipment?.goodsDescription}
            </DialogTitle>
            <DialogDescription>
              Real-time tracking information for shipment #{selectedShipment?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Client</p>
                  <p className="text-gray-900">{selectedShipment.clientName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <Badge className={statusColors[selectedShipment.status]}>
                    {selectedShipment.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
              <LeafletMap shipment={selectedShipment} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}