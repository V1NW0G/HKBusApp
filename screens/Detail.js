import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';

const Detail = ({ route }) => {
  const { route: routeName, serviceType, stopId } = route.params;
  const [time, setTime] = useState([]);
  const [busGeo, setBusGeo] = useState({ lat: "", long: "" });

  const fetchData = () => {
    axios.get(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${routeName}/${serviceType}`)
      .then(response => {
        setTime(response.data.data);
      })
      .catch(error => {
        console.error(error);
      });
  }

  const fetchLocation = () => {
    axios.get(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopId}`)
      .then(response => {
        const { lat, long } = response.data.data;
        setBusGeo({ lat, long });
      })
      .catch(error => {
        console.error(error);
      });
  }

  useEffect(() => {
    fetchData();
    fetchLocation();
  }, []);

  return (
    <View>
      <Text>Route: {routeName}</Text>
      <Text>Service Type: {serviceType}</Text>
      <Text>Stop Id: {stopId}</Text>
      <View>
        <Text>{busGeo.lat}</Text>
        <Text>{busGeo.long}</Text>
      </View>

      <MapView style={{ height: 300, width: "100%" }} region={{ latitude: busGeo.lat, longitude: busGeo.long, latitudeDelta: 0.0022, longitudeDelta: 0.021 }}>
        <Marker coordinate={{ latitude: busGeo.lat, longitude: busGeo.long }} />
      </MapView>

      {time.map(item2 => (
        <View>
          <Text>{item2.eta}</Text>
        </View>
      ))}
    </View>
  );
};

export default Detail;
