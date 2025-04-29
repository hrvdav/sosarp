// Data variables
let calls = [];
let units = [];
let bolos = [];
let reports = [];
let activities = [];
let players = [];
let vehicles = [];
let tickets = [];
let warrants = [];

// Check login status immediately
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('user_logged_in');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
    } else {
        // Make sure the interface is visible
        document.getElementById('cad-container').style.display = 'block';
        // Update user info in the interface
        const userName = localStorage.getItem('user_name') || 'Unknown Officer';
        const unitInfo = document.getElementById('unitNumber');
        if (unitInfo) {
            unitInfo.textContent = 'UNIT-001';
        }
    }
}

// Load data from localStorage on startup
function loadLocalStorage() {
    if (localStorage.getItem('cad_calls')) calls = JSON.parse(localStorage.getItem('cad_calls'));
    if (localStorage.getItem('cad_units')) units = JSON.parse(localStorage.getItem('cad_units'));
    if (localStorage.getItem('cad_bolos')) bolos = JSON.parse(localStorage.getItem('cad_bolos'));
    if (localStorage.getItem('cad_reports')) reports = JSON.parse(localStorage.getItem('cad_reports'));
    if (localStorage.getItem('cad_activities')) activities = JSON.parse(localStorage.getItem('cad_activities'));
    if (localStorage.getItem('cad_players')) players = JSON.parse(localStorage.getItem('cad_players'));
    if (localStorage.getItem('cad_vehicles')) vehicles = JSON.parse(localStorage.getItem('cad_vehicles'));
    if (localStorage.getItem('cad_tickets')) tickets = JSON.parse(localStorage.getItem('cad_tickets'));
    if (localStorage.getItem('cad_warrants')) warrants = JSON.parse(localStorage.getItem('cad_warrants'));
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('cad_calls', JSON.stringify(calls));
    localStorage.setItem('cad_units', JSON.stringify(units));
    localStorage.setItem('cad_bolos', JSON.stringify(bolos));
    localStorage.setItem('cad_reports', JSON.stringify(reports));
    localStorage.setItem('cad_activities', JSON.stringify(activities));
    localStorage.setItem('cad_players', JSON.stringify(players));
    localStorage.setItem('cad_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('cad_tickets', JSON.stringify(tickets));
    localStorage.setItem('cad_warrants', JSON.stringify(warrants));
}

// Close CAD function for web version
function closeCAD() {
    console.log("Close button clicked");
    
    // For web version, we could redirect to a homepage or just hide the CAD
    if (confirm("Are you sure you want to log out of the CAD system?")) {
        localStorage.setItem('user_logged_in', 'false');
        window.location.href = 'login.html'; // Redirect to login page
    }
}

// Save data to server (in web version, uses localStorage as fallback)
function saveData(type, data) {
    // For a real web app, you would use AJAX to send to server
    // For now, just update local storage
    
    if (type === 'activity') {
        // For activities, we add to the array
        activities.unshift(data);
        if (activities.length > 10) activities.pop();
    }
    
    // Update appropriate array based on type
    saveToLocalStorage();
}

// Initialize everything when document is ready
$(document).ready(function() {
    console.log("DOM fully loaded - jQuery ready");
    
    // Check login status first
    checkLoginStatus();
    
    // Show the body
    $('body').show();
    
    // Load data from localStorage 
    loadLocalStorage();
    
    // Add default unit if none exists
    if (units.length === 0) {
        units.push({
            id: 'UNIT-001',
            status: 'Available',
            location: 'Headquarters',
            officer: 'Officer ' + (localStorage.getItem('user_name') || 'John Doe')
        });
    }
    
    // Update initial UI
    updateCallsList();
    updateUnitsList();
    updateBoloList();
    updateReportList();
    updatePlayerList();
    updateVehicleList();
    updateVehicleOwnerSelect();
    updateTicketList();
    updateWarrantList();
    updateTicketPlayerSelect();
    updateWarrantPlayerSelect();
    
    // Direct event handler for close button
    $('#closeCAD').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Close button clicked from jQuery handler");
        closeCAD();
        return false;
    });
    
    // Category toggling
    $('.category-title').on('click', function() {
        $(this).parent('.nav-category').toggleClass('collapsed');
    });

    // Tab navigation
    $('.nav-item').on('click', function() {
        $('.nav-item').removeClass('active');
        $('.tab-content').removeClass('active');
        
        $(this).addClass('active');
        $('#' + $(this).data('tab')).addClass('active');
    });

    // New Call Form
    $('#newCallForm').on('submit', function(e) {
        e.preventDefault();
        const call = {
            id: `CALL-${calls.length + 1}`,
            type: $('#callType').val(),
            priority: $('#callPriority').val(),
            location: $('#callLocation').val(),
            description: $('#callDescription').val(),
            time: new Date().toLocaleTimeString(),
            status: 'Active',
            assignedUnits: []
        };
        calls.push(call);
        saveData('call', call);
        addActivity(`New call created: ${call.type} at ${call.location}`);
        updateCallsList();
        this.reset();
    });

    // Unit Status Form
    $('#unitStatusForm').on('submit', function(e) {
        e.preventDefault();
        const unit = units.find(u => u.id === 'UNIT-001');
        if (unit) {
            unit.status = $('#unitStatus').val();
            unit.location = $('#unitLocation').val();
            saveData('unit', unit);
            addActivity(`Unit ${unit.id} status changed to ${unit.status}`);
            updateUnitsList();
            $('#userStatus').text(unit.status);
            
            const statusIndicator = $('.status-indicator');
            statusIndicator.css('background-color', 
                unit.status === 'Available' ? 'var(--success-color)' :
                unit.status === 'Busy' ? 'var(--warning-color)' :
                'var(--danger-color)');
        }
    });

    // BOLO Form
    $('#boloForm').on('submit', function(e) {
        e.preventDefault();
        const bolo = {
            id: `BOLO-${bolos.length + 1}`,
            type: $('#boloType').val(),
            subject: $('#boloSubject').val(),
            description: $('#boloDescription').val(),
            time: new Date().toLocaleTimeString(),
            issuedBy: 'UNIT-001'
        };
        bolos.push(bolo);
        saveData('bolo', bolo);
        addActivity(`New BOLO issued: ${bolo.type} - ${bolo.subject}`);
        updateBoloList();
        this.reset();
    });

    // NCIC Search Form
    $('#ncicSearchForm').on('submit', function(e) {
        e.preventDefault();
        const searchType = $('#searchType').val();
        const searchQuery = $('#searchQuery').val().toLowerCase();
        const results = $('#searchResults');
        
        let searchResults = [];
        
        if (searchType === 'Person') {
            searchResults = players.filter(player => 
                player.firstName.toLowerCase().includes(searchQuery) ||
                player.lastName.toLowerCase().includes(searchQuery) ||
                player.license.toLowerCase().includes(searchQuery)
            );
            
            if (searchResults.length > 0) {
                results.html(searchResults.map(player => {
                    // Get player's vehicles
                    const playerVehicles = vehicles.filter(v => v.owner === player.license);
                    // Get player's tickets
                    const playerTickets = tickets.filter(t => t.playerLicense === player.license);
                    // Get player's warrants
                    const playerWarrants = warrants.filter(w => w.playerLicense === player.license);
                    
                    return `
                        <div class="list-item">
                            <div>
                                <strong>Person Record</strong><br>
                                Name: ${player.firstName} ${player.lastName}<br>
                                DOB: ${player.dob}<br>
                                License: ${player.license}<br>
                                Gender: ${player.gender}<br>
                                Address: ${player.address}<br>
                                Phone: ${player.phone}<br>
                                <strong>Warnings: ${player.warnings}</strong>
                                
                                ${playerVehicles.length > 0 ? `
                                    <br><br><strong>Registered Vehicles:</strong>
                                    ${playerVehicles.map(v => `
                                        <div style="margin-left: 20px;">
                                            ${v.plate} - ${v.year} ${v.make} ${v.model} (${v.color}) - Status: ${v.status}
                                        </div>
                                    `).join('')}
                                ` : ''}
                                
                                ${playerTickets.length > 0 ? `
                                    <br><strong>Active Citations:</strong>
                                    ${playerTickets.map(t => `
                                        <div style="margin-left: 20px;">
                                            ${t.type} - $${t.amount} - ${t.date ? new Date(t.date).toLocaleDateString() : 'Unknown Date'}
                                        </div>
                                    `).join('')}
                                ` : ''}
                                
                                ${playerWarrants.length > 0 ? `
                                    <br><strong>Active Warrants:</strong>
                                    ${playerWarrants.map(w => `
                                        <div style="margin-left: 20px; color: var(--danger-color);">
                                            ${w.type} - Expires: ${w.expiryDate}
                                        </div>
                                    `).join('')}
                                ` : ''}
                            </div>
                            <div>
                                <button onclick="addWarning('${player.license}')">Add Warning</button>
                                <button onclick="viewPlayerHistory('${player.license}')">View History</button>
                                <button onclick="issueTicket('${player.license}')">Issue Ticket</button>
                                <button onclick="issueWarrant('${player.license}')">Issue Warrant</button>
                            </div>
                        </div>
                    `;
                }).join(''));
            } else {
                results.html('<div class="list-item">No records found</div>');
            }
        } else if (searchType === 'Vehicle') {
            searchResults = vehicles.filter(vehicle => 
                vehicle.plate.toLowerCase().includes(searchQuery) ||
                vehicle.vin.toLowerCase().includes(searchQuery)
            );
            
            if (searchResults.length > 0) {
                results.html(searchResults.map(vehicle => {
                    const owner = players.find(p => p.license === vehicle.owner);
                    return `
                        <div class="list-item">
                            <div>
                                <strong>Vehicle Record</strong><br>
                                Plate: ${vehicle.plate}<br>
                                Owner: ${owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'}<br>
                                Make/Model: ${vehicle.year} ${vehicle.make} ${vehicle.model}<br>
                                Color: ${vehicle.color}<br>
                                VIN: ${vehicle.vin}<br>
                                Status: ${vehicle.status}<br>
                                ${vehicle.status === 'Stolen' ? '<strong>STOLEN VEHICLE - APPROACH WITH CAUTION</strong>' : ''}
                            </div>
                            <div>
                                <button onclick="updateVehicleStatus('${vehicle.plate}')">Update Status</button>
                                <button onclick="viewVehicleHistory('${vehicle.plate}')">View History</button>
                            </div>
                        </div>
                    `;
                }).join(''));
            } else {
                results.html('<div class="list-item">No records found</div>');
            }
        } else {
            results.html('<div class="list-item">No records found</div>');
        }
        
        addActivity(`NCIC search performed: ${searchType} - ${searchQuery}`);
    });

    // Player Registration Form
    $('#playerRegistrationForm').on('submit', function(e) {
        e.preventDefault();
        
        const player = {
            firstName: $('#playerFirstName').val(),
            lastName: $('#playerLastName').val(),
            dob: $('#playerDOB').val(),
            gender: $('#playerGender').val(),
            license: generateLicenseNumber(),
            phone: $('#playerPhone').val(),
            address: $('#playerAddress').val(),
            warnings: 0,
            history: [],
            registeredDate: new Date().toISOString()
        };
        
        players.push(player);
        saveData('player', player);
        $('#playerLicense').val(player.license);
        addActivity(`New player registered: ${player.firstName} ${player.lastName}`);
        updatePlayerList();
        updateVehicleOwnerSelect();
        updateTicketPlayerSelect();
        updateWarrantPlayerSelect();
        
        setTimeout(() => {
            this.reset();
        }, 2000);
    });

    // Vehicle Registration Form
    $('#vehicleRegistrationForm').on('submit', function(e) {
        e.preventDefault();
        
        const vehicle = {
            owner: $('#vehicleOwner').val(),
            plate: $('#vehiclePlate').val().toUpperCase(),
            make: $('#vehicleMake').val(),
            model: $('#vehicleModel').val(),
            year: $('#vehicleYear').val(),
            color: $('#vehicleColor').val(),
            vin: $('#vehicleVIN').val(),
            status: $('#vehicleStatus').val(),
            history: [],
            registeredDate: new Date().toISOString()
        };
        
        vehicles.push(vehicle);
        saveData('vehicle', vehicle);
        addActivity(`New vehicle registered: ${vehicle.plate} - ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
        updateVehicleList();
        this.reset();
    });

    // Ticket Form
    $('#ticketForm').on('submit', function(e) {
        e.preventDefault();
        
        const ticket = {
            id: `TKT-${tickets.length + 1}`,
            playerLicense: $('#ticketPlayer').val(),
            type: $('#ticketType').val(),
            amount: $('#ticketAmount').val(),
            location: $('#ticketLocation').val(),
            notes: $('#ticketNotes').val(),
            officer: 'UNIT-001',
            date: new Date().toISOString(),
            status: 'Unpaid'
        };
        
        tickets.push(ticket);
        saveData('ticket', ticket);
        
        const player = players.find(p => p.license === ticket.playerLicense);
        if (player) {
            addActivity(`Ticket issued to ${player.firstName} ${player.lastName}: ${ticket.type} - $${ticket.amount}`);
        }
        
        updateTicketList();
        this.reset();
    });

    // Warrant Form
    $('#warrantForm').on('submit', function(e) {
        e.preventDefault();
        
        const warrant = {
            id: `WRT-${warrants.length + 1}`,
            playerLicense: $('#warrantPlayer').val(),
            type: $('#warrantType').val(),
            reason: $('#warrantReason').val(),
            expiryDate: $('#warrantExpiry').val(),
            officer: 'UNIT-001',
            issueDate: new Date().toISOString(),
            status: 'Active'
        };
        
        warrants.push(warrant);
        saveData('warrant', warrant);
        
        const player = players.find(p => p.license === warrant.playerLicense);
        if (player) {
            addActivity(`Warrant issued for ${player.firstName} ${player.lastName}: ${warrant.type}`);
        }
        
        updateWarrantList();
        this.reset();
        
        // Set default expiry date again
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30); // Set expiry to 30 days in future
        $('#warrantExpiry').val(futureDate.toISOString().slice(0, 10));
    });

    // Report Form
    $('#reportForm').on('submit', function(e) {
        e.preventDefault();
        const report = {
            id: `RPT-${reports.length + 1}`,
            type: $('#reportType').val(),
            date: $('#reportDate').val(),
            location: $('#reportLocation').val(),
            narrative: $('#reportNarrative').val(),
            officer: 'UNIT-001',
            time: new Date().toLocaleTimeString()
        };
        reports.push(report);
        saveData('report', report);
        addActivity(`New report submitted: ${report.type} by ${report.officer}`);
        updateReportList();
        this.reset();
        
        // Reset the date field to current date/time
        const now = new Date();
        $('#reportDate').val(now.toISOString().slice(0, 16));
    });

    // Initialize date fields
    const now = new Date();
    $('#reportDate').val(now.toISOString().slice(0, 16));
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    $('#warrantExpiry').val(futureDate.toISOString().slice(0, 10));
    
    // Make sure everything is visible
    $('#cad-container').show();
});

// Utility functions
function generateLicenseNumber() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function addActivity(message) {
    const activity = {
        message,
        time: new Date().toLocaleTimeString()
    };
    
    activities.unshift(activity);
    if (activities.length > 10) activities.pop();
    
    saveData('activity', activity);
    
    const activityLog = $('#activityLog');
    if (activityLog.length) {
        activityLog.html(activities.map(activity => `
            <div class="list-item">
                <span>${activity.time}</span>
                <span>${activity.message}</span>
            </div>
        `).join(''));
    }
}

// Update functions
function updateCallsList() {
    const callsList = $('#activeCallsList');
    const dashboardCalls = $('#dashboardCalls');
    
    if (!callsList.length || !dashboardCalls.length) return;
    
    const callsHTML = calls.length > 0 ? calls.map(call => `
        <div class="list-item">
            <div>
                <strong>${call.id}</strong> - ${call.type}<br>
                Location: ${call.location}<br>
                Priority: ${call.priority} | Time: ${call.time}
            </div>
            <div>
                <button onclick="assignToCall('${call.id}')">Assign</button>
                <button class="btn-danger" onclick="closeCall('${call.id}')">Close</button>
            </div>
        </div>
    `).join('') : '<div class="list-item">No active calls</div>';
    
    callsList.html(callsHTML);
    dashboardCalls.html(callsHTML);
}

function updateUnitsList() {
    const unitsList = $('#allUnitsList');
    const dashboardUnits = $('#dashboardUnits');
    
    if (!unitsList.length || !dashboardUnits.length) return;
    
    const unitsHTML = units.length > 0 ? units.map(unit => `
        <div class="list-item">
            <div>
                <strong>${unit.id}</strong> - ${unit.officer}<br>
                Location: ${unit.location}
            </div>
            <div class="unit-status status-${unit.status.toLowerCase().replace(' ', '-')}">
                ${unit.status}
            </div>
        </div>
    `).join('') : '<div class="list-item">No units available</div>';
    
    unitsList.html(unitsHTML);
    dashboardUnits.html(unitsHTML);
}

function updateBoloList() {
    const boloList = $('#boloList');
    if (!boloList.length) return;
    
    boloList.html(bolos.length > 0 ? bolos.map(bolo => `
        <div class="list-item">
            <div>
                <strong>${bolo.id}</strong> - ${bolo.type}<br>
                Subject: ${bolo.subject}<br>
                Description: ${bolo.description}<br>
                Issued by: ${bolo.issuedBy} at ${bolo.time}
            </div>
            <div>
                <button class="btn-danger" onclick="removeBolo('${bolo.id}')">Remove</button>
            </div>
        </div>
    `).join('') : '<div class="list-item">No active BOLOs</div>');
}

function updateReportList() {
    const reportList = $('#reportList');
    if (!reportList.length) return;
    
    reportList.html(reports.length > 0 ? reports.map(report => `
        <div class="list-item">
            <div>
                <strong>${report.id}</strong> - ${report.type}<br>
                Location: ${report.location}<br>
                Date: ${report.date}<br>
                Officer: ${report.officer}
            </div>
            <div>
                <button onclick="viewReport('${report.id}')">View</button>
            </div>
        </div>
    `).join('') : '<div class="list-item">No reports available</div>');
}

function updatePlayerList() {
    const playerList = $('#playerList');
    if (!playerList.length) return;
    
    playerList.html(players.length > 0 ? players.map(player => `
        <div class="list-item">
            <div>
                <strong>${player.firstName} ${player.lastName}</strong><br>
                License: ${player.license}<br>
                DOB: ${player.dob}<br>
                Gender: ${player.gender}<br>
                Address: ${player.address}<br>
                Phone: ${player.phone}
            </div>
            <div>
                <button onclick="editPlayer('${player.license}')">Edit</button>
                <button onclick="viewPlayerHistory('${player.license}')">History</button>
                <button class="btn-danger" onclick="deletePlayer('${player.license}')">Delete</button>
            </div>
        </div>
    `).join('') : '<div class="list-item">No players registered</div>');
}

function updateVehicleList() {
    const vehicleList = $('#vehicleList');
    if (!vehicleList.length) return;
    
    vehicleList.html(vehicles.length > 0 ? vehicles.map(vehicle => {
        const owner = players.find(p => p.license === vehicle.owner);
        return `
            <div class="list-item">
                <div>
                    <strong>${vehicle.plate}</strong> - ${vehicle.year} ${vehicle.make} ${vehicle.model}<br>
                    Owner: ${owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'}<br>
                    Color: ${vehicle.color}<br>
                    VIN: ${vehicle.vin}<br>
                    Status: <span class="status-${vehicle.status.toLowerCase()}">${vehicle.status}</span>
                </div>
                <div>
                    <button onclick="editVehicle('${vehicle.plate}')">Edit</button>
                    <button onclick="viewVehicleHistory('${vehicle.plate}')">History</button>
                    <button class="btn-danger" onclick="deleteVehicle('${vehicle.plate}')">Delete</button>
                </div>
            </div>
        `;
    }).join('') : '<div class="list-item">No vehicles registered</div>');
}

function updateVehicleOwnerSelect() {
    const ownerSelect = $('#vehicleOwner');
    if (!ownerSelect.length) return;
    
    ownerSelect.html('<option value="">Select Owner</option>' + 
        players.map(player => `
            <option value="${player.license}">${player.firstName} ${player.lastName} (${player.license})</option>
        `).join(''));
}

function updateTicketList() {
    const ticketList = $('#ticketList');
    if (!ticketList.length) return;
    
    ticketList.html(tickets.length > 0 ? tickets.map(ticket => {
        const player = players.find(p => p.license === ticket.playerLicense);
        return `
            <div class="list-item">
                <div>
                    <strong>${ticket.id}</strong> - ${ticket.type}<br>
                    Issued to: ${player ? `${player.firstName} ${player.lastName}` : 'Unknown'}<br>
                    Amount: $${ticket.amount}<br>
                    Location: ${ticket.location}<br>
                    Date: ${new Date(ticket.date).toLocaleString()}<br>
                    Status: <span class="status-${ticket.status.toLowerCase()}">${ticket.status}</span>
                </div>
                <div>
                    <button onclick="updateTicketStatus('${ticket.id}')">Update Status</button>
                    <button onclick="viewTicketDetails('${ticket.id}')">View Details</button>
                </div>
            </div>
        `;
    }).join('') : '<div class="list-item">No tickets issued</div>');
}

function updateWarrantList() {
    const warrantList = $('#warrantList');
    if (!warrantList.length) return;
    
    warrantList.html(warrants.length > 0 ? warrants.map(warrant => {
        const player = players.find(p => p.license === warrant.playerLicense);
        return `
            <div class="list-item">
                <div>
                    <strong>${warrant.id}</strong> - ${warrant.type}<br>
                    Issued for: ${player ? `${player.firstName} ${player.lastName}` : 'Unknown'}<br>
                    Reason: ${warrant.reason}<br>
                    Issue Date: ${new Date(warrant.issueDate).toLocaleString()}<br>
                    Expiry Date: ${warrant.expiryDate}<br>
                    Status: <span class="status-${warrant.status.toLowerCase()}">${warrant.status}</span>
                </div>
                <div>
                    <button onclick="executeWarrant('${warrant.id}')">Execute</button>
                    <button onclick="cancelWarrant('${warrant.id}')">Cancel</button>
                </div>
            </div>
        `;
    }).join('') : '<div class="list-item">No active warrants</div>');
}

function updateTicketPlayerSelect() {
    const ticketSelect = $('#ticketPlayer');
    if (!ticketSelect.length) return;
    
    ticketSelect.html('<option value="">Select Player</option>' + 
        players.map(player => `
            <option value="${player.license}">${player.firstName} ${player.lastName} (${player.license})</option>
        `).join(''));
}

function updateWarrantPlayerSelect() {
    const warrantSelect = $('#warrantPlayer');
    if (!warrantSelect.length) return;
    
    warrantSelect.html('<option value="">Select Player</option>' + 
        players.map(player => `
            <option value="${player.license}">${player.firstName} ${player.lastName} (${player.license})</option>
        `).join(''));
}

// Action functions
function assignToCall(callId) {
    const call = calls.find(c => c.id === callId);
    if (call && !call.assignedUnits.includes('UNIT-001')) {
        call.assignedUnits.push('UNIT-001');
        addActivity(`UNIT-001 assigned to ${callId}`);
        updateCallsList();
        saveToLocalStorage();
    }
}

function closeCall(callId) {
    const index = calls.findIndex(c => c.id === callId);
    if (index !== -1) {
        const call = calls[index];
        calls.splice(index, 1);
        addActivity(`Call ${callId} closed`);
        updateCallsList();
        saveToLocalStorage();
    }
}

function removeBolo(boloId) {
    const index = bolos.findIndex(b => b.id === boloId);
    if (index !== -1) {
        const bolo = bolos[index];
        bolos.splice(index, 1);
        addActivity(`BOLO ${boloId} removed`);
        updateBoloList();
        saveToLocalStorage();
    }
}

function viewReport(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (report) {
        alert(`Report ${report.id}\n\nType: ${report.type}\nLocation: ${report.location}\nDate: ${report.date}\nOfficer: ${report.officer}\n\nNarrative:\n${report.narrative}`);
    }
}

function addWarning(license) {
    const player = players.find(p => p.license === license);
    if (player) {
        const reason = prompt('Enter warning reason:');
        if (reason) {
            player.warnings++;
            player.history.push({
                type: 'warning',
                reason: reason,
                officer: 'UNIT-001',
                date: new Date().toISOString()
            });
            addActivity(`Warning added to ${player.firstName} ${player.lastName}`);
            updatePlayerList();
            saveToLocalStorage();
        }
    }
}

function updateVehicleStatus(plate) {
    const vehicle = vehicles.find(v => v.plate === plate);
    if (vehicle) {
        const newStatus = prompt('Enter new status (Valid/Expired/Stolen/Wanted):', vehicle.status);
        if (newStatus) {
            vehicle.status = newStatus;
            vehicle.history.push({
                type: 'status_change',
                oldStatus: vehicle.status,
                newStatus: newStatus,
                officer: 'UNIT-001',
                date: new Date().toISOString()
            });
            addActivity(`Vehicle ${plate} status updated to ${newStatus}`);
            updateVehicleList();
            saveToLocalStorage();
        }
    }
}

function deletePlayer(license) {
    if (confirm('Are you sure you want to delete this player?')) {
        const index = players.findIndex(p => p.license === license);
        if (index !== -1) {
            players.splice(index, 1);
            addActivity(`Player record deleted: ${license}`);
            updatePlayerList();
            saveToLocalStorage();
        }
    }
}

function deleteVehicle(plate) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        const index = vehicles.findIndex(v => v.plate === plate);
        if (index !== -1) {
            vehicles.splice(index, 1);
            addActivity(`Vehicle record deleted: ${plate}`);
            updateVehicleList();
            saveToLocalStorage();
        }
    }
}

function viewPlayerHistory(license) {
    const player = players.find(p => p.license === license);
    if (player) {
        const historyText = player.history.length > 0 ? 
            player.history.map(h => `${h.date}: ${h.type} - ${h.reason || h.description}`).join('\n') :
            'No history recorded';
        alert(`History for ${player.firstName} ${player.lastName}:\n\n${historyText}`);
    }
}

function viewVehicleHistory(plate) {
    const vehicle = vehicles.find(v => v.plate === plate);
    if (vehicle) {
        const historyText = vehicle.history.length > 0 ? 
            vehicle.history.map(h => `${h.date}: ${h.type} - ${h.oldStatus || ''} to ${h.newStatus || ''}`).join('\n') :
            'No history recorded';
        alert(`History for vehicle ${plate}:\n\n${historyText}`);
    }
}

function updateTicketStatus(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
        const newStatus = prompt('Enter new status (Paid/Unpaid/Dismissed):', ticket.status);
        if (newStatus) {
            ticket.status = newStatus;
            addActivity(`Ticket ${ticketId} status updated to ${newStatus}`);
            updateTicketList();
            saveToLocalStorage();
        }
    }
}

function viewTicketDetails(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
        const player = players.find(p => p.license === ticket.playerLicense);
        alert(`Ticket ${ticket.id}\n\nType: ${ticket.type}\nIssued to: ${player ? `${player.firstName} ${player.lastName}` : 'Unknown'}\nAmount: $${ticket.amount}\nLocation: ${ticket.location}\nDate: ${new Date(ticket.date).toLocaleString()}\nOfficer: ${ticket.officer}\nStatus: ${ticket.status}\n\nNotes:\n${ticket.notes}`);
    }
}

function executeWarrant(warrantId) {
    const warrant = warrants.find(w => w.id === warrantId);
    if (warrant) {
        warrant.status = 'Executed';
        addActivity(`Warrant ${warrantId} executed`);
        updateWarrantList();
        saveToLocalStorage();
    }
}

function cancelWarrant(warrantId) {
    const warrant = warrants.find(w => w.id === warrantId);
    if (warrant) {
        warrant.status = 'Cancelled';
        addActivity(`Warrant ${warrantId} cancelled`);
        updateWarrantList();
        saveToLocalStorage();
    }
}

// Quick issue functions from NCIC search
function issueTicket(license) {
    $('.nav-item[data-tab="tickets"]').click();
    $('#ticketPlayer').val(license);
}

function issueWarrant(license) {
    $('.nav-item[data-tab="warrants"]').click();
    $('#warrantPlayer').val(license);
}

function editPlayer(license) {
    // Future functionality
    alert("Edit player functionality coming soon");
}

function editVehicle(plate) {
    // Future functionality
    alert("Edit vehicle functionality coming soon");
}