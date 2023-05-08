import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, RefreshControl} from 'react-native';
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
// import { getLocales } from "react-native-localize";

const Listing = () => {
  const [stop, setStop] = useState(["BFA3460955AC820C","5FB1FCAF80F3D97D"]);
  const [data,setData] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);


    const fetchData = async () => {
      const requests = stop.map(stopId => axios.get(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stopId}`));
      console.log(requests)
      const responses = await Promise.all(requests);
      const responseData = responses.map(response => response.data.data);
      const mergedData = responseData.flat(); // merge data from both bus stops into a single array
      setData(mergedData);
    }

    function formatEtaDate(dateString,remark) {
      if(dateString != null){
        const current = moment();
        const diff = moment.duration(moment(dateString).diff(current)); 
        const minutes = diff.asMinutes();
        const minutesLeft = Math.floor(minutes)
        if(minutesLeft<=0){
          return "-- mins"
        }
        return minutesLeft+" mins"
      }else{ //show error if no bus

        if(remark != ""){
          // return remark
          return "⛔"

        }else{
          // return "沒有預定班次"
          return "⛔️"
        }
      }
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
                <TouchableOpacity 
                    activeOpacity={0.8}
                
                    onPress={() => navigation.navigate("Detail", { 
                        route: item.route,
                        serviceType: item.service_type,
                        stopId: "BFA3460955AC820C",
                        bound: item.dir,
                        destination: item.dest_tc
                    })}>
                      
                    {/* filter result shown only one by nearest time */}
                    {item.eta_seq === 1 && (
                    <View style={styles.itemContainer}>
                        <Text style={styles.routeText}>{item.route}</Text>
                        <Text style={styles.destText}>{item.dest_tc}</Text>
                        
                        <Text style={styles.etaText}>{formatEtaDate(item.eta,item.rmk_tc)}</Text>
                        <Text> </Text>
                    </View>
                    )}
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

    itemContainer: {
      flexDirection: "row",
      borderColor: "lightgray",
      borderBottomWidth: 0.5,
      justifyContent: "space-between",
      padding: 10,
      paddingTop: 15,
      paddingBottom:15,
      paddingLeft: 20,
      paddingRight: -30,
    },

    routeText: {
      fontSize: "20",
      fontWeight: "bold"
    },

    destText: {
      fontSize: "20",
      paddingLeft: 40

    },

    etaText: {
      fontSize: "20",
      paddingLeft: 50
    }


});

export default Listing;