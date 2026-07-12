        // Populate the dropdown with vehicles that are NOT currently in the shop
        const populateVehicleDropdown = () => {
            const db = getDB();
            const select = document.getElementById('vehicleSelect');
            select.innerHTML = '<option value="">-- Choose Active Vehicle --</option>';

            db.vehicles.forEach(vehicle => {
                // Shows current status in dropdown to assist the manager
                select.innerHTML += `<option value="${vehicle.id}">${vehicle.regNo} - ${vehicle.name} (${vehicle.status})</option>`;
            });
        };

        // Render logs data into display rows
        const renderMaintenanceTable = () => {
            const db = getDB();
            const tbody = document.querySelector('#maintenanceTable tbody');
            tbody.innerHTML = '';

            if (!db.maintenance || db.maintenance.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; padding:20px;">No current maintenance work orders logged.</td></tr>`;
                return;
            }

            db.maintenance.forEach(log => {
                const isCurrent = log.status === 'In Shop';
                const badgeClass = isCurrent ? 'badge-shop' : 'badge-fixed';

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${log.vehicleReg}</strong></td>
                        <td>${log.serviceType}</td>
                        <td>${log.description}</td>
                        <td><b>₹${log.cost}</b></td>
                        <td>${log.date}</td>
                        <td><span class="badge ${badgeClass}">${log.status}</span></td>
                        <td>
                            ${isCurrent ? `<button class="btn-action" onclick="releaseVehicle('${log.id}', '${log.vehicleId}')">Complete Work</button>` : '📂 Completed'}
                        </td>
                    </tr>
                `;
            });
        };

        // Handle the submission form action
        document.getElementById('maintenanceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const db = getDB();

            const vehicleId = document.getElementById('vehicleSelect').value;
            const targetVehicle = db.vehicles.find(v => v.id === vehicleId);

            const newLog = {
                id: 'MNT-' + Date.now(),
                vehicleId: vehicleId,
                vehicleReg: targetVehicle.regNo,
                serviceType: document.getElementById('serviceType').value,
                cost: parseFloat(document.getElementById('serviceCost').value),
                date: document.getElementById('serviceDate').value,
                description: document.getElementById('serviceDesc').value,
                status: 'In Shop'
            };

            // BUSINESS RULE ENFORCEMENT: 
            // Change vehicle status to 'In Shop' so it disappears from driver selection pool
            targetVehicle.status = 'In Shop';

            if (!db.maintenance) db.maintenance = [];
            db.maintenance.push(newLog);
            
            saveDB(db);
            alert(`SUCCESS: ${targetVehicle.regNo} has been assigned to the shop. It is now hidden from the dispatch fleet pool.`);
            
            e.target.reset();
            populateVehicleDropdown();
            renderMaintenanceTable();
        });

        // Resolve Maintenance & Restore Vehicle Availability
        window.releaseVehicle = (logId, vehicleId) => {
            const db = getDB();
            
            const log = db.maintenance.find(m => m.id === logId);
            const vehicle = db.vehicles.find(v => v.id === vehicleId);

            if (log && vehicle) {
                log.status = 'Resolved';
                vehicle.status = 'Available'; // Restores status so it returns to driver dispatch options
                
                saveDB(db);
                alert(`SUCCESS: Work Order Completed. ${vehicle.regNo} is now marked Available for active transit duties.`);
                
                populateVehicleDropdown();
                renderMaintenanceTable();
            }
        };

        // Bootstrap load sequence
        document.addEventListener('DOMContentLoaded', () => {
            populateVehicleDropdown();
            renderMaintenanceTable();
        });