import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView} from 'react-native';
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";

const Listing = () => {

  const [data,setData] = useState([]);
  const navigation = useNavigation();

  const fetchData = () => {
    axios.get('https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/BFA3460955AC820C')
    .then(response => {
        setData(response.data.data);
    })
    .catch(error => {
        console.error(error);
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
        
        <ScrollView>
            {data.map(item => (
                <TouchableOpacity onPress={() => navigation.navigate("Detail", { 
                        route: item.route,
                        serviceType: item.service_type,
                        stopId: "BFA3460955AC820C"
                    })}>
                    <View>
                        <Text>{item.route}</Text>
                        <Text>{item.dest_tc}</Text>
                        <Text>{item.eta}</Text>
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