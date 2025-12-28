import { Shipment } from '../types/shipment';
import { User } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { FileText, Download } from 'lucide-react';

interface ReportGeneratorProps {
  shipments: Shipment[];
  user: User;
}

export function ReportGenerator({ shipments, user }: ReportGeneratorProps) {
  const generateReport = () => {
    const totalEmissions = shipments.reduce((sum, s) => sum + s.emissionsCO2, 0);
    const totalEcoPoints = shipments.reduce((sum, s) => sum + s.ecoPoints, 0);
    const totalDistance = shipments.reduce((sum, s) => sum + s.distance, 0);
    const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);

    const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
    const inTransitCount = shipments.filter(s => s.status === 'in-transit').length;
    const pendingCount = shipments.filter(s => s.status === 'pending').length;

    // Create HTML content for the report
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Green Supply Chain Report - ${user.name}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
    }
    .section {
      background: white;
      padding: 25px;
      margin-bottom: 20px;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h2 {
      color: #059669;
      margin-top: 0;
      font-size: 20px;
      border-bottom: 2px solid #d1fae5;
      padding-bottom: 10px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f0fdf4;
      border: 2px solid #86efac;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-label {
      font-size: 12px;
      color: #166534;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #059669;
    }
    .shipment-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .shipment-table th {
      background: #f0fdf4;
      color: #166534;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #86efac;
    }
    .shipment-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .shipment-table tr:hover {
      background: #f9fafb;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-delivered {
      background: #d1fae5;
      color: #065f46;
    }
    .status-in-transit {
      background: #dbeafe;
      color: #1e40af;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .eco-highlight {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    @media print {
      body {
        background: white;
      }
      .section {
        box-shadow: none;
        border: 1px solid #e5e7eb;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌿 Green Supply Chain Report</h1>
    <p>Environmental Impact Summary for ${user.name}</p>
    <p>Generated on ${new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
  </div>

  <div class="section">
    <h2>📊 Overview Statistics</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Shipments</div>
        <div class="stat-value">${shipments.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">CO₂ Emissions</div>
        <div class="stat-value">${totalEmissions.toFixed(2)} kg</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">EcoPoints</div>
        <div class="stat-value">${totalEcoPoints}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Distance</div>
        <div class="stat-value">${totalDistance} km</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Weight</div>
        <div class="stat-value">${totalWeight} kg</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg CO₂/km</div>
        <div class="stat-value">${(totalEmissions / totalDistance).toFixed(3)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📦 Shipment Status Breakdown</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Delivered</div>
        <div class="stat-value">${deliveredCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">In Transit</div>
        <div class="stat-value">${inTransitCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending</div>
        <div class="stat-value">${pendingCount}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🚚 Detailed Shipment Records</h2>
    <table class="shipment-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Goods</th>
          <th>Route</th>
          <th>Vehicle</th>
          <th>Weight</th>
          <th>Distance</th>
          <th>CO₂</th>
          <th>Points</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${shipments.map(s => `
          <tr>
            <td>${s.createdAt.toLocaleDateString('en-IN')}</td>
            <td>${s.goodsDescription}</td>
            <td>${s.origin} → ${s.destination}</td>
            <td>${s.vehicleType} (${s.fuelType})</td>
            <td>${s.weight} kg</td>
            <td>${s.distance} km</td>
            <td>${s.emissionsCO2.toFixed(2)} kg</td>
            <td>${s.ecoPoints}</td>
            <td>
              <span class="status-badge status-${s.status}">
                ${s.status.replace('-', ' ')}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>🌍 Environmental Impact Analysis</h2>
    <div class="eco-highlight">
      <p><strong>Carbon Footprint Equivalent:</strong></p>
      <ul>
        <li>🚗 Equivalent to driving a car for ${(totalEmissions / 0.12).toFixed(0)} km</li>
        <li>🌳 Would require ${(totalEmissions / 21).toFixed(1)} trees to offset (annually)</li>
        <li>💡 Equal to ${(totalEmissions / 0.4).toFixed(0)} hours of LED bulb usage</li>
      </ul>
    </div>
    <p><strong>Sustainability Highlights:</strong></p>
    <ul>
      <li>Total EcoPoints earned: ${totalEcoPoints} points</li>
      <li>Average emissions per km: ${(totalEmissions / totalDistance).toFixed(3)} kg CO₂</li>
      <li>Most eco-friendly shipment: ${
        shipments.reduce((best, s) => 
          (!best || s.ecoPoints > best.ecoPoints) ? s : best
        , null as Shipment | null)?.goodsDescription || 'N/A'
      }</li>
    </ul>
  </div>

  <div class="section">
    <h2>💡 Recommendations</h2>
    <ul>
      <li>Consider electric or hybrid vehicles for short-distance deliveries</li>
      <li>Consolidate shipments to reduce the number of trips</li>
      <li>Use rail or ship transport for long distances when possible</li>
      <li>Implement route optimization to minimize travel distance</li>
      <li>Track and reward sustainable shipping choices with EcoPoints</li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>Green Supply Chain & Carbon Footprint Tracker</strong></p>
    <p>Building a sustainable future, one shipment at a time 🌱</p>
    <p>This report is confidential and intended solely for ${user.name}</p>
  </div>
</body>
</html>
    `;

    // Create and download the report
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Green_Supply_Report_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5 text-green-600" />
          Generate Detailed Report
        </CardTitle>
        <CardDescription>
          Download a comprehensive report of all your shipments and environmental impact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-gray-600">Total Shipments</p>
              <p className="text-green-900">{shipments.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-gray-600">Total CO₂</p>
              <p className="text-green-900">
                {shipments.reduce((sum, s) => sum + s.emissionsCO2, 0).toFixed(2)} kg
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-gray-700 mb-2">Report includes:</p>
            <ul className="text-gray-600 space-y-1">
              <li>✓ Complete shipment details and history</li>
              <li>✓ CO₂ emissions breakdown by vehicle and fuel type</li>
              <li>✓ EcoPoints summary and sustainability metrics</li>
              <li>✓ Environmental impact analysis</li>
              <li>✓ Personalized recommendations</li>
            </ul>
          </div>

          <Button
            onClick={generateReport}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={shipments.length === 0}
          >
            <Download className="size-4 mr-2" />
            Download HTML Report
          </Button>
          <p className="text-gray-600 text-center">
            Open the downloaded file in any browser and print as PDF
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
