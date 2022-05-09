
import { useEffect, useState, useRef } from 'react';
import './App.css';
import * as tt from '@tomtom-international/web-sdk-maps'

const App=()=> {
  const mapElement = useRef();
  const [map, setMap]= useState({});
  const [longitude, setLongitude] = useState(19.94);
  const [latitude, setLatitude] = useState(50.08);
  useEffect(()=>{
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

    const element = document.createElement('div')
    element.className = 'marker'
    
    const marker= new tt.Marker({
      draggable:true,
      element:element,

    })
  }

  return()=>map.remove()
  }, [longitude,latitude])
  return (
    <div className="App">
      <div ref={mapElement} className="map">
        <h1>Gdzie jestes?</h1>
        <input type="text" id="longitude" className="longitude" placeholder="Podaj swoją długość geograficzną." onChange={e=>{setLongitude(e.target.value)}}/>

        <input type="text" id="longitude" className="longitude" placeholder="Podaj swoją szerokość geograficzną." onChange={e=>{setLongitude(e.target.value)}}/>
      </div>
    </div>
  );
}

export default App;
