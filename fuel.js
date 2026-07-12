   // Toggle the visibility of the fuel volume field dynamically
        function toggleFuelField(val) {
            const litersGroup = document.getElementById('litersGroup');
            const litersInput = document.getElementById('fuelLiters');
            if (val === 'Fuel') {
                litersGroup.style.display = 'flex';
                litersInput.setAttribute('required', 'true');
            } else {
                litersGroup.style.display = 'none';
                litersInput.removeAttribute('required');
                litersInput.value = '0';
            }
        }

        // Dropdown populator logic utility
        const populateDropdown = () => {
            const db = getDB();
            const select = document.getElementById('vehicleSelect');
            select.innerHTML = '<option value="">-- Select --</option>';
            db.vehicles.forEach(v => {
                select.innerHTML += `<option value="${v.id}">${v.regNo} - ${v.name}</option>`;
            });
        };

        // Render standard log rows display matrix table 
        const renderExpensesTable = () => {
            const db = getDB();
            const tbody = document.querySelector('#expensesTable tbody');
            tbody.innerHTML = '';

            if (!db.expenses || db.expenses.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:15px;">No transactional cost records committed.</td></tr>`;
                return;
            }

            db.expenses.forEach(exp => {
                let typeClass = 'badge-other';
                if(exp.type === 'Fuel') typeClass = 'badge-fuel';
                if(exp.type === 'Toll') typeClass = 'badge-toll';

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${exp.vehicleReg}</strong></td>
                        <td><span class="badge ${typeClass}">${exp.type}</span></td>
                        <td><b>₹${exp.amount.toFixed(2)}</b></td>
                        <td>${exp.type === 'Fuel' ? `${exp.liters} L` : '-'}</td>
                        <td>${exp.date}</td>
                        <td><span style="color:#475569; font-size:14px;">${exp.remarks}</span></td>
                    </tr>
                `;
            });
        };

        // CORE COMPUTE ENGINE: Compiles total costs matching your requirements
        const renderCostSummaryTable = () => {
            const db = getDB();
            const tbody = document.querySelector('#summaryTable tbody');
            tbody.innerHTML = '';

            db.vehicles.forEach(vehicle => {
                // 1. Accumulate all values logged in the expense table for this vehicle
                let runningExpenseTotal = 0;
                if (db.expenses) {
                    runningExpenseTotal = db.expenses
                        .filter(e => e.vehicleId === vehicle.id)
                        .reduce((sum, current) => sum + current.amount, 0);
                }

                // 2. Automatically check maintenance logs to find structural service costs
                let runningMaintenanceTotal = 0;
                if (db.maintenance) {
                    runningMaintenanceTotal = db.maintenance
                        .filter(m => m.vehicleId === vehicle.id)
                        .reduce((sum, current) => sum + current.cost, 0);
                }

                // 3. Compute formula (Fuel + Maintenance)
                const grandTotalCost = runningExpenseTotal + runningMaintenanceTotal;

                tbody.innerHTML += `
                    <tr>
                        <td><code>${vehicle.regNo}</code></td>
                        <td>₹${runningExpenseTotal.toFixed(2)}</td>
                        <td>₹${runningMaintenanceTotal.toFixed(2)}</td>
                        <td style="color:var(--accent); font-weight:700;">₹${grandTotalCost.toFixed(2)}</td>
                    </tr>
                `;
            });
        };

        // Capture user input forms submissions
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const db = getDB();

            const vehicleId = document.getElementById('vehicleSelect').value;
            const targetVehicle = db.vehicles.find(v => v.id === vehicleId);
            const expenseType = document.getElementById('expenseType').value;

            const newExpense = {
                id: 'EXP-' + Date.now(),
                vehicleId: vehicleId,
                vehicleReg: targetVehicle.regNo,
                type: expenseType,
                amount: parseFloat(document.getElementById('costAmount').value),
                date: document.getElementById('logDate').value,
                liters: expenseType === 'Fuel' ? parseFloat(document.getElementById('fuelLiters').value) : 0,
                remarks: document.getElementById('remarks').value
            };

            if (!db.expenses) db.expenses = [];
            db.expenses.push(newExpense);
            saveDB(db);

            alert("Financial record logged successfully! Total costs updated live.");
            
            e.target.reset();
            toggleFuelField('Fuel'); // reset input focus fields defaults
            renderExpensesTable();
            renderCostSummaryTable();
        });

        // Application bootstrap initial loading sequence
        document.addEventListener('DOMContentLoaded', () => {
            populateDropdown();
            renderExpensesTable();
            renderCostSummaryTable();
        });