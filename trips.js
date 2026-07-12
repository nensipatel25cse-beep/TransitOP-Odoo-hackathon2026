  // Tailwind script already loaded

        // --- TRIP MANAGEMENT SYSTEM DATA & LOGIC ---
        let allTrips = [
            { id: 'TR-3921', source: 'Delhi', dest: 'Mumbai', vehicle: 'MH-04-AB-7845', driver: 'Rajesh Sharma', weight: '2000', distance: '1400', status: 'Completed' },
            { id: 'TR-3924', source: 'Bangalore', dest: 'Chennai', vehicle: 'KA-01-XY-2231', driver: 'Priya Nair', weight: '1500', distance: '350', status: 'Dispatched' },
            { id: 'TR-3925', source: 'Kolkata', dest: 'Patna', vehicle: 'DL-09-CD-1122', driver: 'Amit Kumar', weight: '3000', distance: '580', status: 'Draft' }
        ];

        function renderTripsTable() {
            const tbody = document.getElementById('trip-table-body');
            tbody.innerHTML = '';
            
            allTrips.forEach(trip => {
                let badgeClass = '';
                if (trip.status === 'Draft') badgeClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                else if (trip.status === 'Dispatched') badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
                else if (trip.status === 'Completed') badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
                else if (trip.status === 'Cancelled') badgeClass = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';

                tbody.innerHTML += `
                    <tr class="hover:bg-[#F8F7F3] dark:hover:bg-[#162C45] transition-colors">
                        <td class="py-4 px-6 font-medium text-[#042C53] dark:text-white">${trip.id}</td>
                        <td class="py-4 px-6">
                            <div class="font-medium dark:text-gray-200">${trip.source} <i class="fa-solid fa-arrow-right text-xs mx-1 text-gray-400"></i> ${trip.dest}</div>
                        </td>
                        <td class="py-4 px-6">
                            <div class="dark:text-gray-200">${trip.vehicle}</div>
                            <div class="text-xs text-gray-500">${trip.driver}</div>
                        </td>
                        <td class="py-4 px-6 text-gray-600 dark:text-gray-400">
                            ${trip.weight} kg • ${trip.distance} km
                        </td>
                        <td class="py-4 px-6">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}">${trip.status}</span>
                        </td>
                        <td class="py-4 px-6">
                            <select onchange="updateTripStatus('${trip.id}', this.value)" class="bg-white dark:bg-[#1C2F4A] border border-[#D3D1C7] dark:border-white/20 rounded-lg px-2 py-1 text-xs focus:outline-none dark:text-white">
                                <option value="" disabled selected>Change Lifecycle</option>
                                <option value="Draft" ${trip.status === 'Draft' ? 'disabled' : ''}>Set to Draft</option>
                                <option value="Dispatched" ${trip.status === 'Dispatched' ? 'disabled' : ''}>Dispatch Trip</option>
                                <option value="Completed" ${trip.status === 'Completed' ? 'disabled' : ''}>Mark Completed</option>
                                <option value="Cancelled" ${trip.status === 'Cancelled' ? 'disabled' : ''}>Cancel Trip</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        }

        function submitNewTrip(status) {
            const source = document.getElementById('nt-source').value;
            const dest = document.getElementById('nt-dest').value;
            const vehicle = document.getElementById('nt-vehicle').value;
            const driver = document.getElementById('nt-driver').value;
            const weight = document.getElementById('nt-weight').value;
            const distance = document.getElementById('nt-distance').value;

            if(!source || !dest || !vehicle || !driver || !weight || !distance) {
                alert('Please fill out all trip details.');
                return;
            }

            const newId = 'TR-' + Math.floor(1000 + Math.random() * 9000);
            allTrips.unshift({
                id: newId, source, dest, vehicle, driver, weight, distance, status
            });

            document.getElementById('new-trip-form').reset();
            closeNewTripModal();
            renderTripsTable(); // Updates the management view if it's behind it
            
            // Show brief notification
            alert(`✅ Trip ${newId} created successfully as ${status}!`);
        }

        function updateTripStatus(id, newStatus) {
            const tripIndex = allTrips.findIndex(t => t.id === id);
            if (tripIndex !== -1) {
                allTrips[tripIndex].status = newStatus;
                renderTripsTable();
            }
        }

        function closeNewTripModal() {
            document.getElementById('new-trip-modal').classList.remove('flex');
            document.getElementById('new-trip-modal').classList.add('hidden');
        }

        function closeTripManagement() {
            document.getElementById('trip-management-modal').classList.remove('flex');
            document.getElementById('trip-management-modal').classList.add('hidden');
        }
        // --- END TRIP MANAGEMENT SYSTEM ---

        
        function navigateTo(el) {
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            el.classList.add('active');
        }
        
        // Dark mode
        function toggleDarkMode() {
            const isDark = document.documentElement.classList.toggle('dark');
            const icon = document.getElementById('theme-icon');
            icon.classList.toggle('fa-moon', !isDark);
            icon.classList.toggle('fa-sun', isDark);
            localStorage.theme = isDark ? 'dark' : 'light';
        }
        
        // Sample data
        let fleetData = {
            available: 28,
            onTrip: 19,
            maintenance: 7,
            retired: 1
        };
        
        // Donut Chart
        let fleetDonut;
        
        function createFleetDonut() {
            const ctx = document.getElementById('fleetDonutChart');
            if (fleetDonut) fleetDonut.destroy();
            
            fleetDonut = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Available', 'On Trip', 'Maintenance', 'Retired'],
                    datasets: [{
                        data: [28, 19, 7, 1],
                        backgroundColor: [
                            '#10b981',
                            '#D85A30',
                            '#f59e0b',
                            '#6b7280'
                        ],
                        borderColor: document.documentElement.classList.contains('dark') ? '#0F2338' : '#ffffff',
                        borderWidth: 6,
                        hoverOffset: 20
                    }]
                },
                options: {
                    cutout: '78%',
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#042C53',
                            titleColor: '#E6F1FB',
                            bodyColor: '#E6F1FB',
                            displayColors: false
                        }
                    }
                }
            });
        }
        
        // Fuel trend line
        let fuelChart;
        
        function createFuelTrend() {
            const ctx = document.getElementById('fuelTrendChart');
            if (fuelChart) fuelChart.destroy();
            
            fuelChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Avg km/l',
                        data: [11.8, 12.1, 13.4, 11.9, 12.8, 13.1, 12.4],
                        borderColor: '#EF9F27',
                        tension: 0.4,
                        borderWidth: 4,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: '#E6F1FB' },
                            ticks: { color: '#6b7280' }
                        },
                        x: {
                            grid: { color: '#E6F1FB' },
                            ticks: { color: '#6b7280' }
                        }
                    }
                }
            });
        }
        
        function populateActiveTrips() {
            const container = document.getElementById('active-trips-list');
            container.innerHTML = `
                <div class="flex gap-4 items-center bg-[#F8F7F3] dark:bg-[#1C2F4A] p-4 rounded-2xl">
                    <div class="flex-1">
                        <div class="font-medium">TR-3921 • Delhi → Mumbai</div>
                        <div class="text-xs text-gray-500">MH-04-AB-7845 • Rajesh Sharma</div>
                    </div>
                    <div class="text-right">
                        <div class="text-emerald-600 text-sm font-medium">On Time</div>
                        <div class="text-xs">Est. 2h 40m</div>
                    </div>
                </div>
                
                <div class="flex gap-4 items-center bg-[#F8F7F3] dark:bg-[#1C2F4A] p-4 rounded-2xl">
                    <div class="flex-1">
                        <div class="font-medium">TR-3924 • Bangalore → Chennai</div>
                        <div class="text-xs text-gray-500">KA-01-XY-2231 • Priya Nair</div>
                    </div>
                    <div class="text-right">
                        <div class="text-amber-500 text-sm font-medium">Delayed</div>
                        <div class="text-xs">45 min late</div>
                    </div>
                </div>
            `;
        }
        
        function populateRecentActivity() {
            const container = document.getElementById('recent-activity');
            container.innerHTML = `
                <div class="flex gap-4">
                    <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg">✅</div>
                    <div class="flex-1">
                        <div class="text-sm">Trip TR-3921 completed</div>
                        <div class="text-xs text-gray-500">12 minutes ago • MH-04-AB-7845</div>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg">🔧</div>
                    <div class="flex-1">
                        <div class="text-sm">Vehicle KA-01-XY-2231 entered maintenance</div>
                        <div class="text-xs text-gray-500">2 hours ago</div>
                    </div>
                </div>
            `;
        }
        
        function updateKPIs() {
            document.getElementById('kpi-active-vehicles').textContent = '42';
            document.getElementById('kpi-available').textContent = fleetData.available;
            document.getElementById('kpi-maintenance').textContent = fleetData.maintenance;
            document.getElementById('kpi-active-trips').textContent = '19';
            document.getElementById('kpi-drivers-duty').textContent = '31';
            document.getElementById('kpi-utilization').textContent = '87%';
            document.getElementById('kpi-fuel').textContent = '12.4';
        }
        
        function showDetailModal(type) {
            const modal = document.getElementById('detail-modal');
            const title = document.getElementById('modal-title');
            const content = document.getElementById('modal-content');
            
            if (type === 'vehicles') {
                title.textContent = 'All Vehicles';
                content.innerHTML = `<p class="text-6xl font-bold text-[#042C53] mb-4">42</p><p class="text-xl">vehicles currently active in the network.</p>`;
            } else if (type === 'available') {
                title.textContent = 'Available Fleet';
                content.innerHTML = `<p class="text-6xl font-bold text-emerald-600 mb-4">28</p><p class="text-xl">ready for dispatch.</p>`;
            } else if (type === 'maintenance') {
                title.textContent = 'Vehicles in Shop';
                content.innerHTML = `<p class="text-6xl font-bold text-[#D85A30] mb-4">7</p><p class="text-xl">undergoing service.</p>`;
            } else {
                title.textContent = 'Active Trips';
                content.innerHTML = `<p class="text-6xl font-bold mb-4">19</p><p class="text-xl">in transit right now.</p>`;
            }
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        
        function closeModal() {
            const modal = document.getElementById('detail-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        
        function toggleNotifications() {
            alert("📬 3 new notifications:\n• License expiring for driver Rajesh\n• Vehicle MH-04 due for service\n• Trip TR-3924 running 45 mins late");
        }
        
        // Modified to trigger the New Trip wizard UI
        function newTrip() {
            document.getElementById('new-trip-modal').classList.remove('hidden');
            document.getElementById('new-trip-modal').classList.add('flex');
        }
        
        function logMaintenance() {
            alert("🔧 Maintenance log opened for selected vehicles.");
        }
        
        // Modified to trigger the full Trip Management View
        function viewAllTrips() {
            renderTripsTable();
            document.getElementById('trip-management-modal').classList.remove('hidden');
            document.getElementById('trip-management-modal').classList.add('flex');
        }
        
        function logout() {
            if (confirm("Sign out of TransitOps?")) {
                window.location.href = "index.html";
            }
        }
        
        function updateDashboard() {
            // Simulate filter change
            console.log('%cDashboard updated with new filters', 'color:#EF9F27; font-weight:bold');
        }
        
        // Initialize everything
        document.addEventListener('DOMContentLoaded', function() {
            // Apply saved theme
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }
            
            updateKPIs();
            createFleetDonut();
            createFuelTrend();
            populateActiveTrips();
            populateRecentActivity();
            
            // Keyboard shortcut hint
            console.log('%cTransitOps Dashboard Ready 🚛\nPress "/" to search • Dark mode: Ctrl/Cmd + K', 'color:#185FA5; font-size:13px');
            
            // Live clock simulation for realism
            setInterval(() => {
                const liveDot = document.querySelector('.status-dot');
                if (liveDot) liveDot.style.opacity = liveDot.style.opacity === '1' ? '0.3' : '1';
            }, 1800);
            
            // Search focus
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === "Enter") {
                    alert("🔍 Searching for: " + this.value);
                }
            });
        });
        
        // Expose some functions globally
        window.toggleDarkMode = toggleDarkMode;
        window.showDetailModal = showDetailModal;
        window.closeModal = closeModal;
        window.navigateTo = navigateTo;
        window.newTrip = newTrip;
        window.logMaintenance = logMaintenance;
        window.logout = logout;
        window.viewAllTrips = viewAllTrips;
        window.toggleNotifications = toggleNotifications;
        window.updateDashboard = updateDashboard;