import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import moment from "moment";

const Detail = ({ route }) => {
  const { route: routeName, serviceType, stopId, bound , destination} = route.params;
  const [time, setTime] = useState([]);
  const [busGeo, setBusGeo] = useState({ lat: "", long: "" });
  const [busStopJson, setBusStopJson] = useState([]);
  const [busStopInfoJson, setBusStopInfoJson] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimeData = () => {
    axios.get(`https://data.etabus.gov.hk/v1/transport/kmb/route-eta/${routeName}/${serviceType}`)
      .then(response => {
        const filteredTime = response.data.data.filter(
          (response) => response.dir === bound
        );
        setTime(filteredTime);
       
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

  const BusStopLocation = async () => {
    await axios.get('https://data.etabus.gov.hk/v1/transport/kmb/route-stop')
      .then((response) => {
        const filteredStops = response.data.data.filter(
          (response) => response.route === routeName && response.bound === bound
        );
        setBusStopJson(filteredStops);
      
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchStop = async () => {
      await axios.get(`https://data.etabus.gov.hk/v1/transport/kmb/stop`)
      .then(response => {
        const {data} = response.data;
        setBusStopInfoJson(data);
        console.log(busStopJson)
      })
      .catch(error => {
        console.error(error);
      });

      
  };

  function stopIdtoName(stopid){
    const stopInfo = busStopInfoJson.find(stop => stop.stop === stopid);
    const stopName = stopInfo ? stopInfo.name_tc : 'Unknown Stop';
    // console.log(stopName)
    return stopName;
  }

  function getLocation(stopid){
    const selectedStop = busStopInfoJson.find(stop => stop.stop == stopid);
    const { lat, long } = selectedStop; 
    setBusGeo({ lat, long });
  }

  function formatEtaDate(dateString,remark) {
    if(dateString != null){
      const current = moment();
      const diff = moment.duration(moment(dateString).diff(current)); 
      const minutes = diff.asMinutes();
      const minutesLeft = Math.floor(minutes)
      if(minutesLeft<=0){
        return "-- "
      }
      return minutesLeft+" "
    }else{ //show error if no bus

      if(remark != ""){
        return remark

      }else{
        return "沒有預定班次"
      }
    }
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // busStop.forEach(stopId => fetchCoordinates(stopId));

  useEffect(() => {
    fetchTimeData();
    fetchLocation();
    BusStopLocation();
    fetchStop();
  }, [refreshing]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTittle}>{routeName}</Text>
        <Text style={styles.topTittle2}> 往</Text>
        <Text style={styles.topTittle}>{destination}</Text>
      </View>
      <MapView style={{ height: 300, width: "100%" }} region={{ latitude: busGeo.lat, longitude: busGeo.long, latitudeDelta: 0.002, longitudeDelta: 0.021 }}>
        <Marker 
          coordinate={{ latitude: busGeo.lat, longitude: busGeo.long }}
        />
      </MapView>


      {/* {time.map(item => (
        <View>
          <Text>{item.eta}</Text>
        </View>
      ))} */}

      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

      {busStopJson.map((item, index) => (
        item.route === routeName && item.bound === bound && (
          <View key={index}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedStop(selectedStop === index ? null : index);
                getLocation(item.stop);
              }}
            >
              <View style={styles.itemContainer}>
                <Text style={styles.itemText}>{item.seq}.</Text>
                <Text style={styles.itemText}>{stopIdtoName(item.stop)}</Text>
              </View>
            </TouchableOpacity>

            {selectedStop === index && (
              time.map(time => (
              time.seq == item.seq &&(
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatEtaDate(time.eta)!=null?formatEtaDate(time.eta):time.rmk_tc}</Text>
                <Text style={styles.timeMinsText}>{formatEtaDate(time.eta)!=null?"分鐘":""}</Text>
                <Text style={styles.timeRemarkText}>{time.rmk_tc}</Text>
              </View>
              )))
            )}
          </View>
        )
      ))}
    </ScrollView>
      

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
  },

  itemContainer: {
    flexDirection: "row",
    borderColor: "lightgray",
    borderTopWidth: 0.5,
    alignItems: "center",
  },

  itemText: {
    marginHorizontal: 5,
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 20,
  },

  timeContainer: {
    flexDirection: "row",
    paddingBottom: 20,
    alignSelf: "center"
  },

  timeText: {
    fontSize: 18,
  },

  timeMinsText: {
    fontSize: 11,
    alignSelf: "flex-end"
  },

  timeRemarkText: {
    fontSize: 16,
    color: "gray",
    alignSelf: "flex-end",
    paddingLeft: 5 
  },

  topBar: { 
    flexDirection: "row",
    alignSelf: "center"
  },

  topTittle: { 
    fontSize: 20,
    paddingLeft: 5,
    paddingTop:5,
    paddingBottom:5,
  },

  topTittle2: { 
    fontSize: 14,
    alignSelf: "center"
  },

});

export default Detail;
