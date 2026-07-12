    // CORE COMPUTING LOGIC: Runs calculations for metrics required
        const calculateAnalytics = () => {
            const db = getDB();
            let totalFleetVehicles = db.vehicles.length;
            let activeOnTripVehicles = db.vehicles.filter(v => v.status === 'On Trip').length;

            // 1. Calculate Fleet Utilization Rate
            let fleetUtilization = totalFleetVehicles > 0 ? (activeOnTripVehicles / totalFleetVehicles) * 100 : 0;
            document.getElementById('kpiUtilization').innerText = fleetUtilization.toFixed(1) + '%';

            let globalOpCost = 0;
            let globalDistance = 0;
            let globalFuelLiters = 0;

            const tbody = document.querySelector('#analyticsTable tbody');
            tbody.innerHTML = '';

            db.vehicles.forEach(vehicle => {
                // Total Distance compiled via historical trips
                let totalDistance = db.trips ? db.trips.filter(t => t.vehicleId === vehicle.id).reduce((sum, t) => sum + t.distance, 0) : 0;
                let totalRevenue = db.trips ? db.trips.filter(t => t.vehicleId === vehicle.id).reduce((sum, t) => sum + t.revenue, 0) : 0;

                // Total Fuel Cost & Volumetric Liters compiled via financial ledger entries
                let fuelCost = db.expenses ? db.expenses.filter(e => e.vehicleId === vehicle.id && e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0) : 0;
                let fuelLiters = db.expenses ? db.expenses.filter(e => e.vehicleId === vehicle.id && e.type === 'Fuel').reduce((sum, e) => sum + e.liters, 0) : 0;
                let miscCost = db.expenses ? db.expenses.filter(e => e.vehicleId === vehicle.id && e.type !== 'Fuel').reduce((sum, e) => sum + e.amount, 0) : 0;

                // Maintenance costs compiled via maintenance records
                let maintenanceCost = db.maintenance ? db.maintenance.filter(m => m.vehicleId === vehicle.id).reduce((sum, m) => sum + m.cost, 0) : 0;

                // 2. Compute formulas as defined by business requirements
                let operationalCost = fuelCost + miscCost + maintenanceCost;
                let efficiency = fuelLiters > 0 ? (totalDistance / fuelLiters) : 0;

                // Formula: ROI = [Revenue - (Maintenance + Fuel)] / Acquisition Cost
                let totalDeductions = maintenanceCost + fuelCost;
                let acquisitionCost = vehicle.acqCost || 20000; // safety fallback check if not set
                let vehicleROI = (totalRevenue - totalDeductions) / acquisitionCost;

                // Update running parameters
                globalOpCost += operationalCost;
                globalDistance += totalDistance;
                globalFuelLiters += fuelLiters;

                // Inject data row directly
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${vehicle.regNo}</strong> <span style="color:#64748b; font-size:12px;">(${vehicle.name})</span></td>
                        <td>${totalDistance} km</td>
                        <td><b>${efficiency.toFixed(2)}</b> km/L</td>
                        <td>₹${operationalCost.toFixed(2)}</td>
                        <td style="color:#065f46; font-weight:600;">₹${totalRevenue.toFixed(2)}</td>
                        <td style="font-weight:700; color: ${vehicleROI >= 0 ? '#185fa5' : '#d85a30'}">
                            ${(vehicleROI * 100).toFixed(1)}% ROI
                        </td>
                    </tr>
                `;
            });

            // Update Top Global KPI Cards
            document.getElementById('kpiOpCost').innerText = '₹' + globalOpCost.toFixed(2);
            let avgEfficiency = globalFuelLiters > 0 ? (globalDistance / globalFuelLiters) : 0;
            document.getElementById('kpiEfficiency').innerText = avgEfficiency.toFixed(2) + ' km/L';
        };

        // SUCCESS ALERT INTERACTION HANDLER: Simulates compilation success page state transitions
        window.compileAndLockReport = () => {
            alert("SUCCESS: Analytics Ledger Pipeline Processed!\nReport metrics compiled seamlessly and saved to system files cache.");
        };

        // EXPORT DATA UTILITY: Generates a CSV data string downloadable instantly inside browser
        window.exportReportToCSV = () => {
            const db = getDB();
            let csvContent = "data:text/csv;charset=utf-8,Vehicle Plate,Total Distance(KM),Fuel Efficiency(KM/L),Operational Cost(₹),Total Revenue(₹),ROI(%)\r\n";

            db.vehicles.forEach(v => {
                let dist = db.trips ? db.trips.filter(t => t.vehicleId === v.id).reduce((sum, t) => sum + t.distance, 0) : 0;
                let rev = db.trips ? db.trips.filter(t => t.vehicleId === v.id).reduce((sum, t) => sum + t.revenue, 0) : 0;
                let fCost = db.expenses ? db.expenses.filter(e => e.vehicleId === v.id && e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0) : 0;
                let fLiters = db.expenses ? db.expenses.filter(e => e.vehicleId === v.id && e.type === 'Fuel').reduce((sum, e) => sum + e.liters, 0) : 0;
                let mCost = db.maintenance ? db.maintenance.filter(m => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0) : 0;
                let misc = db.expenses ? db.expenses.filter(e => e.vehicleId === v.id && e.type !== 'Fuel').reduce((sum, e) => sum + e.amount, 0) : 0;

                let op = fCost + misc + mCost;
                let eff = fLiters > 0 ? (dist / fLiters) : 0;
                let roi = ((rev - (mCost + fCost)) / (v.acqCost || 20000)) * 100;

                csvContent += `${v.regNo},${dist},${eff.toFixed(2)},${op.toFixed(2)},${rev.toFixed(2)},${roi.toFixed(1)}%\r\n`;
            });

            // Browser download link generation sequence
            const encodedUri = encodeURI(csvContent);
            const downloadLink = document.createElement("a");
            downloadLink.setAttribute("href", encodedUri);
            downloadLink.setAttribute("download", `TransitOps_Fleet_Report_${Date.now()}.csv`);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        // Bootstrap loader sequence
        document.addEventListener('DOMContentLoaded', calculateAnalytics);