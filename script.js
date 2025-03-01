const EMERGENCY_CONTACT = '+919799353544'; // Ensure this matches the .env file
const emergencyBtn = document.getElementById('emergency-btn');
const locationInfo = document.getElementById('location-info');
const statusElement = document.getElementById('status');

let currentLocation = null;

function init() {
    getLocation();
    emergencyBtn.addEventListener('click', handleEmergency);
}

function getLocation() {
    if (!navigator.geolocation) {
        showStatus('Geolocation is not supported by your browser', 'error');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            locationInfo.innerHTML = `
                <p>Location access granted</p>
                <small>Latitude: ${currentLocation.lat.toFixed(6)}, 
                       Longitude: ${currentLocation.lng.toFixed(6)}</small>
            `;

            emergencyBtn.disabled = false;
        },
        (error) => {
            showStatus('Error: Please enable location access', 'error');
            console.error('Location error:', error);
        }
    );
}

async function sendEmergencyMessage() {
    const locationLink = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
    const message = `EMERGENCY ALERT! My current location: ${locationLink}`;

    try {
        const response = await fetch('http://localhost:3001/api/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: EMERGENCY_CONTACT,
                message: message
            })
        });
        
        

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send emergency message');
        }

        return data;
    } catch (error) {
        console.error('Failed to send SMS:', error);
        throw error;
    }
}

async function handleEmergency() {
    if (!currentLocation) {
        showStatus('Location not available', 'error');
        return;
    }

    setLoading(true);

    try {
        await sendEmergencyMessage();
        showStatus('Emergency alert sent successfully!', 'success');

        window.location.href = 'tel:108';
    } catch (error) {
        showStatus('Failed to send emergency alert. Please call emergency services directly.', 'error');
        // sendEmergencyMessage();

    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    emergencyBtn.disabled = isLoading;
    emergencyBtn.innerHTML = isLoading ? '🔄 Sending Alert...' : '🚨 Emergency Alert';
}

function showStatus(message, type) {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
}

document.addEventListener('DOMContentLoaded', init);
