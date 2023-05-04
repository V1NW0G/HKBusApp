import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView} from 'react-native';
import axios from 'axios';

const Home = () => {

  const [data,setData] = useState([]);

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
        <Text>hi</Text>
        <TouchableOpacity onPress={fetchData}>
            <Text>This</Text>
        </TouchableOpacity>



    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

export default Home;
