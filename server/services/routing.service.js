/**
 * Routing service - Google Maps Directions API integration
 * Falls back to straight-line distance if API key not configured
 */
const { haversineDistance } = require('./fairness.service');

const getRoute = async (origin, destination, waypoints = []) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    // Fallback: calculate straight-line distance
    return getMockRoute(origin, destination, waypoints);
  }

  try {
    const waypointStr = waypoints.length
      ? `&waypoints=${waypoints.map((w) => `${w.lat},${w.lng}`).join('|')}`
      : '';

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}${waypointStr}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        success: true,
        distance: leg.distance.text,
        duration: leg.duration.text,
        encodedPolyline: route.overview_polyline.points,
        steps: leg.steps.map((s) => ({
          instruction: s.html_instructions,
          distance: s.distance.text,
          duration: s.duration.text,
        })),
      };
    }

    return getMockRoute(origin, destination, waypoints);
  } catch (error) {
    console.error('Routing error:', error.message);
    return getMockRoute(origin, destination, waypoints);
  }
};

const getMockRoute = (origin, destination, waypoints) => {
  const distance = haversineDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );

  return {
    success: true,
    distance: `${distance.toFixed(1)} km`,
    duration: `${Math.round(distance * 3)} mins`,
    encodedPolyline: '',
    steps: [],
    isMock: true,
  };
};

/**
 * Calculate optimal: volunteer → donor → NGO path
 */
const getPickupRoute = async (volunteerLocation, donorLocation, ngoLocation) => {
  return getRoute(
    volunteerLocation,
    ngoLocation,
    [donorLocation]
  );
};

module.exports = { getRoute, getPickupRoute };
