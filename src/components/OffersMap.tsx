import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

interface OfferLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
  price_before?: number;
  distance_km?: string;
  image_url: string;
  discount: number;
}

interface OffersMapProps {
  userLocation: { lat: number; lng: number } | null;
  offers: OfferLocation[];
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onOfferClick: (offerId: string) => void;
  centerLat?: number;
  centerLng?: number;
  highlightOfferId?: string;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

// Fix Leaflet default icon issue with Vite
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const highlightIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const isValidCoordinate = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const isValidLatLng = (lat: any, lng: any): boolean => {
  return isValidCoordinate(lat) && isValidCoordinate(lng) &&
         lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (isValidLatLng(center[0], center[1])) {
      map.setView(center, zoom);
    } else {
      map.setView([46.5, 3], 6);
    }
  }, [center, zoom, map]);

  return null;
};

export const OffersMap: React.FC<OffersMapProps> = ({
  userLocation,
  offers,
  radiusKm,
  onRadiusChange,
  onOfferClick,
  centerLat,
  centerLng,
  highlightOfferId,
  onLocationUpdate
}) => {
  if (!Array.isArray(offers)) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Erreur de données
        </h3>
        <p className="text-gray-600">
          Les données des offres ne sont pas disponibles.
        </p>
      </div>
    );
  }

  const [mapCenter, setMapCenter] = useState<[number, number]>([46.5, 3]); // France center default
  const [mapZoom, setMapZoom] = useState(6);
  const [locating, setLocating] = useState(false);
  const [localUserLocation, setLocalUserLocation] = useState<{ lat: number; lng: number } | null>(userLocation);

  useEffect(() => {
    setLocalUserLocation(userLocation);
  }, [userLocation]);

  useEffect(() => {
    const effectiveUserLocation = localUserLocation || userLocation;

    if (isValidLatLng(centerLat, centerLng)) {
      setMapCenter([centerLat!, centerLng!]);
      setMapZoom(15);
    } else if (effectiveUserLocation && isValidLatLng(effectiveUserLocation.lat, effectiveUserLocation.lng)) {
      setMapCenter([effectiveUserLocation.lat, effectiveUserLocation.lng]);
      setMapZoom(radiusKm <= 10 ? 13 : radiusKm <= 20 ? 11 : radiusKm <= 30 ? 10 : 9);
    } else if (Array.isArray(offers) && offers.length > 0 && isValidLatLng(offers[0].lat, offers[0].lng)) {
      setMapCenter([offers[0].lat, offers[0].lng]);
      setMapZoom(12);
    } else {
      setMapCenter([46.5, 3]);
      setMapZoom(6);
    }
  }, [localUserLocation, userLocation, radiusKm, centerLat, centerLng, offers]);

  const radiusOptions = [10, 20, 30, 40, 50];

  const handleActivateLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocalUserLocation(newLocation);
          setMapCenter([newLocation.lat, newLocation.lng]);
          setMapZoom(13);
          setLocating(false);
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocating(false);
    }
  };

  const effectiveUserLocation = localUserLocation || userLocation;

  const hasValidMapCenter = isValidLatLng(mapCenter[0], mapCenter[1]);
  const hasAnyGeographicData =
    hasValidMapCenter ||
    (effectiveUserLocation && isValidLatLng(effectiveUserLocation.lat, effectiveUserLocation.lng)) ||
    (offers.length > 0 && offers.some(offer => isValidLatLng(offer.lat, offer.lng)));

  if (!hasAnyGeographicData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucune donnée géographique disponible
        </h3>
        <p className="text-gray-600 mb-4">
          Aucune offre avec position GPS n'est disponible pour le moment.
        </p>
        {!effectiveUserLocation && (
          <button
            onClick={handleActivateLocation}
            disabled={locating}
            className="px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locating ? 'Localisation...' : 'Activer ma position'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Radius Selector */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Search Radius:</span>
          </div>
          <div className="flex space-x-2">
            {!effectiveUserLocation && (
              <button
                onClick={handleActivateLocation}
                disabled={locating}
                className="px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mr-2"
              >
                {locating ? 'Localisation...' : 'Activer ma position'}
              </button>
            )}
            {radiusOptions.map((radius) => (
              <button
                key={radius}
                onClick={() => onRadiusChange(radius)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  radiusKm === radius
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {radius} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[500px]">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Circle */}
          {effectiveUserLocation && isValidLatLng(effectiveUserLocation.lat, effectiveUserLocation.lng) && (
            <Circle
              center={[effectiveUserLocation.lat, effectiveUserLocation.lng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          )}

          {/* User Marker */}
          {effectiveUserLocation && isValidLatLng(effectiveUserLocation.lat, effectiveUserLocation.lng) && (
          <Marker position={[effectiveUserLocation.lat, effectiveUserLocation.lng]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-green-600">Your Location</p>
                <p className="text-sm text-gray-600">Search radius: {radiusKm} km</p>
              </div>
            </Popup>
          </Marker>
          )}

          {/* Offer Markers */}
          {Array.isArray(offers) && offers.filter(offer => offer && isValidLatLng(offer.lat, offer.lng)).map((offer) => (
            <Marker
              key={offer.id}
              position={[offer.lat, offer.lng]}
              icon={highlightOfferId === offer.id ? highlightIcon : undefined}
              eventHandlers={{
                click: () => onOfferClick(offer.id)
              }}
            >
              <Popup>
                <div className="w-64">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h4 className="font-bold text-gray-900 mb-1">{offer.title}</h4>
                  {offer.distance_km && (
                    <p className="text-sm text-gray-600 mb-2">{offer.distance_km} km away</p>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">${offer.price.toFixed(2)}</span>
                      {offer.price_before && (
                        <span className="text-sm text-gray-400 line-through">
                          ${offer.price_before.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      -{offer.discount}%
                    </span>
                  </div>
                  <button
                    onClick={() => onOfferClick(offer.id)}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    View Offer
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{Array.isArray(offers) ? offers.length : 0}</span> offer{(Array.isArray(offers) && offers.length !== 1) ? 's' : ''} within {radiusKm} km
          </span>
          {Array.isArray(offers) && offers.length === 0 && (
            <span className="text-orange-600 font-medium">
              Try increasing the search radius
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
