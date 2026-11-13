const fs = require('fs');
const path = require('path');

// File path
const file = path.join(__dirname, '../data/vehicles.json');

// Read vehicles from JSON file
function readVehicles() {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '[]');
    }

    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data || '[]');
}

// Save vehicles to JSON file
function saveVehicles(vehicles) {
    fs.writeFileSync(file, JSON.stringify(vehicles, null, 2));
}

// Find vehicle by ID
function findById(id) {
    const vehicles = readVehicles();
    return vehicles.find(vehicle => String(vehicle.id) === String(id));
}

// Handle API requests
function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[1];
    const method = req.method;

    function send(status, data) {
        res.writeHead(status, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(data));
    }

    function readBody(callback) {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                callback(JSON.parse(body || '{}'));
            } catch (error) {
                send(400, { message: 'Invalid JSON data' });
            }
        });
    }

    try {
        // GET all vehicles
        if (method === 'GET' && !id) {
            return send(200, readVehicles());
        }

        // GET vehicle by ID
        if (method === 'GET' && id) {
            const vehicle = findById(id);

            if (!vehicle) {
                return send(404, {
                    message: 'Vehicle not found'
                });
            }

            return send(200, vehicle);
        }

        // POST new vehicle
        if (method === 'POST' && !id) {
            return readBody(data => {
                const vehicles = readVehicles();

                const newVehicle = {
                    id: Date.now().toString(),
                    ...data
                };

                vehicles.push(newVehicle);
                saveVehicles(vehicles);

                send(201, newVehicle);
            });
        }

        // PUT update vehicle
        if (method === 'PUT' && id) {
            return readBody(data => {
                const vehicles = readVehicles();

                const index = vehicles.findIndex(
                    vehicle => String(vehicle.id) === String(id)
                );

                if (index === -1) {
                    return send(404, {
                        message: 'Vehicle not found'
                    });
                }

                vehicles[index] = {
                    ...vehicles[index],
                    ...data,
                    id: vehicles[index].id
                };

                saveVehicles(vehicles);

                send(200, vehicles[index]);
            });
        }

        // DELETE vehicle
        if (method === 'DELETE' && id) {
            const vehicles = readVehicles();

            const index = vehicles.findIndex(
                vehicle => String(vehicle.id) === String(id)
            );

            if (index === -1) {
                return send(404, {
                    message: 'Vehicle not found'
                });
            }

            const deletedVehicle = vehicles.splice(index, 1)[0];

            saveVehicles(vehicles);

            return send(200, {
                message: 'Vehicle deleted successfully',
                vehicle: deletedVehicle
            });
        }

        return send(405, {
            message: 'Method not allowed'
        });

    } catch (error) {
        return send(500, {
            message: 'Internal server error'
        });
    }
}

// Export required functions
module.exports = {
    path: '/vehicles',
    handle,
    findById
};