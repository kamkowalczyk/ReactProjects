
import { useEffect, useState, useRef } from 'react';
import './App.css';
import * as tt from '@tomtom-international/web-sdk-maps'
import * as ttapi from '@tomtom-international/web-sdk-services'
import '@tomtom-international/web-sdk-maps/dist/maps.css'

const App=()=> {
  const mapElement = useRef();
  const [map, setMap]= useState({});
  const [longitude, setLongitude] = useState(19.94);
  const [latitude, setLatitude] = useState(50.08);

  const convertToPoints = (lngLat)=>{
return{
  point:{
    latitude:lngLat.lat,
    longitude:lngLat.lng
  }
}
  }
  const drawRoute = (geoJson, map) => {
    if (map.getLayer('route')) {
      map.removeLayer('route')
      map.removeSource('route')
    }
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geoJson
      },
      paint: {
        'line-color': '#4a90e2',
        'line-width': 6
  
      }
    })
  }

  const addDeliveryMarker = (lngLat, map) => {
    const element = document.createElement('div')
    element.className = 'marker-delivery'
    new tt.Marker({
      element: element
    })
    .setLngLat(lngLat)
    .addTo(map)
  }

  useEffect(() => {
    const origin = {
      lng: longitude,
      lat: latitude,
    }
  const destinations = []

    let map = tt.map({
      key: process.env.REACT_APP_DISTANCE_API_KEY,
      container:mapElement.current,
      stylesVisibility:{
        trafficIncidents:true,
        trafficFlow:true,
      },
      center:[longitude,latitude],
      zoom:14
  });
  setMap(map);
  
  const addMarker = ()=>{
    const popupOffSet={
      bottom:[0,-25]
    }
    const popup = new tt.Popup({
      offset:popupOffSet
    }).setHTML("Tutaj jesteś Ty!")
    const element = document.createElement('div')
    element.className = 'marker'


     const marker = new tt.Marker({
      draggable:true,
      element:element,
    })
    .setLngLat([longitude,latitude])
    .addTo(map)

    marker.on('dragend', ()=>{
     const lngLat =  marker.getLngLat()
     setLongitude(lngLat.lng)
     setLatitude(lngLat.lat)
    })
    marker.setPopup(popup).togglePopup()
  }
  addMarker();

  const sortDestinations = (locations) => {
    const pointsForDestinations = locations.map((destination) => {
      return convertToPoints(destination)
    })
    const callParameters = {
      key: process.env.REACT_APP_DISTANCE_API_KEY,
      destinations: pointsForDestinations,
      origins: [convertToPoints(origin)],
    }

  return new Promise((resolve, reject) => {
    ttapi.services
      .matrixRouting(callParameters)
      .then((matrixAPIResults) => {
        const results = matrixAPIResults.matrix[0]
        const resultsArray = results.map((result, index) => {
          return {
            location: locations[index],
            drivingtime: result.response.routeSummary.travelTimeInSeconds,
          }
        })
        resultsArray.sort((a, b) => {
          return a.drivingtime - b.drivingtime
        })
        const sortedLocations = resultsArray.map((result) => {
          return result.location
        })
        resolve(sortedLocations)
      })
    })
  }

  const recalculateRoutes = () => {
    sortDestinations(destinations).then((sorted) => {
      sorted.unshift(origin)

      ttapi.services
        .calculateRoute({
          key: process.env.REACT_APP_DISTANCE_API_KEY,
          locations: sorted,
        })
        .then((routeData) => {
          const geoJson = routeData.toGeoJson()
          drawRoute(geoJson, map)
      })
    })
  }

  map.on('click', (e) => {
    destinations.push(e.lngLat)
    addDeliveryMarker(e.lngLat, map)
    recalculateRoutes()
  })

  return()=>map.remove()
  }, [longitude,latitude])
  return (
    <>
    {map  &&(<div className="App">
      <div ref={mapElement} className="map"/>
  
        <h1>Gdzie jestes?</h1>
        <div className="co-ordinates">
        <input type="text" id="longitude" className="longitude" placeholder="Podaj swoją długość geograficzną." onChange={e=>{setLongitude(e.target.value)}}/>

        <input type="text" id="longitude" className="longitude" placeholder="Podaj swoją szerokość geograficzną." onChange={e=>{setLongitude(e.target.value)}}/>
        </div>
      </div>
   )}
    </>
  );
}

export default App;
