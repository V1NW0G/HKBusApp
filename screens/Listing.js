import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, RefreshControl} from 'react-native';
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
// import { getLocales } from "react-native-localize";



const Listing = () => {

  const [data,setData] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    axios.get('https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/BFA3460955AC820C')
    .then(response => {
        // Create an object where each key represents a unique route and the value is an array of all the ETAs for that route
        const routeMap = {};
        response.data.data.forEach(item => {
            if (!routeMap[item.route]) {
                routeMap[item.route] = [];
            }
            routeMap[item.route].push(item.eta);
        });

        // Sort each array of ETAs in ascending order and take the first element as the earliest ETA
        const earliestETAs = [];
        for (const route in routeMap) {
            routeMap[route].sort();

            const eta = routeMap[route][0];
            const current = moment();
            const diff = moment.duration(moment(eta).diff(current));
            const minutes = diff.asMinutes();
            console.log(minutes)

            earliestETAs.push({
                route: route,
                dest_tc: response.data.data.find(item => item.route === route).dest_tc,
                serviceType: response.data.data.find(item => item.route === route).service_type,
                eta: routeMap[route][0],
                minutesLeft: minutes
            });
        }

        setData(earliestETAs);
    })
    .catch(error => {
        console.error(error);
    });
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);


  useEffect(() => {
    fetchData();
    console.log(data);
  }, [refreshing]);



  return (
    <View style={styles.container}>
        
        <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            
            {data.map(item => (
                <TouchableOpacity onPress={() => navigation.navigate("Detail", { 
                        route: item.route,
                        serviceType: item.serviceType,
                        stopId: "BFA3460955AC820C"
                    })}>
                    <View>
                        <Text>{item.route}</Text>
                        <Text>{item.dest_tc}</Text>
                        {/* <Text>{item.eta}</Text> */}
                        <Text>{item.minutesLeft !== null && item.minutesLeft >= 0 ? `${Math.floor(item.minutesLeft)} 分鐘` : '暫時沒有班次'}</Text>
                        <Text> </Text>
                    </View>
                </TouchableOpacity>
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
});

export default Listing;
